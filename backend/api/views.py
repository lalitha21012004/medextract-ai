import requests
import random
from django.shortcuts import render
from rest_framework import status,permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import io
from .models import CustomUser, MedicalReport, OTPRequest, ExtractedParameter
from .serializers import (
    CustomUserSerializer, ExtractedParameterSerializer, MedicalReportSerializer,
    OTPSendSerializer, OTPVerifySerializer
)
from .services.ai_service import generate_medical_summary,answer_patient_question
from django.core.exceptions import ValidationError
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .tasks import process_medical_report_task
from rest_framework.permissions import AllowAny
import pdfplumber

class MedicalReportUploadView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = MedicalReportSerializer(data=request.data)
        if serializer.is_valid():
            try:
                report_user = request.user if request.user.is_authenticated else None
                report = serializer.save(user=report_user)

                # Extract text safely from cloud storage stream
                extracted_text = ""
                try:
                    # Read file bytes from S3 storage and load into an in-memory stream
                    file_bytes = report.report_file.read()
                    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                        for page in pdf.pages:
                            text = page.extract_text()
                            if text:
                                extracted_text += text + "\n"
                except Exception as pdf_err:
                    print(f"PDF Extraction Error: {pdf_err}")

                report.extracted_text = extracted_text
                report.save()

                # Dispatch background processing task to Gemini AI / Celery
                process_medical_report_task.delay(report.id)

                response_serializer = MedicalReportSerializer(report)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except ValidationError as e:
                return Response(
                    {"error": e.message_dict.get("report_file", [str(e)]) if hasattr(e, "message_dict") else str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from django.core.mail import send_mail
from .models import OTPRequest
from .serializers import OTPSendSerializer

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            email = serializer.validated_data.get('email', '')
            otp_code = OTPRequest.generate_otp()

            # Save OTP entry with expiration timestamp
            OTPRequest.objects.create(phone_number=phone, otp_code=otp_code)

            # Industry Pattern: Trigger multi-channel transactional notification (Email Backup)
            if email:
                try:
                    send_mail(
                        subject='[MedExtract AI] Your Security Verification Code',
                        message=f'Your verification code is: {otp_code}. It will expire in 5 minutes.',
                        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@medextract.ai'),
                        recipient_list=[email],
                        fail_silently=True,
                    )
                except Exception as e:
                    print(f"Email OTP Dispatch Error: {e}")

            # Structured API Response
            response_payload = {
                "message": f"Verification code dispatched to {phone}",
                "expires_in_seconds": 300,
            }

            # If in Development/Staging environment, expose the OTP helper payload
            if settings.DEBUG:
                response_payload["otp_demo"] = otp_code
                response_payload["dev_mode"] = True

            return Response(response_payload, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            otp = serializer.validated_data['otp']

            record = OTPRequest.objects.filter(
                phone_number=phone,
                otp_code=otp,
                is_verified=False
            ).last()

            if record and not record.is_expired:
                record.is_verified = True
                record.save()

                user, _ = CustomUser.objects.get_or_create(
                    username=phone,
                    defaults={'phone_number': phone, 'is_phone_verified': True}
                )
                #Generate JWT tokens

                refresh=RefreshToken.for_user(user)
                return Response({
                    "message": "Verification successful",
                    "access":str(refresh.access_token),
                    "refresh":str(refresh),
                    "user_id": user.id
                }, status=status.HTTP_200_OK)

            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MedicalReportListView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def get(self,request):

        #Retrieve all reports belonging to the logged-in user
        reports=MedicalReport.objects.filter(user=request.user).order_by('-uploaded_at')
        serializer=MedicalReportSerializer(reports,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

class MedicalReportDetailView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def get(self,request,pk):
        try:
            report=MedicalReport.objects.get(pk=pk,user=request.user)
            serializer=MedicalReportSerializer(report)
            return Response(serializer.data,status=status.HTTP_200_OK)
        except MedicalReport.DoesNotExist:
            return Response({"error":"Report not found"},status=status.HTTP_404_NOT_FOUND)



class ReportAISummaryView(APIView):
    """Generates or retrieves an AI summary for a specific medical report."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            report = MedicalReport.objects.get(pk=pk, user=request.user)
        except MedicalReport.DoesNotExist:
            return Response({"error": "Medical report not found"}, status=status.HTTP_404_NOT_FOUND)

        # Return existing summary if already saved to avoid redundant API calls
        if report.ai_summary:
            return Response({
                "report_id": pk,
                "ai_summary": report.ai_summary
            }, status=status.HTTP_200_OK)

        try:
            # Safely grab parameters using related manager name or values fallback
            parameters = report.extracted_parameters.all() if hasattr(report, 'extracted_parameters') else report.parameters.all()
            serializer = ExtractedParameterSerializer(parameters, many=True)
            
            # Generate summary via Gemini AI utility
            summary = generate_medical_summary(serializer.data)
            
            # Persist summary to model instance
            report.ai_summary = summary
            report.save()

            return Response({
                "report_id": pk,
                "ai_summary": summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Graceful fallback response to prevent a hard 500 crash on high-demand AI errors
            fallback_summary = (
                "### Key Findings Summary\n"
                "Your report was uploaded successfully, but the AI clinical summary service is temporarily busy.\n\n"
                "### Parameter Overview\n"
                "Please review the extracted metrics table below for your specific test values."
            )
            return Response({
                "report_id": pk,
                "ai_summary": fallback_summary
            }, status=status.HTTP_200_OK)


class ReportAIChatView(APIView):
    """Answers patient questions grounded in report context."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            report = MedicalReport.objects.get(pk=pk, user=request.user)
        except MedicalReport.DoesNotExist:
            return Response({"error": "Medical Report not Found"}, status=status.HTTP_404_NOT_FOUND)

        question = request.data.get("question")
        if not question:
            return Response({"error": "field 'question' is required"}, status=status.HTTP_400_BAD_REQUEST)

        parameters = report.extracted_parameters.all() if hasattr(report, 'extracted_parameters') else report.parameters.all()
        serializer = ExtractedParameterSerializer(parameters, many=True)

        try:
            answer = answer_patient_question(serializer.data, question)
            return Response({
                "report_id": pk,
                "question": question,
                "answer": answer
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to get AI answer: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
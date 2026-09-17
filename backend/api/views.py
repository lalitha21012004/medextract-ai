from django.shortcuts import render
import random

from rest_framework import status,generics,permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser,FormParser
from .models import CustomUser,MedicalReport,OTPRequest
from .serializers import(
    CustomUserSerializer,MedicalReportSerializer,
    OTPSendSerializer,OTPVerifySerializer
)

class SendOTPView(APIView):
    permission_classes=[permissions.AllowAny]

    def post(self,request):
        serializer=OTPSendSerializer(data=request.data)
        if serializer.is_valid():
            phone=serializer.validated_data['phone_number']
            otp_code=str(random.randint(100000,999999))

            OTPRequest.objects.create(phone_number=phone,otp=otp_code)

            return Response({
                "message":"OTP generated successfully",
                "otp_demo":otp_code
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes=[permissions.AllowAny]

    def post(self,request):
        serializer=OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            phone=serializer.validated_data['phone_number']
            otp=serializer.validated_data['otp']

            record=OTPRequest.objects.filter(phone_number=phone,otp=otp,is_verified=False).last()
            if record:
                record.is_verified=True
                record.save()

                user,_=CustomUser.objects.get_or_create(
                    username=phone,
                    defaults={'phone_number':phone,'is_phone_verified':True}

                )
                return Response({
                    "message":"Verification successful",
                    "user_id":user.id
                },status=status.HTTP_200_OK)

            return Response({"error":"Invalid or expired OTP"},status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class MedicalReportUploadView(generics.CreateAPIView):
    serializer_class=MedicalReportSerializer
    parser_classes=(MultiPartParser,FormParser)
    permission_classes=[permissions.AllowAny]

    def perform_create(self, serializer):
       user=self.request.user if self.request.user.is_authenticated else CustomUser.objects.first()
       serializer.save(user=user)
       


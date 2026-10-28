from rest_framework import serializers
from .models import CustomUser,MedicalReport,ExtractedParameter,OTPRequest


class CustomUserSerializer(serializers.ModelSerializer):
    bmi=serializers.ReadOnlyField()
    bmi_category=serializers.ReadOnlyField()

    class Meta:
        model=CustomUser
        fields=[
            'id','username','email','phone_number',
            'blood_group','emergency_contact','height_cm',
            'weight_kg','bmi','bmi_category','is_phone_verified'
        ]

class ExtractedParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model=ExtractedParameter
        fields=[
            'id','category','parameter_name','observed_value',
            'unit','reference_range','normal_baseline','risk_level',
            'deviation_percentage','possible_symptoms'
        ]

class MedicalReportSerializer(serializers.ModelSerializer):
    parameters=ExtractedParameterSerializer(many=True,read_only=True)

    class Meta:
        model=MedicalReport
        fields=['id','user','report_file','status','extracted_text','uploaded_at','parameters']
        read_only_fields=['user','status','extracted_text','uploaded_at']


class OTPSendSerializer(serializers.Serializer):
    phone_number=serializers.CharField(max_length=15)

class OTPVerifySerializer(serializers.Serializer):
    phone_number=serializers.CharField(max_length=15)
    otp=serializers.CharField(max_length=6)
    
from django.contrib import admin

from django.contrib.auth.admin import UserAdmin
from .models import CustomUser,MedicalReport,ExtractedParameter,OTPRequest

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display=('username','email','phone_number','blood_group','is_phone_verified','is_staff')
    search_fields=('username','email','phone_number')
    fieldsets=UserAdmin.fieldsets + (
        ('Vitals & Verification',{'fields':('phone_number','blood_group','emergency_contact','is_phone_verified','height_cm','weight_kg')}),
    )

class ExtractedParameterInline(admin.TabularInline):
    model=ExtractedParameter
    extra=0

@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display=('id','user','status','uploaded_at','report_file')
    list_filter=('status','uploaded_at')
    inlines=[ExtractedParameterInline]


@admin.register(OTPRequest)
class OTPRequestAdmin(admin.ModelAdmin):
    list_display=('phone_number','otp_code','created_at','is_verified')
    readonly_fields=('created_at',)
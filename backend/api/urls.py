from django.urls import path
from .views import SendOTPView,VerifyOTPView,MedicalReportUploadView

urlpatterns=[
    path('auth/send-otp/',SendOTPView.as_view(),name='send_otp'),
    path('auth/verify-otp/',VerifyOTPView.as_view(),name='verify-otp'),
    path('reports/upload/',MedicalReportUploadView.as_view(),name='report-upload'),
]
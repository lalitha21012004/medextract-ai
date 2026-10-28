from django.urls import path
from .views import MedicalReportDetailView, MedicalReportListView, ReportAIChatView, ReportAISummaryView, SendOTPView,VerifyOTPView,MedicalReportUploadView,MedicalReportListView,UserProfileView

urlpatterns=[
    path('auth/send-otp/',SendOTPView.as_view(),name='send_otp'),
    path('auth/verify-otp/',VerifyOTPView.as_view(),name='verify-otp'),
    path('reports/upload/',MedicalReportUploadView.as_view(),name='report-upload'),
    path('reports/',MedicalReportListView.as_view(),name='report-list'),
    path('reports/<int:pk>/',MedicalReportDetailView.as_view(),name='report-details'),
    path('reports/<int:pk>/summary/',ReportAISummaryView.as_view(),name='report-ai-summary'),
    path('reports/<int:pk>/chat/',ReportAIChatView.as_view(),name='report-ai-chat'),
    path('profile/',UserProfileView.as_view(),name='user-profile'),
]
import os
import re
import random
from decimal import Decimal
from datetime import timedelta
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser

#File Handling and Security Validation Utilities

def validate_medical_file(file):

   # Enforces file size constraints (10 KB to 10 MB) and strictly permits
   # only medical document formats (.pdf, .png, .jpg, .jpeg).

    min_size = 10 * 1024  # 10KB
    max_size = 10 * 1024 * 1024  # 10MB

    if file.size < min_size:
        raise ValidationError("File is too small. Minimum allowed size is 10KB.")
    if file.size > max_size:
        raise ValidationError("File exceeds the maximum allowed limit of 10MB.")

    ext = os.path.splitext(file.name)[1].lower()
    valid_extensions = ['.pdf', '.png', '.jpg', '.jpeg']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported format '{ext}'. Allowed: {', '.join(valid_extensions)}")

def user_directory_path(instance,filename):
#Organizes stored report files into isolated user subdirectories:
    #media/medical_reports/user_<id>/<filename>
    return f'medical_reports/user_{instance.user.id}/{filename}'


#1. Custom User Model+BMI & Body Vitals Engine

class CustomUser(AbstractUser):
    phone_number=models.CharField(max_length=15, unique=True,db_index=True)
    blood_group=models.CharField(max_length=5, blank=True, null=True)
    emergency_contact=models.CharField(max_length=15, blank=True, null=True)
    is_phone_verified=models.BooleanField(default=False)

    #Body Vitals for Integrated BMI Calculation
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    #Resolves fields clashes with auth.User
    groups=models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions=models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )


    class Meta:
        indexes=[
            models.Index(fields=['phone_number'],name='idx_user_phone'),
            models.Index(fields=['email'],name='idx_user_email'),
        ]

    @property
    def bmi(self):
        #Calculates Body Mass Index dynamically
        if self.height_cm and self.weight_kg and self.height_cm > 0:
            height_m=float(self.height_cm)/100.0
            return round(float(self.weight_kg)/(height_m ** 2),2)
        return None

    @property
    def bmi_category(self):
        #Classifies the calculated BMI according to standard ranges

        bmi_val=self.bmi
        if bmi_val is None:
            return "Not Provided"
        if bmi_val < 18.5:
            return "Underweight"
        elif 18.5<=bmi_val <25.0:
            return "Normal weight"
        elif 25.0<=bmi_val <30.0:
            return "Overweight"
        else:
            return "Obese"

    def __str__(self):
        return f"{self.username} ({self.phone_number})"

#2. Medical Report Tracking and Metadata Model

class MedicalReport(models.Model):
    STATUS_CHOICES=[
        ('PENDING','Pending'),
        ('PROCESSING','Processing'),
        ('COMPLETED','Completed'),
        ('FAILED','Failed'),
    ]

    user=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='reports')
    report_file = models.FileField(
        upload_to=user_directory_path,
        validators=[validate_medical_file]
    )
    report_name=models.CharField(max_length=255)
    file_size_bytes=models.PositiveIntegerField(default=0)
    uploaded_at=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='PENDING')

    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['user','-uploaded_at'],name='idx_report_user_date'),
            models.Index(fields=['status'],name='idx_report_status'),
        ]

    def get_risk_summary(self):
        #Aggregates parameter flags to feed dashboard visualization (e.g., Pie Chart).
        #Returns dict: {"NORMAL": x, "LOW": y, "HIGH": z}
        summary={"NORMAL":0, "LOW":0, "HIGH":0}
        for param in self.parameters.all():
            if param.risk_level in summary:
                summary[param.risk_level] += 1
        return summary

    def save(self, *args, **kwargs):
        # Automatically record file byte size before committing to database
        if self.report_file and not self.file_size_bytes:
            self.file_size_bytes=self.report_file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.report_name} - {self.user.username}"


#3. Extracted Medical Parameters and Risk Engine Model

class ExtractedParameter(models.Model):
    RISK_LEVELS = [
        ('NORMAL','Normal'),
        ('LOW','Low Flag'),
        ('HIGH','High Flag'),
    ]

    CATEGORIES=[
        ('HAEMATOLOGY','Blood Count and Cells'),
        ('LIPID','Lipids and Cholesterol'),
        ('METABOLIC','Blood Sugar and Kidney'),
        ('LIVER','Liver Function'),
        ('GENERAL','General Vitals'),
    ]

    report = models.ForeignKey(MedicalReport,on_delete=models.CASCADE,related_name='parameters')
    category = models.CharField(max_length=20,choices=CATEGORIES,default='GENERAL')
    parameter_name=models.CharField(max_length=100)
    observed_value=models.DecimalField(max_digits=10,decimal_places=2)
    unit=models.CharField(max_length=30)
    reference_range=models.CharField(max_length=100)
    normal_baseline=models.CharField(max_length=100,blank=True,null=True,help_text='Human-readable normal range reference')

    #Risk Engine Outputs
    risk_level=models.CharField(max_length=10,choices=RISK_LEVELS,default='NORMAL')
    deviation_percentage = models.DecimalField(max_digits=5,decimal_places=2,default=0.00,help_text='Percentage score indicating how far the metric deviates from baseline limits')
    possible_symptoms=models.TextField(blank=True,null=True,help_text='Contextual educational information for abnormal values')

    class Meta:
        unique_together=('report','parameter_name')
        ordering=['category','parameter_name']
        indexes=[
            models.Index(fields=['report'],name='idx_param_report'),
            models.Index(fields=['risk_level'],name='idx_param_risk'),
            models.Index(fields=['category'],name='idx_param_category'),
        ]

    def evaluate_metrics_and_risk(self):
            #Parses reference boundaries (e.g., '13.5 - 17.5'), computes percentage deviation, assigns risk level, and generates educational symptom notes.

            if not self.reference_range:
                self.risk_level='NORMAL'
                self.deviation_percentage=Decimal('0.00')
                return

            range_match = re.search(r'([\d\.]+)\s*-\s*([\d\.]+)', self.reference_range)
            if range_match:
                min_val=float(range_match.group(1))
                max_val=float(range_match.group(2))
                val=float(self.observed_value)

                if not self.normal_baseline:
                    self.normal_baseline = f"{min_val}-{max_val} {self.unit}"

                if val<min_val:
                    self.risk_level='LOW'
                    dev = ((min_val-val)/min_val) * 100
                    self.deviation_percentage=Decimal(str(round(dev, 2)))
                    self.possible_symptoms="Potential fatigue, weakness, or deficiencies. Consult a practitioner."

                elif val>max_val:
                    self.risk_level='HIGH'
                    dev=((val-max_val)/max_val) * 100
                    self.deviation_percentage=Decimal(str(round(dev, 2)))
                    self.possible_symptoms="Elevated metric. May indicate acute stress, infection, or dietary factors."

                else:
                    self.risk_level='NORMAL'
                    self.deviation_percentage=Decimal('0.00')
                    self.possible_symptoms="Optimal value within normal clinical reference bounds."

    def save(self,*args,**kwargs):
        self.evaluate_metrics_and_risk()
        super().save(*args,**kwargs)

    def __str__(self):
        return f"[{self.category}] {self.parameter_name}:{self.observed_value}{self.unit} ({self.risk_level})"

#4. Real-Time OTP and SMS Verification Model

class OTPRequest(models.Model):
    phone_number=models.CharField(max_length=15,db_index=True)
    otp_code=models.CharField(max_length=6)
    created_at=models.DateTimeField(auto_now_add=True)
    expires_at=models.DateTimeField()
    attempts=models.PositiveIntegerField(default=0)
    is_verified=models.BooleanField(default=False)

    class Meta:
        indexes=[
            models.Index(fields=['phone_number','is_verified'],name='idx_otp_phone_status'),
            models.Index(fields=['expires_at'],name='idx_otp_expires'),
        ]

    def save(self, *args, **kwargs):
        #Default expired time :5 minutes
        if not self.expires_at:
            self.expires_at=timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        #Return True if the current timestamp exceeds expires_at
        return timezone.now() > self.expires_at

    @staticmethod
    def generate_otp():
        #Generates a secure random 6-digit numeric OTP
        return str(random.randint(100000,999999))

    def __str__(self):
        return f"OTP for {self.phone_number} - Active:{not self.is_expired}"
    
    
from celery import shared_task
from .models import MedicalReport
from .services.ai_service import generate_medical_summary
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_medical_report_task(report_id):
    try:
        report = MedicalReport.objects.get(id=report_id)
        parameters = list(report.parameters.values())
        
        # Generate the AI clinical summary via Gemini
        summary = generate_medical_summary(parameters)
        
        # Save to database
        report.ai_summary = summary
        report.status = 'COMPLETED'
        report.save()
        logger.info(f"Successfully generated AI summary for report {report_id}")
    except Exception as e:
        logger.error(f"Failed processing report {report_id}: {e}")
        try:
            report = MedicalReport.objects.get(id=report_id)
            report.status = 'FAILED'
            report.save()
        except Exception:
            pass
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
        
        if parameters:
            # Generate real AI clinical summary using Gemini
            summary = generate_medical_summary(parameters)
            report.ai_summary = summary
            report.status = 'COMPLETED'
            report.save()
            logger.info(f"Successfully generated real AI summary for report {report_id}")
    except Exception as e:
        logger.error(f"Failed processing report {report_id}: {e}")
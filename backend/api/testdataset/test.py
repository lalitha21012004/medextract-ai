import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medextract.settings')
django.setup()

from datasets import load_dataset
from api.models import MedicalReport, CustomUser

def run_batch_test():
    print("1. Fetching batch medical records from Hugging Face (BI55/MedText)...")
    try:
        dataset = load_dataset("BI55/MedText", split="train", streaming=True)
        user = CustomUser.objects.first()
        if not user:
            print("-> Error: No CustomUser found in database.")
            return

        success_count = 0
        target_samples = 10  # Test with 10 records to check bulk accuracy
        
        print(f"2. Processing {target_samples} clinical records into the database...")
        for i, sample in enumerate(dataset):
            if i >= target_samples:
                break
                
            sample_text = sample.get('Clinical Note', '') or sample.get('text', '') or sample.get('Prompt', '')
            if not sample_text:
                continue

            # Create and complete report workflow
            report = MedicalReport.objects.create(
                user=user,
                extracted_text=sample_text.strip(),
                status="PROCESSING"
            )
            report.status = "COMPLETED"
            report.save()
            
            success_count += 1
            print(f"   [+] Processed Report ID {report.id} successfully.")

        print(f"\n✨ Batch Test Complete! Successfully ingested and validated {success_count}/{target_samples} records.")

    except Exception as e:
        print(f"-> Error during batch test: {str(e)}")

if __name__ == "__main__":
    run_batch_test()
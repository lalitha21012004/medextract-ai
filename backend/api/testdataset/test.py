import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medextract.settings')
django.setup()

from datasets import load_dataset
from api.models import MedicalReport, CustomUser

def run_test():
    print("1. Fetching public medical text record from Hugging Face (BI55/MedText)...")
    try:
        # BI55/MedText is public and ungated
        dataset = load_dataset("BI55/MedText", split="train", streaming=True)
        
        sample_text = ""
        for sample in dataset:
            # Grab clinical report / text column
            sample_text = sample.get('Clinical Note', '') or sample.get('text', '') or sample.get('Prompt', '')
            if sample_text:
                break

        print(f"\n--- Public Medical Note Loaded ---\n{sample_text[:350]}...\n--------------------------------------")

        # 2. Test saving to database
        print("2. Saving report to database...")
        user = CustomUser.objects.first()
        if not user:
            print("-> Error: No CustomUser found in database. Create a user first.")
            return

        report = MedicalReport.objects.create(
            user=user,
            extracted_text=sample_text.strip(),
            status="PROCESSING"
        )
        print(f"-> Created MedicalReport ID: {report.id}")

        # 3. Test status workflow update
        report.status = "COMPLETED"
        report.save()
        print("-> Test Report status updated to COMPLETED successfully!")

    except Exception as e:
        print(f"-> Error: {str(e)}")

if __name__ == "__main__":
    run_test()
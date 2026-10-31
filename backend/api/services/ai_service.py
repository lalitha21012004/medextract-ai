from google import genai
from django.conf import settings
import os
import traceback

def get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing!")
    return genai.Client(api_key=api_key)

def generate_medical_summary(parameters_data):
    try:
        client = get_gemini_client()
        param_text = "\n".join([
            f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')}"
            for p in parameters_data
        ]) if parameters_data else "No parameters."

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=f"Analyze these lab results and provide a 4-section summary (Key Findings, Analysis, Recommendations, Doctor Questions): {param_text}"
        )
        return response.text
    except Exception as e:
        print("CRITICAL AI SUMMARY ERROR:", traceback.format_exc())
        raise e  # Let it bubble up or return the exact error string for debugging

def answer_patient_question(parameters_data, user_question):
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=f"Lab data: {parameters_data}\nQuestion: {user_question}\nAnswer directly:"
        )
        return response.text
    except Exception as e:
        print("CRITICAL AI CHAT ERROR:", traceback.format_exc())
        raise e
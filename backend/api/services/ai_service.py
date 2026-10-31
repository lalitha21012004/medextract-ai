from google import genai
from django.conf import settings
import os

def get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)

def generate_medical_summary(parameters_data):
    client = get_gemini_client()
    param_text = "\n".join([
        f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')} ({p.get('risk_level')})"
        for p in parameters_data
    ]) if parameters_data else "No parameters."

    response = client.models.generate_content(
        model='gemini-2.0-flash',  # Updated to supported current SDK model
        contents=f"Analyze these lab results and provide a structured 4-section medical summary in Markdown: {param_text}"
    )
    return response.text

def answer_patient_question(parameters_data, user_question):
    client = get_gemini_client()
    response = client.models.generate_content(
        model='gemini-2.0-flash',  # Updated to supported current SDK model
        contents=f"Patient lab data: {parameters_data}\nQuestion: {user_question}\nProvide a direct, helpful medical answer:"
    )
    return response.text
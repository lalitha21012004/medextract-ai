from google import genai
from django.conf import settings
import os

def get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)

def call_gemini(prompt):
    client = get_gemini_client()
    # Automatically tests and uses whichever model is active on your API key
    models_to_try = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash-latest']
    
    last_err = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue
            
    raise RuntimeError(f"All Gemini models failed. Last error: {str(last_err)}")

def generate_medical_summary(parameters_data):
    param_text = "\n".join([
        f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')} ({p.get('risk_level')})"
        for p in parameters_data
    ]) if parameters_data else "No specific parameters extracted."

    prompt = f"""You are an expert medical assistant. Analyze these lab parameters:
{param_text}

Provide a response in Markdown with these exact sections:
1. **Key Findings Summary**
2. **Detailed Parameter Analysis**
3. **Lifestyle & Health Recommendations**
4. **Questions for Your Doctor**"""

    return call_gemini(prompt)

def answer_patient_question(parameters_data, user_question):
    param_text = "\n".join([
        f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')} ({p.get('risk_level')})"
        for p in parameters_data
    ]) if parameters_data else "No specific parameters extracted."

    prompt = f"""You are a compassionate medical lab report assistant.
Patient lab results: {param_text}

Patient Question: {user_question}

Provide a direct, clear, and comprehensive medical response addressing the patient's question based on their lab results."""

    return call_gemini(prompt)
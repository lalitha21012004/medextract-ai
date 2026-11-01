from google import genai
from google.genai.types import HttpOptions
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

def get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    # Force API version 'v1' to prevent v1beta 404 errors on standard models
    return genai.Client(api_key=api_key, http_options=HttpOptions(api_version="v1"))

def get_working_model(client):
    try:
        for m in client.models.list():
            name = m.name.replace("models/", "")
            methods = getattr(m, "supported_generation_methods", [])
            if "generateContent" in methods and "flash" in name:
                return name
    except Exception as e:
        logger.warning(f"Model listing failed: {e}")
    
    return "gemini-1.5-flash"

def generate_medical_summary(parameters_data):
    client = get_gemini_client()
    model_name = get_working_model(client)
    
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

    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    return response.text

def answer_patient_question(parameters_data, user_question):
    client = get_gemini_client()
    model_name = get_working_model(client)
    
    param_text = "\n".join([
        f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')} ({p.get('risk_level')})"
        for p in parameters_data
    ]) if parameters_data else "No specific parameters extracted."

    prompt = f"""You are a compassionate medical lab report assistant.
Patient lab results: {param_text}

Patient Question: {user_question}

Provide a direct, clear, and comprehensive medical response addressing the patient's question based on their lab results."""

    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    return response.text
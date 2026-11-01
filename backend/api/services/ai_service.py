from google import genai
from django.conf import settings
import os
import time
import logging

logger = logging.getLogger(__name__)

def get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)

def call_gemini_with_retry(prompt, retries=4, delay=2):
    client = get_gemini_client()
    # Google's current required active model identifier
    model_name = "gemini-3.8-flash"
    last_err = None

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as e:
            last_err = e
            # Handle 503 temporary high-demand spikes with exponential backoff
            err_str = str(e)
            if "503" in err_str or "UNAVAILABLE" in err_str or "high demand" in err_str:
                logger.warning(f"Gemini 503 high demand on attempt {attempt + 1}, retrying in {delay * (attempt + 1)}s...")
                time.sleep(delay * (attempt + 1))
                continue
            raise e

    raise RuntimeError(f"Gemini API unavailable after {retries} attempts. Last error: {str(last_err)}")

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

    return call_gemini_with_retry(prompt)

def answer_patient_question(parameters_data, user_question):
    param_text = "\n".join([
        f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')} ({p.get('risk_level')})"
        for p in parameters_data
    ]) if parameters_data else "No specific parameters extracted."

    prompt = f"""You are a compassionate medical lab report assistant.
Patient lab results: {param_text}

Patient Question: {user_question}

Provide a direct, clear, and comprehensive medical response addressing the patient's question based on their lab results."""

    return call_gemini_with_retry(prompt)
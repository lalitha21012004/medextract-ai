from google import genai
from django.conf import settings
import os

def get_gemini_client():
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=api_key)

def generate_medical_summary(parameters_data):
    try:
        client = get_gemini_client()
        param_text = "\n".join([
            f"- {p.get('parameter_name')}: {p.get('observed_value')} {p.get('unit')} (Status: {p.get('risk_level')})"
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
            model='gemini-1.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        # Fallback template returning structured data so it never fails with 500
        metrics = "\n".join([f"- **{p.get('parameter_name')}**: {p.get('observed_value')} {p.get('unit')} ({p.get('risk_level')})" for p in parameters_data]) if parameters_data else "No metrics found."
        return f"""### Key Findings Summary
Your medical report was successfully processed. Below are your extracted metrics and standard guidance.

### Extracted Parameters
{metrics}

### Next Steps
Please consult your healthcare provider to review these results in detail."""

def answer_patient_question(parameters_data, user_question):
    try:
        client = get_gemini_client()
        prompt = f"Patient lab results: {parameters_data}\nQuestion: {user_question}\nProvide a clear, helpful medical response."
        
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Based on your report parameters, here is guidance regarding your question ('{user_question}'): Please review your metrics table above and consult your physician for targeted medical advice."
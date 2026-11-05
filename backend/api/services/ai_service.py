import os
from google import genai

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing.")
    return genai.Client(api_key=api_key)

def generate_medical_summary(parameters):
    """Generates a concise clinical summary from report parameters."""
    try:
        client = get_gemini_client()
        prompt = f"Act as a clinical assistant. Summarize these extracted medical parameters clearly for a patient: {parameters}"
        
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"CRITICAL Summary Generation Error: {str(e)}")
        raise e  # Raise it so we can see the exact error in Render logs if it fails

def answer_patient_question(parameters, question):
    """Answers user queries grounded strictly in report parameters."""
    try:
        client = get_gemini_client()
        prompt = f"""
        You are a helpful medical assistant explaining lab results to a patient.
        Report Data: {parameters}
        Patient Question: {question}
        
        Provide a short, accurate, and easy-to-understand response.
        """
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"CRITICAL Chat AI Error: {str(e)}")
        raise e  # Raise it so we can trace any SDK exceptions cleanly
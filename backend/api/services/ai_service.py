import os
from google import genai
from google.genai import errors

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
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Summary Generation Error: {e}")
        return "Unable to generate summary at this moment. Please try refreshing."

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
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Chat AI Error: {e}")
        return "I am currently unable to process your question due to a service delay. Please ask again in a moment."
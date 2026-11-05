import os
from openai import OpenAI

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is missing.")
    return OpenAI(api_key=api_key)

def generate_medical_summary(parameters):
    """Generates a concise clinical summary using OpenAI."""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful clinical assistant. Summarize these extracted medical parameters clearly for a patient."},
                {"role": "user", "content": f"Parameters: {parameters}"}
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Summary Error: {str(e)}")
        raise e

def answer_patient_question(parameters, question):
    """Answers user queries grounded in report parameters using OpenAI."""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a helpful medical assistant explaining lab results to a patient based strictly on this report data: {parameters}"},
                {"role": "user", "content": question}
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Chat Error: {str(e)}")
        raise e
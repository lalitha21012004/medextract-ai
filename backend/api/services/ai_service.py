import os
from importlib import import_module

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing.")
    try:
        Groq = import_module("groq").Groq
    except ImportError as e:
        raise ImportError("The Groq SDK is required. Install it with 'pip install groq'.") from e
    return Groq(api_key=api_key)

def generate_medical_summary(parameters):
    """Generates a concise clinical summary using Groq."""
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a clinical assistant. Summarize these extracted medical parameters clearly for a patient using clean headings and bullet points."
                },
                {"role": "user", "content": f"Parameters: {parameters}"}
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq Summary Error: {str(e)}")
        raise e

def answer_patient_question(parameters, question):
    """Answers user queries grounded in report parameters using Groq with chat-friendly formatting."""
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are a helpful medical assistant explaining lab results to a patient based strictly on the provided report data. "
                        "Format your response cleanly for a chat bubble: use short paragraphs, bold text for key numbers/values, and bullet points. "
                        "DO NOT use markdown tables or pipe symbols (|)."
                    )
                },
                {"role": "user", "content": f"Report Data: {parameters}\n\nQuestion: {question}"}
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat Error: {str(e)}")
        raise e
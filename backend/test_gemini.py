import os
from google import genai

# Make sure to replace or ensure your environment variable is set locally:
# e.g., export GEMINI_API_KEY="your-actual-api-key"
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY environment variable is not set.")
    exit(1)

print(f"Initializing Gemini client with key starting with: {api_key[:6]}...")
client = genai.Client(api_key=api_key)

try:
    print("Testing connection with client.models.generate_content...")
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents="Hello, give me a short health tip."
    )
    print("\nSUCCESS! Response from Gemini:")
    print(response.text)
except Exception as e:
    print("\nFAILED with error:")
    print(str(e))
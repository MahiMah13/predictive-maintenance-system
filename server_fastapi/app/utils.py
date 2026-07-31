import os
import google.generativeai as genai

# Configure Gemini API key from environment
GENI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GENI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GENI_API_KEY)

def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """Generate a text response from Gemini.
    If a system_instruction is provided it is sent as a system message before the user prompt.
    """
    model = genai.GenerativeModel("gemini-1.5-pro")
    if system_instruction:
        response = model.generate_content([system_instruction, prompt])
    else:
        response = model.generate_content(prompt)
    return response.text

def call_gemini_structured(prompt: str) -> str:
    """Generate a JSON‑structured response from Gemini.
    The function returns the raw JSON string produced by the model.
    """
    model = genai.GenerativeModel(
        "gemini-1.5-pro",
        generation_config={"response_mime_type": "application/json"},
    )
    response = model.generate_content(prompt)
    # The response text should already be a JSON string
    return response.text

import re
import pytesseract
from PIL import Image
from pdf2image import convert_from_path

#Standard clinical reference for OCR
PARAM_BASELINES={
    "Hemoglobin":{"min":12.0,"max":17.5,"unit":"g/dL"},
    "Glucose":{"min":70.0,"max":99.0,"unit":"mg/dL"},
    "Cholesterol":{"min":125.0,"max":200.0,"unit":"mg/dL"},
    "WBC Count":{"min":4.5,"max":11.0,"unit":"x10^3/uL"},
}

def extract_text_from_file(file_path):
    #Extract raw text from PDF or Image using Tesseract OCR.

    text=""
    if file_path.lower().endswith(".pdf"):
        images=convert_from_path(file_path)
        for img in images:
            text +=pytesseract.image_to_string(img)+"\n"
    else: 
        img=Image.open(file_path)
        text=pytesseract.image_to_string(img)
    return text

def parse_medical_parameters(text):
    #Parse the extracted text to find medical parameters and their values.
    extracted_data=[]

    for param,baseline in PARAM_BASELINES.items():
        #Match the parameter name followed by a numerical value.
        pattern=rf"{param}\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        match=re.search(pattern,text,re.IGNORECASE)

        if match:
            value=float(match.group(1))
            min_val=baseline["min"]
            max_val=baseline["max"]

            #Calculate risk and status
            if value<min_val or value>max_val:
                status="CRITICAL" if(value<min_val *0.8 or value>max_val*1.2) else "WARNING"
            else:
                status="NORMAL"

            extracted_data.append({
                "parameter_name":param,
                "value":value,
                "unit":baseline["unit"],
                "reference_range":f"{min_val}-{max_val}",
                "status":status,
            })
    return extracted_data
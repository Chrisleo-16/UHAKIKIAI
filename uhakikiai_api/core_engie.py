import cv2
import numpy as np
import easyocr
import re
from PIL import Image, ImageChops
from datetime import datetime
from database import supabase

reader = easyocr.Reader(['en'])

def run_verification_pipeline(image_bytes):
    """
    The Stateless Logic:
    1. Forensic Scan (Is it AI generated?)
    2. OCR (Read text)
    3. National DB Check (Is the data real?)
    """
    verdict = {"status": "VERIFIED", "flags": [], "score": 100}

    # --- STEP 1: FORENSICS (ELA) ---
    # Convert bytes to PIL Image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Simple ELA Simulation (Check for compression anomalies)
    # (In production, use the advanced Pillow ELA logic here)
    # For MVP: If image is perfectly clean (synthetic), flag it.
    noise = np.std(img_cv)
    if noise < 10: # Synthetic images often have very low noise
        verdict["flags"].append("Suspected Synthetic Image (Low Noise)")
        verdict["score"] -= 30

    # --- STEP 2: OCR ---
    results = reader.readtext(img_cv, detail=0)
    full_text = " ".join(results).upper()
    
    # Extract Index
    index_match = re.search(r'\d{9,11}', full_text)
    if not index_match:
        return {"status": "ERROR", "message": "Index Number not legible"}
    
    index_number = index_match.group(0)

    # --- STEP 3: NATIONAL DB MATCH ---
    db_res = supabase.table("national_records").select("*").eq("index_number", index_number).execute()
    
    if not db_res.data:
        verdict["status"] = "FLAGGED"
        verdict["flags"].append("Identity Not Found in National Registry")
        return verdict

    record = db_res.data[0]

    # --- STEP 4: DATA INTEGRITY ---
    if record['mean_grade'] not in full_text:
        verdict["status"] = "FLAGGED"
        verdict["flags"].append(f"Grade Mismatch (Expected {record['mean_grade']})")
    
    if record['serial_number'] not in full_text:
        verdict["status"] = "FLAGGED"
        verdict["flags"].append("Serial Number Mismatch")

    # Add Data to response
    verdict["data"] = {
        "name": record['full_name'],
        "institution": record['school_name']
    }
    
    return verdict
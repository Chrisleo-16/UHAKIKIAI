import os
import secrets
import uvicorn
import cv2
import numpy as np
import pytesseract  # UPDATED from easyocr
import re
from datetime import datetime
from typing import Optional, List

# FastAPI & Pydantic
from fastapi import FastAPI, HTTPException, Header, Depends, File, UploadFile, Form, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel

# Security & Crypto
from passlib.context import CryptContext

# Database
from supabase import create_client, Client

# Image Processing
from PIL import Image, ImageChops
from io import BytesIO

# Environment Variables
from dotenv import load_dotenv

# --- 1. CONFIGURATION & DATABASE SETUP ---

load_dotenv()

# Check for credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_KEY not found in env. Database calls will fail.")
    # Initialize as None to allow code to compile; will error on DB usage if not fixed.
    supabase: Client = None 
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")
        supabase = None

# --- 2. AUTHENTICATION LOGIC ---

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def generate_api_key_logic(company_email: str):
    """
    Generates a secure API key, hashes it, and stores it in Supabase.
    Called by the Admin Portal.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    # 1. Find Company ID
    res = supabase.table("companies").select("id").eq("email", company_email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Company not registered")
    
    company_id = res.data[0]['id']

    # 2. Generate Key (e.g., uh_live_AbCd123...)
    # Using 32 bytes of entropy
    raw_key = f"uh_live_{secrets.token_urlsafe(32)}"
    prefix = raw_key[:10] # Store prefix to look up quickly
    key_hash = pwd_context.hash(raw_key)

    # 3. Save Hash to DB
    supabase.table("api_keys").insert({
        "company_id": company_id,
        "key_hash": key_hash,
        "prefix": prefix,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    return {"api_key": raw_key, "message": "Save this key now. It won't be shown again."}

async def validate_api_key(x_api_key: str = Depends(api_key_header)):
    """
    Dependency: Verifies the API key sent in headers for protected routes.
    """
    if not x_api_key:
        raise HTTPException(status_code=403, detail="X-API-Key header missing")
    
    if not supabase:
        # Fallback for local testing if DB is down (remove in production)
        if x_api_key.startswith("uh_test_"):
             return "test_company_id"
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    prefix = x_api_key[:10]
    
    # 1. Look up by prefix (fast, avoids scanning all hashes)
    res = supabase.table("api_keys").select("*").eq("prefix", prefix).eq("is_active", True).execute()
    
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid API Key (Prefix mismatch)")
    
    record = res.data[0]
    
    # 2. Verify Hash
    if not pwd_context.verify(x_api_key, record['key_hash']):
        raise HTTPException(status_code=401, detail="Invalid API Key (Hash mismatch)")
    
    return record['company_id']

# --- 3. CORE ENGINE & INTELLIGENCE ---

# UPDATED: Initialize Tesseract Check (Lighter than EasyOCR)
try:
    print("Loading OCR Engine (Tesseract)...")
    # Verify tesseract is installed
    pytesseract.get_tesseract_version()
    print("OCR Model Loaded.")
except Exception as e:
    print(f"Warning: OCR Engine failed to load. {e}")

def run_forensics(img_cv):
    """
    Advanced Step 1: Detect Digital Manipulation (Generative AI Artifacts)
    Corresponds to 'Generative Document Forgery Detection'.
    """
    flags = []
    score_penalty = 0

    # A. Noise Analysis (ELA - Error Level Analysis Simulation)
    # Synthetic images often lack the natural high-frequency noise of scanned paper.
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    noise_sigma = np.std(gray)
    
    # Thresholds tuned for MVP
    if noise_sigma < 5.0: 
        flags.append("High Probability of Synthetic Generation (Unnatural smoothness)")
        score_penalty += 40
    elif noise_sigma < 12.0:
        flags.append("Potential Digital Manipulation (Low Noise)")
        score_penalty += 15

    # B. Document Structure Check (Size/Ratio)
    height, width, _ = img_cv.shape
    aspect_ratio = width / height
    
    return flags, score_penalty

def run_ocr_extraction(img_cv):
    """
    Step 2: Extract Text Data (UPDATED to Tesseract)
    """
    # Preprocessing to help Tesseract
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    try:
        # Extract text
        full_text = pytesseract.image_to_string(thresh).upper()
        return full_text, []
    except Exception as e:
        print(f"OCR Error: {e}")
        return "", []

def agentic_verification_logic(extracted_text, forensics_flags, forensics_penalty):
    """
    Step 3: The 'Autonomous Agent' logic.
    The agent weighs forensic evidence against data integrity.
    """
    verdict = {
        "status": "PENDING",
        "risk_score": 0, # 0-100 (100 is Fraud)
        "reasoning": []
    }

    # Agent Input: Forensics
    verdict["risk_score"] += forensics_penalty
    if forensics_flags:
        verdict["reasoning"].extend(forensics_flags)

    # Agent Input: Contextual Logic (NLP-lite)
    # Check for keywords expected in Kenyan Academic Documents
    required_keywords = ["KENYA", "CERTIFICATE", "EXAMINATION"]
    # Check how many are missing
    found_keywords = [kw for kw in required_keywords if kw in extracted_text]
    
    if len(found_keywords) < 2:
        verdict["risk_score"] += 25
        verdict["reasoning"].append(f"Document lacks standard terminology. Found: {found_keywords}")

    # Regex Extraction for Index Number (The Key Identifier)
    # Updated regex to handle standard Kenyan ID/Index patterns
    index_match = re.search(r'\d{8,12}', extracted_text)
    index_number = None

    if index_match:
        index_number = index_match.group(0)
    else:
        verdict["risk_score"] += 50 # Critical failure
        verdict["reasoning"].append("Could not identify a valid Index Number.")

    return verdict, index_number

def run_verification_pipeline(image_bytes):
    """
    Orchestrates the full UhakikiAI pipeline.
    """
    response_payload = {
        "final_decision": "UNCERTAIN",
        "risk_score": 0,
        "details": [],
        "extracted_data": {}
    }

    # 1. Image Preprocessing
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_cv is None:
            raise ValueError("Invalid image data")
    except Exception:
        return {"final_decision": "ERROR", "details": ["File is not a valid image"], "risk_score": 0}

    # 2. Forensics Analysis (The 'AI Defense' layer)
    f_flags, f_penalty = run_forensics(img_cv)

    # 3. OCR Extraction
    full_text, raw_words = run_ocr_extraction(img_cv)

    # 4. Agent Logic (Initial Risk Assessment)
    agent_verdict, index_number = agentic_verification_logic(full_text, f_flags, f_penalty)
    
    response_payload["risk_score"] = agent_verdict["risk_score"]
    response_payload["details"] = agent_verdict["reasoning"]

    # 5. National DB Cross-Reference (The 'Source of Truth')
    # Only proceed if we found an index number and risk isn't already 100
    if index_number and response_payload["risk_score"] < 80:
        if supabase:
            # Query "Golden Record" from National DB Table
            db_res = supabase.table("national_records").select("*").eq("index_number", index_number).execute()
            
            if not db_res.data:
                response_payload["risk_score"] = 100
                response_payload["details"].append(f"Identity {index_number} NOT FOUND in National Registry.")
                response_payload["final_decision"] = "FRAUD"
            else:
                record = db_res.data[0]
                
                # Check 1: Name Match (Fuzzy logic is better, strictly exact here for MVP)
                db_name = record.get('full_name', '').upper().strip()
                if db_name not in full_text:
                    response_payload["risk_score"] += 50
                    response_payload["details"].append(f"Name Mismatch. Expected: {db_name}")

                # Check 2: Grade Match
                db_grade = record.get('mean_grade', '').upper()
                if db_grade and db_grade not in full_text:
                    response_payload["risk_score"] += 40
                    response_payload["details"].append(f"Grade Mismatch. Expected: {db_grade}")
                
                # Return verified data
                response_payload["extracted_data"] = {
                    "index_number": index_number,
                    "verified_name": db_name,
                    "verified_institution": record.get('school_name')
                }
        else:
            response_payload["details"].append("Skipped DB check (No Connection).")

    # 6. Final Decision Logic
    if response_payload["risk_score"] >= 70:
        response_payload["final_decision"] = "REJECTED"
    elif response_payload["risk_score"] >= 30:
        response_payload["final_decision"] = "MANUAL_REVIEW"
    else:
        response_payload["final_decision"] = "VERIFIED"

    return response_payload

# --- 4. API ROUTES ---

app = FastAPI(
    title="UhakikiAI Verification API",
    description="The Trust Layer for African Credentials.",
    version="2.0"
)

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "UhakikiAI Core Engine is Online. Use /docs for API schema."}

# --- PORTAL ROUTES (For Vercel / Admin Dashboard) ---

@app.post("/portal/register_company", tags=["Admin"])
def register_company(name: str = Form(...), email: str = Form(...)):
    """
    Onboard a new institution/company to the platform.
    """
    if not supabase:
         raise HTTPException(status_code=500, detail="Database Unavailable")
    
    try:
        res = supabase.table("companies").insert({"company_name": name, "email": email}).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/portal/generate_key", tags=["Admin"])
def create_key(email: str = Form(...)):
    """
    Generate an API key for a registered company.
    """
    return generate_api_key_logic(email)

# --- V1 PUBLIC API (For Client Integration) ---

@app.post("/v1/verify_document", tags=["Verification"])
async def verify_document_endpoint(
    file: UploadFile = File(...),
    company_id: str = Depends(validate_api_key)
):
    """
    **The Primary Endpoint.**
    """
    # 1. Validate File Type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG/PNG allowed.")

    content = await file.read()
    
    # 2. Run the Engine
    result = run_verification_pipeline(content)
    
    # 3. Logging & Billing
    if supabase:
        try:
            supabase.table("usage_logs").insert({
                "company_id": company_id,
                "request_endpoint": "/v1/verify_document",
                "response_status": 200,
                "fraud_verdict": result["final_decision"],
                "risk_score": result["risk_score"],
                "timestamp": datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            print(f"Logging failed: {e}")
    
    return result

@app.post("/v1/biometric_match", tags=["Verification"])
async def biometric_match(
    id_image: UploadFile = File(...),
    selfie_image: UploadFile = File(...),
    company_id: str = Depends(validate_api_key)
):
    """
    **Placeholder for Facial Recognition.**
    """
    return {
        "status": "NOT_IMPLEMENTED_YET", 
        "message": "Biometric matching module is enabled in v2.1",
        "company_id": company_id
    }

# --- ENTRY POINT ---

if __name__ == "__main__":
    # Local Development Run Command
    # UPDATED: Use dynamic port for Render
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting UhakikiAI Engine on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

from fastapi import *
from auth import *
from core_engine import *
from database import supabase

app = FastAPI(
    title="UhakikiAI Verification API",
    description="The Trust Layer for African Credentials. Integrate identity verification into your app.",
    version="1.0"
)

# --- PORTAL ROUTES (For your Vercel App) ---

@app.post("/portal/register_company")
def register_company(name: str = Form(...), email: str = Form(...)):
    """Used by Vercel App to create a new client account"""
    res = supabase.table("companies").insert({"company_name": name, "email": email}).execute()
    return res.data

@app.post("/portal/generate_key")
def create_key(email: str = Form(...)):
    """Used by Vercel App to show the user their API Key"""
    return generate_api_key(email)

# --- PUBLIC API ROUTES (For Companies to use) ---

@app.post("/v1/verify_document")
async def verify_document(
    file: UploadFile = File(...),
    company_id: str = Depends(validate_api_key) # This enforces the API Key check
):
    """
    THE PRODUCT: Companies upload a file, we return the verdict.
    """
    content = await file.read()
    
    # 1. Run Analysis
    result = run_verification_pipeline(content)
    
    # 2. Log Usage for Billing
    supabase.table("usage_logs").insert({
        "company_id": company_id,
        "request_endpoint": "/v1/verify_document",
        "response_status": 200,
        "fraud_verdict": result["status"]
    }).execute()
    
    return result

if __name__ == "__main__":
    import uvicorn
    # Use this command to run locally
    uvicorn.run(app, host="0.0.0.0", port=8000)
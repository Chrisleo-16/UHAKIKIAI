import secrets
from passlib.context import CryptContext
from database import supabase
from fastapi import HTTPException, Header

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_api_key(company_email: str):
    """
    Called by Vercel App when a company clicks 'Get API Key'.
    Returns the RAW key once (user must save it).
    """
    # 1. Find Company ID
    res = supabase.table("companies").select("id").eq("email", company_email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Company not registered")
    
    company_id = res.data[0]['id']

    # 2. Generate Key (e.g., uh_live_AbCd123...)
    raw_key = f"uh_live_{secrets.token_urlsafe(32)}"
    prefix = raw_key[:10]
    key_hash = pwd_context.hash(raw_key)

    # 3. Save Hash to DB
    supabase.table("api_keys").insert({
        "company_id": company_id,
        "key_hash": key_hash,
        "prefix": prefix
    }).execute()

    return {"api_key": raw_key, "message": "Save this key now. It won't be shown again."}

async def validate_api_key(x_api_key: str = Header(...)):
    """
    Dependency for protected routes. 
    Verifies the key sent in headers matches the hash in DB.
    """
    prefix = x_api_key[:10]
    
    # 1. Look up by prefix (fast)
    res = supabase.table("api_keys").select("*").eq("prefix", prefix).eq("is_active", True).execute()
    
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    
    record = res.data[0]
    
    # 2. Verify Hash
    if not pwd_context.verify(x_api_key, record['key_hash']):
        raise HTTPException(status_code=401, detail="Invalid API Key")
    
    return record['company_id']
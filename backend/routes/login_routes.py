# routes/login_routes.py
from fastapi import APIRouter, HTTPException
from core.supabase_client import supabase
from schemas.login_schema import LoginRequest

router = APIRouter(prefix="/api/login")

@router.post("/parent")
def login_parent(login_req: LoginRequest):  # receive Pydantic model
    print("🔹 Login attempt for parent_id:", login_req.id_number)
    try:
        res = supabase.table("parents").select("*").eq("id_number", login_req.id_number).execute()
        print("🔹 Supabase response:", res.data)
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        parent = res.data[0]
        return {
            "id_number": parent["id_number"],
            "full_name": parent["full_name"],
            "email": parent["email"],
            "phone_number": parent["phone_number"]
        }
    except Exception as e:
        print("❌ Error in login:", e)
        raise HTTPException(status_code=400, detail=str(e))

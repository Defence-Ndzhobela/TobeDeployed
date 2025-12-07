from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from core.supabase_client import get_supabase_client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/user", tags=["User"])

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.get("/{user_id}")
def get_user_info(user_id: str):
    """
    Fetch user information from the public.users view
    """
    try:
        supabase = get_supabase_client()
        
        # Query the public.users view
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = response.data[0]
        
        return {
            "id": user_data.get("id"),
            "full_name": user_data.get("full_name"),
            "email": user_data.get("email"),
            "phone": user_data.get("phone"),
            "role": user_data.get("role"),
            "created_at": user_data.get("created_at"),
            "updated_at": user_data.get("updated_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user info: {str(e)}")

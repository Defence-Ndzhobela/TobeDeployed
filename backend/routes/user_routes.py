from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from services.email_service import send_account_created_email
from services.auth_service import hash_password
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter()

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str

# Example DB connection (PostgreSQL)
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

@router.post("/register")
def register_user(data: RegisterSchema):
    hashed_pwd = hash_password(data.password)

    # Save to DB
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
            (data.name, data.email, hashed_pwd)
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Email already registered or DB error.")

    # Send confirmation email
    try:
        send_account_created_email(data.email, data.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error sending confirmation email.")

    return {"status": "success", "message": "Account created. Please check your email."}

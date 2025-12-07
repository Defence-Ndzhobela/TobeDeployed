# schemas/login_schema.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any


class LoginRequest(BaseModel):
    """Email and password login request."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class SignupRequest(BaseModel):
    """User signup request."""
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    """User information response."""
    id: str
    email: str
    full_name: Optional[str] = None


class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class AuthResponse(BaseModel):
    """Generic auth API response."""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

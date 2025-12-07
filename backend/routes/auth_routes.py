"""
Authentication routes for email/password login and signup.
Uses Supabase Auth for user management.
"""

from fastapi import APIRouter, HTTPException, status
from schemas.login_schema import LoginRequest, SignupRequest, TokenResponse, AuthResponse
from services.auth_service import auth_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/auth/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """
    Register a new parent user.
    
    Args:
        request: SignupRequest with full_name, email, password
        
    Returns:
        TokenResponse with access_token and user info
        
    Raises:
        HTTPException: If signup fails (400 Bad Request, 409 Conflict)
    """
    try:
        result = await auth_service.signup(
            full_name=request.full_name,
            email=request.email,
            password=request.password
        )
        return result
    except ValueError as e:
        # Validation errors
        logger.warning(f"Signup validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Check if email already exists
        if "email already registered" in str(e).lower() or "user already exists" in str(e).lower():
            logger.warning(f"Email already registered: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered. Please login or use a different email."
            )
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup failed. Please try again."
        )


@router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Login a parent user with email and password.
    
    Args:
        request: LoginRequest with email and password
        
    Returns:
        TokenResponse with access_token and user info
        
    Raises:
        HTTPException: If login fails (401 Unauthorized)
    """
    try:
        result = await auth_service.login(
            email=request.email,
            password=request.password
        )
        return result
    except ValueError as e:
        logger.warning(f"Login failed for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except Exception as e:
        logger.error(f"Login error for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed. Please try again."
        )


@router.post("/auth/logout", response_model=AuthResponse)
async def logout():
    """
    Logout a user (backend-side cleanup).
    Frontend should clear tokens from localStorage/sessionStorage.
    
    Returns:
        AuthResponse with success message
    """
    try:
        result = await auth_service.logout("")
        return AuthResponse(
            success=True,
            message="Logged out successfully",
            data=result
        )
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/auth/health", response_model=AuthResponse)
async def auth_health():
    """Health check endpoint for authentication service."""
    return AuthResponse(
        success=True,
        message="Authentication service is healthy"
    )

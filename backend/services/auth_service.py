"""
Authentication service using Supabase Auth.
Handles user signup, login, and token validation.
"""

from supabase import Client
from core.supabase_client import supabase
from schemas.login_schema import LoginRequest, SignupRequest, TokenResponse, UserResponse
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Service for handling authentication with Supabase Auth."""

    def __init__(self, supabase_client: Client = supabase):
        self.supabase = supabase_client

    async def signup(self, full_name: str, email: str, password: str) -> TokenResponse:
        """
        Register a new parent user with email and password.
        
        Args:
            full_name: Full name of the parent
            email: Email address (unique identifier)
            password: Password (validated for strength)
            
        Returns:
            TokenResponse with access token and user info
            
        Raises:
            ValueError: If validation fails
            Exception: If Supabase signup fails
        """
        # Password validation
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(c.isupper() for c in password):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.islower() for c in password):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not any(not c.isalnum() for c in password):
            raise ValueError("Password must contain at least one special character.")

        try:
            # Sign up with Supabase Auth
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {"full_name": full_name}
                }
            })

            if not response.user:
                raise Exception("Signup failed: No user returned from Supabase")

            user = UserResponse(
                id=response.user.id,
                email=response.user.email or "",
                full_name=response.user.user_metadata.get("full_name", full_name) if response.user.user_metadata else full_name
            )

            # After signup, session may be null if email confirmation is required
            token_response = TokenResponse(
                access_token=response.session.access_token if response.session else "",
                token_type="bearer",
                user=user.dict()
            )

            logger.info(f"New user signed up: {email}")
            return token_response

        except Exception as e:
            logger.error(f"Signup error for {email}: {str(e)}")
            raise

    async def login(self, email: str, password: str) -> TokenResponse:
        """
        Login a parent user with email and password.
        Creates an application record if one doesn't exist for this user.
        
        Args:
            email: Email address
            password: Password
            
        Returns:
            TokenResponse with access token and user info
            
        Raises:
            ValueError: If credentials are invalid
            Exception: If Supabase login fails
        """
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if not response.user or not response.session:
                raise ValueError("Invalid email or password")

            user = UserResponse(
                id=response.user.id,
                email=response.user.email or "",
                full_name=response.user.user_metadata.get("full_name", "") if response.user.user_metadata else ""
            )

            # ✅ Step 2: Create application if it doesn't exist for this user
            try:
                existing_app = self.supabase.table("applications").select("id").eq("user_id", response.user.id).execute()
                
                if not existing_app.data or len(existing_app.data) == 0:
                    # Create new application
                    app_response = self.supabase.table("applications").insert({
                        "user_id": response.user.id,
                        "status": "in_progress"
                    }).execute()
                    
                    if app_response.data:
                        logger.info(f"Created new application for user {response.user.id}")
                        application_id = app_response.data[0]["id"]
                    else:
                        logger.warning(f"Failed to create application for user {response.user.id}")
                        application_id = None
                else:
                    logger.info(f"Application already exists for user {response.user.id}")
                    application_id = existing_app.data[0]["id"]
                
                # ✅ IMPORTANT: Always create/check parent record with user_id link
                if application_id:
                    try:
                        # Check if parent record already exists for this user
                        existing_parent = self.supabase.table("parents").select("id").eq("user_id", response.user.id).execute()
                        
                        if not existing_parent.data or len(existing_parent.data) == 0:
                            # Create parent record with user_id link
                            parent_response = self.supabase.table("parents").insert({
                                "application_id": application_id,
                                "user_id": response.user.id,
                                "first_name": user.full_name.split()[0] if user.full_name else "Parent",
                                "surname": " ".join(user.full_name.split()[1:]) if len(user.full_name.split()) > 1 else "",
                                "email": response.user.email,
                                "relationship": "Primary",
                                "is_primary": True
                            }).execute()
                            
                            if parent_response.data:
                                logger.info(f"✅ Created parent record for user {response.user.id}")
                            else:
                                logger.warning(f"⚠️ Failed to create parent record for user {response.user.id}")
                        else:
                            logger.info(f"Parent record already exists for user {response.user.id}")
                    except Exception as parent_error:
                        logger.error(f"❌ Error with parent record: {str(parent_error)}")
                        import traceback
                        logger.error(traceback.format_exc())
            except Exception as app_error:
                logger.error(f"Error creating/checking application: {str(app_error)}")
                # Don't fail login if application creation fails

            token_response = TokenResponse(
                access_token=response.session.access_token,
                token_type="bearer",
                user=user.dict()
            )

            logger.info(f"User logged in: {email}")
            return token_response

        except Exception as e:
            logger.error(f"Login error for {email}: {str(e)}")
            if "Invalid login credentials" in str(e):
                raise ValueError("Invalid email or password")
            raise

    async def logout(self, user_id: str) -> dict:
        """
        Logout a user (backend-side cleanup if needed).
        Actual session cleanup happens on frontend via token expiration.
        
        Args:
            user_id: Supabase user ID
            
        Returns:
            Dict with success status
        """
        try:
            logger.info(f"User logged out: {user_id}")
            return {"status": "success", "message": "Logged out successfully"}
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            raise


# Global auth service instance
auth_service = AuthService()

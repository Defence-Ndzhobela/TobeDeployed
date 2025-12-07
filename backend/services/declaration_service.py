import logging
from core.supabase_client import supabase
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class DeclarationService:
    """Service for managing student declarations in the database."""
    
    def __init__(self):
        self.supabase = supabase
    
    def save_declaration(
        self,
        application_id: str,
        agree_truth: bool,
        agree_policies: bool,
        agree_financial: bool,
        agree_verification: bool,
        agree_data_processing: bool,
        agree_audit_storage: bool,
        agree_affordability_processing: bool,
        full_name: str,
        city: Optional[str] = None,
        status: str = "completed",
    ) -> Dict[str, Any]:
        """
        Save or update a declaration record in the declarations table.
        
        Args:
            application_id: UUID of the application
            agree_truth: Confirm information is true and correct
            agree_policies: Agree to school's rules and policies
            agree_financial: Acknowledge responsibility for school fees
            agree_verification: Consent to verify information
            agree_data_processing: Consent to storage and processing of personal information
            agree_audit_storage: Consent to storing information for school audit
            agree_affordability_processing: Consent to affordability check processing
            full_name: Full name as digital signature
            city: City/place of signing (optional)
            status: Status of declaration (default: 'completed')
        
        Returns:
            Dictionary containing the saved declaration record
        
        Raises:
            ValueError: If validation fails
            Exception: If database operation fails
        """
        try:
            # Validate inputs
            if not application_id or not isinstance(application_id, str):
                raise ValueError("application_id is required and must be a string")
            
            if not full_name or len(full_name.strip()) < 3:
                raise ValueError("full_name must be at least 3 characters long")
            
            # Check if declaration already exists for this application
            logger.info(f"Checking for existing declaration for application_id: {application_id}")
            
            existing = self.supabase.table("declarations").select("*").eq(
                "application_id", application_id
            ).execute()
            
            declaration_data = {
                "application_id": application_id,
                "agree_truth": agree_truth,
                "agree_policies": agree_policies,
                "agree_financial": agree_financial,
                "agree_verification": agree_verification,
                "agree_data_processing": agree_data_processing,
                "agree_audit_storage": agree_audit_storage,
                "agree_affordability_processing": agree_affordability_processing,
                "full_name": full_name.strip(),
                "city": city.strip() if city else None,
                "status": status,
                "signed": True,
            }
            
            if existing.data and len(existing.data) > 0:
                # Update existing declaration
                logger.info(f"Updating existing declaration for application_id: {application_id}")
                
                response = self.supabase.table("declarations").update(
                    declaration_data
                ).eq("application_id", application_id).execute()
                
                if not response.data:
                    raise Exception("Failed to update declaration")
                
                logger.info(f"Declaration updated successfully for application_id: {application_id}")
                return response.data[0]
            else:
                # Create new declaration
                logger.info(f"Creating new declaration for application_id: {application_id}")
                
                response = self.supabase.table("declarations").insert(
                    declaration_data
                ).execute()
                
                if not response.data:
                    raise Exception("Failed to create declaration")
                
                logger.info(f"Declaration created successfully for application_id: {application_id}")
                return response.data[0]
        
        except ValueError as e:
            logger.warning(f"Validation error in save_declaration: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error saving declaration for application_id {application_id}: {str(e)}", exc_info=True)
            raise
    
    def get_declaration(self, application_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch declaration record for an application.
        
        Args:
            application_id: UUID of the application
        
        Returns:
            Dictionary containing the declaration record, or None if not found
        """
        try:
            logger.info(f"Fetching declaration for application_id: {application_id}")
            
            response = self.supabase.table("declarations").select("*").eq(
                "application_id", application_id
            ).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Declaration found for application_id: {application_id}")
                return response.data[0]
            
            logger.warning(f"No declaration found for application_id: {application_id}")
            return None
        
        except Exception as e:
            logger.error(f"Error fetching declaration for application_id {application_id}: {str(e)}", exc_info=True)
            raise


# Create a singleton instance
declaration_service = DeclarationService()

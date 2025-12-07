"""
Service for plan selection business logic.
"""

from typing import Dict, Any, Optional
import logging
from core.supabase_client import supabase

logger = logging.getLogger(__name__)


class PlanService:
    """Service for plan selection business logic"""

    def __init__(self):
        self.db = supabase

    def save_selected_plan(self, application_id: str, selected_plan: str) -> Dict[str, Any]:
        """
        Save the selected plan for an application to the fee_responsibility table.
        Updates or creates the fee_responsibility record with the selected_plan.
        
        Args:
            application_id: UUID of the application
            selected_plan: The selected plan name/code
            
        Returns:
            Dict containing the saved record
            
        Raises:
            ValueError: If validation fails
            Exception: If database operation fails
        """
        try:
            # Validate inputs
            if not application_id or not isinstance(application_id, str):
                raise ValueError("Invalid application_id: must be a non-empty string")
            
            application_id = application_id.strip()
            
            if not selected_plan or not isinstance(selected_plan, str):
                raise ValueError("Invalid selected_plan: must be a non-empty string")
            
            selected_plan = selected_plan.strip()
            
            logger.info(f"Attempting to save plan '{selected_plan}' for application {application_id}")
            
            # Check if fee_responsibility record exists
            existing_record = self.db.table("fee_responsibility").select("id").eq("application_id", application_id).limit(1).execute()
            
            if existing_record.data and len(existing_record.data) > 0:
                # Update existing record
                logger.info(f"Updating existing fee_responsibility record for application {application_id}")
                response = (
                    self.db.table("fee_responsibility")
                    .update({"selected_plan": selected_plan})
                    .eq("application_id", application_id)
                    .execute()
                )
            else:
                # Create new record with required fields
                logger.info(f"Creating new fee_responsibility record for application {application_id}")
                insert_data = {
                    "application_id": application_id,
                    "selected_plan": selected_plan,
                    "fee_person": "Parent",
                    "relationship": "Parent",
                    "fee_terms_accepted": False
                }
                response = self.db.table("fee_responsibility").insert(insert_data).execute()
            
            if not response.data or len(response.data) == 0:
                raise ValueError(f"Failed to save plan: database returned no records")
            
            saved_record = response.data[0]
            logger.info(f"Successfully saved plan '{selected_plan}' for application {application_id}")
            return saved_record

        except ValueError as ve:
            logger.error(f"Validation error while saving plan: {str(ve)}")
            raise ve
        except Exception as e:
            logger.error(f"Failed to save selected plan for application {application_id}: {str(e)}")
            raise e

    def get_selected_plan(self, application_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the selected plan for an application from the fee_responsibility table.
        
        Args:
            application_id: UUID of the application
            
        Returns:
            Dict containing the fee_responsibility record or None if not found
        """
        try:
            if not application_id or not isinstance(application_id, str):
                raise ValueError("Invalid application_id: must be a non-empty string")
            
            application_id = application_id.strip()
            
            logger.info(f"Fetching selected plan for application {application_id}")
            
            response = (
                self.db.table("fee_responsibility")
                .select("*")
                .eq("application_id", application_id)
                .limit(1)
                .execute()
            )
            
            if response.data and len(response.data) > 0:
                logger.info(f"Found selected plan for application {application_id}")
                return response.data[0]
            
            logger.warning(f"No selected plan found for application {application_id}")
            return None

        except Exception as e:
            logger.error(f"Failed to get selected plan for application {application_id}: {str(e)}")
            raise e


# Global instance
plan_service = PlanService()


# Backward compatibility functions
def save_selected_plan(parent_id_number: str, plan_data: dict):
    """
    Legacy function for backward compatibility.
    Extracts application_id and delegates to service.
    """
    selected_plan = plan_data.get("selected_plan", "").strip()
    return plan_service.save_selected_plan(parent_id_number, selected_plan)


def get_selected_plan(parent_id_number: str):
    """
    Legacy function for backward compatibility.
    """
    return plan_service.get_selected_plan(parent_id_number)

from fastapi import APIRouter, HTTPException, Body
from services.declaration_service import declaration_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/declarations", tags=["Declarations"])


# ✅ Save Declaration
@router.post("")
def save_declaration(declaration_data: dict = Body(...)):
    """
    Save or update a student declaration record.
    
    Body example:
    {
        "application_id": "uuid-string",
        "agree_truth": true,
        "agree_policies": true,
        "agree_financial": true,
        "agree_verification": true,
        "agree_data_processing": true,
        "agree_audit_storage": true,
        "agree_affordability_processing": true,
        "full_name": "John Doe",
        "city": "Johannesburg",
        "status": "completed"
    }
    """
    try:
        logger.info(f"[save_declaration] Received declaration data: {declaration_data}")
        
        # Validate required fields
        application_id = declaration_data.get("application_id")
        if not application_id:
            raise ValueError("application_id is required")
        
        full_name = declaration_data.get("full_name")
        if not full_name or len(full_name.strip()) < 3:
            raise ValueError("full_name must be at least 3 characters")
        
        # Extract all agreement fields
        agree_truth = declaration_data.get("agree_truth", False)
        agree_policies = declaration_data.get("agree_policies", False)
        agree_financial = declaration_data.get("agree_financial", False)
        agree_verification = declaration_data.get("agree_verification", False)
        agree_data_processing = declaration_data.get("agree_data_processing", False)
        agree_audit_storage = declaration_data.get("agree_audit_storage", False)
        agree_affordability_processing = declaration_data.get("agree_affordability_processing", False)
        
        city = declaration_data.get("city")
        status = declaration_data.get("status", "completed")
        
        # Save declaration using service
        result = declaration_service.save_declaration(
            application_id=application_id,
            agree_truth=agree_truth,
            agree_policies=agree_policies,
            agree_financial=agree_financial,
            agree_verification=agree_verification,
            agree_data_processing=agree_data_processing,
            agree_audit_storage=agree_audit_storage,
            agree_affordability_processing=agree_affordability_processing,
            full_name=full_name,
            city=city,
            status=status
        )
        
        logger.info(f"Declaration saved successfully for application_id: {application_id}")
        return {
            "message": "Declaration saved successfully",
            "declaration": result,
            "application_id": application_id
        }
    
    except ValueError as e:
        logger.warning(f"Validation error in save_declaration: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error saving declaration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Get Declaration
@router.get("/{application_id}")
def get_declaration(application_id: str):
    """
    Fetch declaration record for an application.
    """
    try:
        logger.info(f"Fetching declaration for application_id: {application_id}")
        
        declaration = declaration_service.get_declaration(application_id)
        
        if not declaration:
            logger.warning(f"No declaration found for application_id: {application_id}")
            return {
                "message": "No declaration found",
                "declaration": None,
                "application_id": application_id
            }
        
        logger.info(f"Declaration retrieved successfully for application_id: {application_id}")
        return {
            "message": "Declaration retrieved",
            "declaration": declaration,
            "application_id": application_id
        }
    except Exception as e:
        logger.error(f"Error fetching declaration for application_id {application_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

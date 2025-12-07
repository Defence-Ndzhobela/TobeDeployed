from fastapi import APIRouter, HTTPException
from schemas.parent_schema import ParentCreate
from services.parent_service import create_parent, get_parent_children, get_parent_by_application_id, get_parent_by_user_id
from services.student_service import get_students_by_parent_id, update_student_by_id_number
from services.plan_service import plan_service
from services.bank_service import save_bank_account, get_bank_account
from services.declaration_service import declaration_service
from schemas.bank_schema import BankAccountCreate
from fastapi import Body
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/parents", tags=["Parents"])

# ✅ Register new parent
@router.post("/register")
def register_parent(parent: ParentCreate):
    try:
        parent_dict = parent.dict()
        data = create_parent(parent_dict)
        return {"message": "Parent registered successfully", "parent": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ✅ Get Payment Details from fee_responsibility (for Payment Modal) - MUST BE BEFORE /{parent_id} routes!
@router.get("/payment-details/{student_id}")
def get_payment_details(student_id: str):
    """
    Fetch payment details including bank account info from fee_responsibility table.
    Used by Payment Modal to display bank account details and learner info.
    
    Args:
        student_id: Student ID (UUID)
    
    Returns:
        Payment details including bank account and learner information
    """
    try:
        from core.supabase_client import supabase
        
        print(f"\n💳 [get_payment_details] ===== START =====")
        print(f"💳 [get_payment_details] Fetching payment details for student_id='{student_id}'")
        
        # Get student details to find their application_id
        student_response = supabase.table("students").select("id, first_name, surname, application_id").eq("id", student_id).execute()
        
        if not student_response.data or len(student_response.data) == 0:
            print(f"❌ [get_payment_details] Student not found for student_id: {student_id}")
            return {
                "message": "Student not found",
                "payment_details": None
            }
        
        student = student_response.data[0]
        application_id = student.get("application_id")
        
        print(f"💳 [get_payment_details] Student found: {student.get('first_name')} {student.get('surname')}")
        print(f"💳 [get_payment_details] Application ID: {application_id}")
        
        if not application_id:
            print(f"⚠️ [get_payment_details] Student has no application_id")
            return {
                "message": "Payment details found",
                "payment_details": {
                    "student_id": student_id,
                    "student_name": f"{student.get('first_name')} {student.get('surname')}",
                    "account_holder_name": "Not provided",
                    "bank_name": "Not provided",
                    "account_type": "Cheque",
                    "account_number": "Not provided",
                    "branch_code": "Not provided",
                }
            }
        
        # Get fee_responsibility record with bank details
        print(f"💳 [get_payment_details] 🔍 Querying fee_responsibility for application_id: {application_id}")
        fee_resp = supabase.table("fee_responsibility").select("*").eq("application_id", application_id).execute()
        
        print(f"💳 [get_payment_details] fee_responsibility query response count: {len(fee_resp.data) if fee_resp.data else 0}")
        
        if not fee_resp.data or len(fee_resp.data) == 0:
            print(f"⚠️ [get_payment_details] No fee_responsibility record found for application_id: {application_id}")
            return {
                "message": "Payment details found",
                "payment_details": {
                    "student_id": student_id,
                    "student_name": f"{student.get('first_name')} {student.get('surname')}",
                    "account_holder_name": "Not provided",
                    "bank_name": "Not provided",
                    "account_type": "Cheque",
                    "account_number": "Not provided",
                    "branch_code": "Not provided",
                }
            }
        
        fee_responsibility = fee_resp.data[0]
        
        print(f"💳 [get_payment_details] Fee responsibility record found")
        
        # Get account holder name from parent_first_name and parent_surname in fee_responsibility
        parent_first_name = fee_responsibility.get("parent_first_name") or ""
        parent_surname = fee_responsibility.get("parent_surname") or ""
        account_holder_name = f"{parent_first_name} {parent_surname}".strip() or "Not provided"
        
        # Get bank details with null handling
        bank_name = fee_responsibility.get("bank_name") or "Not provided"
        account_number = fee_responsibility.get("account_number") or "Not provided"
        branch_code = fee_responsibility.get("branch_code") or "Not provided"
        account_type = fee_responsibility.get("account_type") or "Cheque"
        
        print(f"💳 [get_payment_details] Computed account_holder_name: '{account_holder_name}'")
        print(f"💳 [get_payment_details] Computed bank_name: '{bank_name}'")
        
        payment_details = {
            "student_id": student_id,
            "student_name": f"{student.get('first_name')} {student.get('surname')}",
            "account_holder_name": account_holder_name,
            "bank_name": bank_name,
            "account_type": account_type,
            "account_number": account_number,
            "branch_code": branch_code,
            "application_id": application_id
        }
        
        print(f"💳 [get_payment_details] Payment details compiled successfully")
        print(f"💳 [get_payment_details] Final payment_details: {json.dumps(payment_details, default=str)}")
        print(f"💳 [get_payment_details] ===== END =====\n")
        
        return {
            "message": "Payment details retrieved",
            "payment_details": payment_details
        }
    except Exception as e:
        print(f"❌ [get_payment_details] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Get Payment Details by Application ID (more efficient direct lookup)
@router.get("/payment-details-by-app/{application_id}")
def get_payment_details_by_app(application_id: str):
    """
    Fetch payment details directly using application_id.
    More efficient than looking up by student_id.
    
    Args:
        application_id: Application ID (UUID)
    
    Returns:
        Payment details including bank account and learner information
    """
    try:
        from core.supabase_client import supabase
        
        print(f"\n💳 [get_payment_details_by_app] ===== START =====")
        print(f"💳 [get_payment_details_by_app] Fetching payment details for application_id='{application_id}'")
        
        # Get fee_responsibility record directly
        fee_resp = supabase.table("fee_responsibility").select("*").eq("application_id", application_id).execute()
        
        print(f"💳 [get_payment_details_by_app] fee_responsibility query response count: {len(fee_resp.data) if fee_resp.data else 0}")
        
        if not fee_resp.data or len(fee_resp.data) == 0:
            print(f"⚠️ [get_payment_details_by_app] No fee_responsibility record found")
            return {
                "message": "No fee responsibility record found",
                "payment_details": {
                    "account_holder_name": "Not provided",
                    "bank_name": "Not provided",
                    "account_type": "Cheque",
                    "account_number": "Not provided",
                    "branch_code": "Not provided",
                }
            }
        
        fee_responsibility = fee_resp.data[0]
        
        print(f"💳 [get_payment_details_by_app] Fee responsibility record found")
        
        # Get account holder name from parent_first_name and parent_surname
        parent_first_name = fee_responsibility.get("parent_first_name") or ""
        parent_surname = fee_responsibility.get("parent_surname") or ""
        account_holder_name = f"{parent_first_name} {parent_surname}".strip() or "Not provided"
        
        # Get bank details with null handling
        bank_name = fee_responsibility.get("bank_name") or "Not provided"
        account_number = fee_responsibility.get("account_number") or "Not provided"
        branch_code = fee_responsibility.get("branch_code") or "Not provided"
        account_type = fee_responsibility.get("account_type") or "Cheque"
        
        print(f"💳 [get_payment_details_by_app] account_holder_name: '{account_holder_name}'")
        
        payment_details = {
            "application_id": application_id,
            "account_holder_name": account_holder_name,
            "bank_name": bank_name,
            "account_type": account_type,
            "account_number": account_number,
            "branch_code": branch_code,
        }
        
        print(f"💳 [get_payment_details_by_app] Payment details compiled successfully")
        print(f"💳 [get_payment_details_by_app] ===== END =====\n")
        
        return {
            "message": "Payment details retrieved",
            "payment_details": payment_details
        }
    except Exception as e:
        print(f"❌ [get_payment_details_by_app] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Get all bank account details for a parent's students
@router.get("/bank-details/all")
def get_all_bank_details(parent_id: str = None):
    """
    Fetch all bank account details for a parent and their students.
    Can be used to get consolidated payment information.
    
    Returns:
        List of bank account details for all student applications
    """
    try:
        from core.supabase_client import supabase
        
        print(f"\n💳 [get_all_bank_details] ===== START =====")
        print(f"💳 [get_all_bank_details] Fetching all bank details for parent")
        
        # Get all fee_responsibility records
        fee_resp = supabase.table("fee_responsibility").select("*").execute()
        
        print(f"💳 [get_all_bank_details] Found {len(fee_resp.data) if fee_resp.data else 0} fee_responsibility records")
        
        if not fee_resp.data:
            return {
                "message": "No bank details found",
                "bank_details": []
            }
        
        bank_details_list = []
        for fee_rec in fee_resp.data:
            # Get parent name
            parent_first_name = fee_rec.get("parent_first_name") or ""
            parent_surname = fee_rec.get("parent_surname") or ""
            account_holder_name = f"{parent_first_name} {parent_surname}".strip() or "Not provided"
            
            bank_details_list.append({
                "application_id": fee_rec.get("application_id"),
                "account_holder_name": account_holder_name,
                "bank_name": fee_rec.get("bank_name") or "Not provided",
                "account_type": fee_rec.get("account_type") or "Cheque",
                "account_number": fee_rec.get("account_number") or "Not provided",
                "branch_code": fee_rec.get("branch_code") or "Not provided",
            })
        
        print(f"💳 [get_all_bank_details] Compiled {len(bank_details_list)} bank detail records")
        print(f"💳 [get_all_bank_details] ===== END =====\n")
        
        return {
            "message": "Bank details retrieved",
            "bank_details": bank_details_list
        }
    except Exception as e:
        print(f"❌ [get_all_bank_details] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Fetch children from students table (legacy route)
@router.get("/{parent_id}/children")
def fetch_children(parent_id: str):
    try:
        children = get_parent_children(parent_id)
        return {"children": children}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ✅ Fetch parent info by application_id
@router.get("/{application_id}/info")
def get_parent_info(application_id: str):
    """
    Fetch primary parent information by application_id.
    Used by Header to display parent name.
    """
    try:
        logger.info(f"Fetching parent info for application_id: {application_id}")
        parent = get_parent_by_application_id(application_id)
        
        if not parent:
            return {
                "message": "No parent found",
                "parent": None,
                "application_id": application_id
            }
        
        return {
            "message": "Parent info retrieved",
            "parent": parent,
            "application_id": application_id
        }
    except Exception as e:
        logger.error(f"Error fetching parent info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Fetch parent info by user_id
@router.get("/user/{user_id}/info")
def get_parent_info_by_user(user_id: str):
    """
    Fetch primary parent information by user_id (authenticated user).
    Finds the application linked to this user, then fetches the primary parent.
    Used by Header to display logged-in parent's name.
    """
    try:
        logger.info(f"Fetching parent info for user_id: {user_id}")
        parent = get_parent_by_user_id(user_id)
        
        if not parent:
            return {
                "message": "No parent found",
                "parent": None,
                "user_id": user_id
            }
        
        return {
            "message": "Parent info retrieved",
            "parent": parent,
            "user_id": user_id
        }
    except Exception as e:
        logger.error(f"Error fetching parent info by user_id: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ NEW — Professional route for Parent Dashboard
@router.get("/{parent_id}/students")
def get_parent_students(parent_id: str):
    """
    Fetch all students linked to a parent via parent_id (South African ID number).
    Used by Parent Dashboard.
    """
    try:
        students = get_students_by_parent_id(parent_id)
        return {"students": students}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ✅ Update student details
@router.put("/students/{application_id}")
def update_student_details(application_id: str, updates: dict = Body(...)):
    """
    Body example:
    {
        "grade_applied_for": "12",
        "street_address": "456 New Street",
        "city": "Giyani",
        "state": "Dzumeri",
        "postcode": "1234",
        "phone_number": "0812345678",
        "email": "student@example.com"
    }
    """
    try:
        updated_student = update_student_by_id_number(application_id, updates)
        return {"message": "Student updated successfully", "student": updated_student}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating student: {str(e)}")

# ✅ Get latest selected plan for a parent/application
@router.get("/{application_id}/selected-plan")
def fetch_selected_plan(application_id: str):
    """
    Fetch the selected plan for an application from fee_responsibility table.
    """
    try:
        logger.info(f"Fetching selected plan for application_id: {application_id}")
        
        plan = plan_service.get_selected_plan(application_id)
        
        if not plan:
            logger.warning(f"No selected plan found for application {application_id}")
            return {"message": "No selected plan found", "plan": None}
        
        logger.info(f"Successfully retrieved selected plan for application {application_id}")
        return {"plan": plan}
    except Exception as e:
        logger.error(f"Error fetching selected plan for application {application_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Save selected plan for an application
@router.post("/{application_id}/selected-plan")
def save_plan(application_id: str, plan_data: dict = Body(...)):
    """
    Save selected plan for an application.
    
    Body example:
    {
        "selected_plan": "sibling-benefit"
    }
    """
    try:
        logger.info(f"Received POST request to save plan for application_id: {application_id}")
        logger.debug(f"Plan data: {plan_data}")
        
        if not plan_data.get("selected_plan"):
            raise ValueError("selected_plan is required in request body")
        
        selected_plan = plan_data.get("selected_plan")
        logger.info(f"Saving plan '{selected_plan}' for application {application_id}")
        
        # Call service to save plan
        result = plan_service.save_selected_plan(application_id, selected_plan)
        
        logger.info(f"Plan saved successfully for application {application_id}")
        return {
            "message": "Plan saved successfully",
            "plan": result,
            "application_id": application_id
        }
    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error saving plan for application {application_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to save plan: {str(e)}")

# ✅ Test endpoint - check all plans for a parent
@router.get("/{parent_id}/test-plans")
def test_all_plans(parent_id: str):
    """Test endpoint to see all plans for debugging"""
    try:
        from core.supabase_client import supabase
        print(f"\n🧪 [test_all_plans] Fetching all plans for parent_id='{parent_id}'")
        response = supabase.table("plan_selection").select("*").eq("parent_id_number", parent_id).execute()
        print(f"🧪 [test_all_plans] Found {len(response.data) if response.data else 0} plans")
        print(f"🧪 [test_all_plans] Plans: {response.data}\n")
        return {"total": len(response.data) if response.data else 0, "plans": response.data}
    except Exception as e:
        print(f"❌ [test_all_plans] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Send registration completion email
@router.post("/{parent_id}/send-registration-email")
def send_registration_email(parent_id: str, email_data: dict = Body(...)):
    """
    Send registration completion email
    Body example:
    {
        "parent_email": "parent@example.com",
        "parent_name": "John Doe",
        "student_names": ["Student One", "Student Two"],
        "selected_plan": "Monthly Debit Order"
    }
    """
    try:
        from services.email_service import send_registration_completion_email
        
        print(f"\n📧 [send_registration_email] ===== START =====")
        print(f"📧 [send_registration_email] Received request for parent_id='{parent_id}'")
        print(f"📧 [send_registration_email] Email data: {email_data}")
        
        result = send_registration_completion_email(
            to_email=email_data.get("parent_email"),
            parent_name=email_data.get("parent_name"),
            student_names=email_data.get("student_names", []),
            selected_plan=email_data.get("selected_plan", "N/A")
        )
        
        print(f"📧 [send_registration_email] Email sent successfully")
        print(f"📧 [send_registration_email] ===== END =====\n")
        
        return {"message": "Registration email sent successfully", "sent": result}
    except Exception as e:
        print(f"❌ [send_registration_email] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Save Bank Account Details
@router.post("/{parent_id}/bank-account")
def save_bank_details(parent_id: str, bank_data: dict = Body(...)):
    """
    Save bank account details for debit order mandate creation.
    
    Body example:
    {
        "account_holder_name": "John Doe",
        "bank_name": "ABSA",
        "account_type": "Cheque",
        "account_number": "12345678",
        "branch_code": "632005",
        "id_number": "9001015001088",
        "phone_number": "0123456789"
    }
    """
    try:
        print(f"\n💳 [save_bank_details] ===== START =====")
        print(f"💳 [save_bank_details] Received POST request for parent_id='{parent_id}'")
        print(f"💳 [save_bank_details] Bank data: {bank_data}")
        
        # Validate data
        bank_account = BankAccountCreate(**bank_data)
        
        # Save to database
        result = save_bank_account(parent_id, bank_account.dict())
        
        print(f"💳 [save_bank_details] Bank account saved successfully")
        print(f"💳 [save_bank_details] ===== END =====\n")
        
        return {"message": "Bank account details saved successfully", "bank_account": result}
    except Exception as e:
        print(f"❌ [save_bank_details] Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ✅ Get Bank Account Details
@router.get("/{parent_id}/bank-account")
def get_bank_details(parent_id: str):
    """
    Retrieve bank account details for a parent.
    """
    try:
        print(f"\n💳 [get_bank_details] ===== START =====")
        print(f"💳 [get_bank_details] Received GET request for parent_id='{parent_id}'")
        
        bank_account = get_bank_account(parent_id)
        
        if not bank_account:
            print(f"⚠️ [get_bank_details] No bank account found")
            return {"message": "No bank account details found", "bank_account": None}
        
        print(f"💳 [get_bank_details] Bank account retrieved successfully")
        print(f"💳 [get_bank_details] ===== END =====\n")
        
        return {"message": "Bank account details retrieved", "bank_account": bank_account}
    except Exception as e:
        print(f"❌ [get_bank_details] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

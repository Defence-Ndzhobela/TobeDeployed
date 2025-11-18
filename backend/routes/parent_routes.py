from fastapi import APIRouter, HTTPException
from schemas.parent_schema import ParentCreate
from services.parent_service import create_parent, get_parent_children
from services.student_service import get_students_by_parent_id, update_student_by_id_number  # ✅ new import
from services.plan_service import get_selected_plan, save_selected_plan  # ✅ new import
from fastapi import Body

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


# ✅ Fetch children from students table (legacy route)
@router.get("/{parent_id}/children")
def fetch_children(parent_id: str):
    try:
        children = get_parent_children(parent_id)
        return {"children": children}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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

# ✅ Get latest selected plan for a parent
@router.get("/{parent_id}/selected-plan")
def fetch_selected_plan(parent_id: str):
    try:
        print(f"\n📥 [fetch_selected_plan] ===== START =====")
        print(f"📥 [fetch_selected_plan] Received GET request for parent_id='{parent_id}' (length: {len(parent_id)})")
        plan = get_selected_plan(parent_id)
        print(f"📤 [fetch_selected_plan] Returning plan: {plan}")
        print(f"📤 [fetch_selected_plan] ===== END =====\n")
        if not plan:
            return {"message": "No selected plan found", "plan": None}
        return {"plan": plan}
    except Exception as e:
        print(f"❌ [fetch_selected_plan] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Save selected plan for a parent
@router.post("/{parent_id}/selected-plan")
def save_plan(parent_id: str, plan_data: dict = Body(...)):
    """
    Body example:
    {
        "selected_plan": "pay-monthly",
        "total_price": 7083,
        "period": "per month"
    }
    """
    try:
        print(f"\n📥 [save_plan] ===== START =====")
        print(f"📥 [save_plan] Received POST request for parent_id='{parent_id}' (length: {len(parent_id)})")
        print(f"📥 [save_plan] Plan data: {plan_data}")
        result = save_selected_plan(parent_id, plan_data)
        print(f"📤 [save_plan] Saved successfully: {result}")
        print(f"📤 [save_plan] ===== END =====\n")
        return {"message": "Plan saved successfully", "plan": result}
    except Exception as e:
        print(f"❌ [save_plan] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

from fastapi import APIRouter, HTTPException
from schemas.parent_schema import ParentCreate
from services.parent_service import create_parent, get_parent_children
from services.student_service import get_students_by_parent_id  # ✅ new import
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
        updated_student = update_student(application_id, updates)
        return {"message": "Student updated successfully", "student": updated_student}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating student: {str(e)}")
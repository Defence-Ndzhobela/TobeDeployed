from fastapi import APIRouter, HTTPException
from services.student_service import create_student, get_students_by_parent_id, get_students_by_user_id, update_student_by_id_number

# Use a clear API prefix so frontend (/api/students/...) matches the backend routes
router = APIRouter(prefix="/api/students", tags=["Students"])


@router.post("/register")
def register_student(student: dict):
    try:
        result = create_student(student)
        return {"message": "Student registered successfully", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating student: {str(e)}")


@router.get("/parent/{parent_id}")
def get_students_for_parent(parent_id: str):
    try:
        students = get_students_by_parent_id(parent_id)
        if not students:
            raise HTTPException(status_code=404, detail="No students found for this parent.")
        return {"students": students}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching students: {str(e)}")


@router.get("/user/{user_id}")
def get_students_for_user(user_id: str):
    try:
        students = get_students_by_user_id(user_id)
        if not students:
            raise HTTPException(status_code=404, detail="No students found for this user.")
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching students: {str(e)}")


@router.put("/{id_number}")
def update_student(id_number: str, student: dict):
    try:
        result = update_student_by_id_number(id_number, student)
        if not result:
            raise HTTPException(status_code=404, detail="Student not found")
        return {"message": "Student updated successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating student: {str(e)}")
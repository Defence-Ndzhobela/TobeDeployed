"""
Service layer for facility linking management
"""
from datetime import datetime
from core.supabase_client import supabase

def link_facility_to_student(facility_data: dict) -> dict:
    """
    Link a facility to a student.
    Required fields: student_id, application_id, parent_id_number, facility_name
    Optional fields: is_linked, status
    """
    try:
        response = supabase.table("facility_linking").insert(facility_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error linking facility: {e}")
        return None

def get_facility_by_student(student_id: str) -> dict:
    """
    Get facility linking status for a student.
    """
    try:
        response = (
            supabase.table("facility_linking")
            .select("*")
            .eq("student_id", student_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error fetching facility for student: {e}")
        return None

def get_all_facilities_by_parent(parent_id_number: str) -> list:
    """
    Get all facilities linked to a parent's students.
    """
    try:
        response = (
            supabase.table("facility_linking")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching parent facilities: {e}")
        return []

def is_facility_linked(student_id: str) -> bool:
    """
    Check if a student has a linked facility.
    """
    try:
        facility = get_facility_by_student(student_id)
        return facility is not None and facility.get("is_linked", False)
    except Exception as e:
        print(f"❌ Error checking facility link: {e}")
        return False

def update_facility_status(facility_id: int, status: str) -> dict:
    """
    Update facility status.
    Status: "active", "inactive", "pending"
    """
    try:
        response = (
            supabase.table("facility_linking")
            .update({
                "status": status,
                "updated_at": datetime.now().isoformat()
            })
            .eq("id", facility_id)
            .execute()
        )
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error updating facility status: {e}")
        return None

def unlink_facility(facility_id: int) -> bool:
    """
    Unlink a facility from a student.
    """
    try:
        response = (
            supabase.table("facility_linking")
            .update({
                "is_linked": False,
                "status": "inactive",
                "updated_at": datetime.now().isoformat()
            })
            .eq("id", facility_id)
            .execute()
        )
        return response.data is not None
    except Exception as e:
        print(f"❌ Error unlinking facility: {e}")
        return False

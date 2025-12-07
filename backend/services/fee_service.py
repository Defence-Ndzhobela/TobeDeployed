"""
Service layer for fees management
"""
from core.supabase_client import supabase

def get_fee_by_grade(grade_level: str) -> dict:
    """
    Get fee structure for a specific grade level.
    Returns None if not found.
    """
    try:
        response = supabase.table("fees").select("*").eq("grade_level", grade_level).eq("is_active", True).execute()
        if response.data and len(response.data) > 0:
            fee = response.data[0]
            return {
                "id": fee["id"],
                "grade_level": fee["grade_level"],
                "tuition_fees": float(fee["tuition_fees"]),
                "activity_fees": float(fee["activity_fees"]),
                "facility_fees": float(fee["facility_fees"]),
                "other_fees": float(fee["other_fees"]),
                "total_monthly_fee": float(fee["total_monthly_fee"]),
                "effective_date": fee["effective_date"]
            }
        return None
    except Exception as e:
        print(f"❌ Error fetching fee for grade {grade_level}: {e}")
        return None

def get_all_active_fees() -> list:
    """Get all active fee structures"""
    try:
        response = supabase.table("fees").select("*").eq("is_active", True).execute()
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching all fees: {e}")
        return []

def update_fee(grade_level: str, fee_data: dict) -> dict:
    """Update fee structure for a grade level"""
    try:
        response = supabase.table("fees").update(fee_data).eq("grade_level", grade_level).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error updating fee for {grade_level}: {e}")
        return None

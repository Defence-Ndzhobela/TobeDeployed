"""
Service layer for payment schedule management
"""
from datetime import datetime, date, timedelta
from core.supabase_client import supabase

def create_payment_schedule(schedule_data: dict) -> dict:
    """
    Create a new payment schedule record.
    Required fields: parent_id_number, student_id, application_id, due_date, amount_due, month_due
    """
    try:
        response = supabase.table("payment_schedule").insert(schedule_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error creating payment schedule: {e}")
        return None

def get_schedule_by_student_month(student_id: str, month_due: str) -> dict:
    """
    Get payment schedule for a student in a specific month.
    month_due format: "2025-11"
    """
    try:
        response = (
            supabase.table("payment_schedule")
            .select("*")
            .eq("student_id", student_id)
            .eq("month_due", month_due)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error fetching schedule for student {student_id}: {e}")
        return None

def get_upcoming_payments(parent_id_number: str, days_ahead: int = 30) -> list:
    """
    Get upcoming payments due within X days.
    """
    try:
        today = date.today().isoformat()
        future_date = (date.today() + timedelta(days=days_ahead)).isoformat()
        
        response = (
            supabase.table("payment_schedule")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .gte("due_date", today)
            .lte("due_date", future_date)
            .order("due_date", desc=False)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching upcoming payments: {e}")
        return []

def get_overdue_payments(parent_id_number: str) -> list:
    """
    Get all overdue payments for a parent.
    """
    try:
        today = date.today().isoformat()
        
        response = (
            supabase.table("payment_schedule")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .lt("due_date", today)
            .neq("status", "paid")
            .order("due_date", desc=False)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching overdue payments: {e}")
        return []

def update_payment_schedule_status(schedule_id: int, status: str) -> dict:
    """
    Update the status of a payment schedule.
    Status: "pending", "partial", "paid", "overdue"
    """
    try:
        response = (
            supabase.table("payment_schedule")
            .update({"status": status, "updated_at": datetime.now().isoformat()})
            .eq("id", schedule_id)
            .execute()
        )
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error updating schedule status: {e}")
        return None

def get_all_schedules_by_parent(parent_id_number: str) -> list:
    """
    Get all payment schedules for a parent.
    """
    try:
        response = (
            supabase.table("payment_schedule")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .order("due_date", desc=False)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching all schedules: {e}")
        return []

"""
Service layer for payments management
"""
from datetime import datetime, date
from core.supabase_client import supabase

def create_payment(payment_data: dict) -> dict:
    """
    Create a new payment record.
    Required fields: parent_id_number, student_id, application_id, payment_amount, payment_date
    """
    try:
        response = supabase.table("payments").insert(payment_data).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error creating payment: {e}")
        return None

def get_payments_by_parent_month(parent_id_number: str, month_due: str) -> list:
    """
    Get all payments for a parent in a specific month.
    month_due format: "2025-11"
    """
    try:
        response = (
            supabase.table("payments")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .eq("month_covered", month_due)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching payments for {parent_id_number} ({month_due}): {e}")
        return []

def get_payments_by_student_month(student_id: str, month_due: str) -> list:
    """
    Get all payments for a student in a specific month.
    month_due format: "2025-11"
    """
    try:
        response = (
            supabase.table("payments")
            .select("*")
            .eq("student_id", student_id)
            .eq("month_covered", month_due)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching payments for student {student_id} ({month_due}): {e}")
        return []

def get_total_paid_by_parent_month(parent_id_number: str, month_due: str) -> float:
    """
    Get total amount paid by a parent in a specific month.
    """
    try:
        payments = get_payments_by_parent_month(parent_id_number, month_due)
        total = sum(float(p.get("payment_amount", 0)) for p in payments if p.get("status") == "completed")
        return total
    except Exception as e:
        print(f"❌ Error calculating total paid: {e}")
        return 0.0

def get_total_paid_by_student_month(student_id: str, month_due: str) -> float:
    """
    Get total amount paid for a student in a specific month.
    """
    try:
        payments = get_payments_by_student_month(student_id, month_due)
        total = sum(float(p.get("payment_amount", 0)) for p in payments if p.get("status") == "completed")
        return total
    except Exception as e:
        print(f"❌ Error calculating total paid for student: {e}")
        return 0.0

def get_payment_history(parent_id_number: str, limit: int = 10) -> list:
    """
    Get payment history for a parent (last N payments).
    """
    try:
        response = (
            supabase.table("payments")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .order("payment_date", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"❌ Error fetching payment history: {e}")
        return []

def get_payment_by_receipt(receipt_number: str) -> dict:
    """
    Get a specific payment by receipt number.
    """
    try:
        response = supabase.table("payments").select("*").eq("receipt_number", receipt_number).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"❌ Error fetching payment by receipt: {e}")
        return None

"""
Comprehensive Dashboard Service - Aggregates data from all tables
"""
from datetime import datetime, date
from services.fee_service import get_fee_by_grade
from services.payment_service import get_total_paid_by_student_month
from services.payment_schedule_service import get_schedule_by_student_month, get_upcoming_payments
from services.facility_service import is_facility_linked
from services.student_service import get_students_by_parent_id

def get_current_month_str() -> str:
    """Get current month in YYYY-MM format"""
    today = date.today()
    return today.strftime("%Y-%m")

def calculate_payment_status(paid_amount: float, monthly_fee: float) -> str:
    """
    Determine payment status based on amount paid vs monthly fee.
    Returns: "up-to-date", "partial", "overdue", "no-facility"
    """
    if paid_amount == 0:
        return "overdue"
    elif paid_amount >= monthly_fee:
        return "up-to-date"
    else:
        return "partial"

def get_parent_dashboard(parent_id_number: str) -> dict:
    """
    Get comprehensive dashboard data for a parent.
    Aggregates data from students, fees, payments, and schedules.
    """
    try:
        print(f"📊 [get_parent_dashboard] Fetching dashboard for parent: {parent_id_number}")
        
        # Get all students for this parent
        students_response = get_students_by_parent_id(parent_id_number)
        
        if not students_response or len(students_response) == 0:
            print(f"⚠️ No students found for parent {parent_id_number}")
            return None
        
        print(f"✅ Found {len(students_response)} students")
        
        current_month = get_current_month_str()
        learners = []
        total_monthly_fees = 0
        total_paid_this_month = 0
        total_outstanding = 0
        
        # Process each student
        for student in students_response:
            student_id = student.get("id_number") or student.get("student_id")
            grade = student.get("grade_applied_for") or "N/A"
            
            print(f"  📚 Processing student: {student.get('first_name')} {student.get('surname')} ({grade})")
            
            # Get fee structure from FEES table
            fee_info = get_fee_by_grade(grade)
            if not fee_info:
                print(f"  ⚠️ No fee structure found for grade {grade}, using default")
                monthly_fee = 4500.00
                fee_breakdown = {
                    "tuition_fees": 2700.00,
                    "activity_fees": 900.00,
                    "facility_fees": 630.00,
                    "other_fees": 360.00
                }
            else:
                monthly_fee = fee_info.get("total_monthly_fee", 4500.00)
                fee_breakdown = {
                    "tuition_fees": fee_info.get("tuition_fees", 0),
                    "activity_fees": fee_info.get("activity_fees", 0),
                    "facility_fees": fee_info.get("facility_fees", 0),
                    "other_fees": fee_info.get("other_fees", 0)
                }
            
            # Get payments for this student this month
            paid_this_month = get_total_paid_by_student_month(student_id, current_month)
            outstanding_amount = max(0, monthly_fee - paid_this_month)
            
            # Get next payment schedule
            schedule = get_schedule_by_student_month(student_id, current_month)
            if schedule:
                next_payment_date = schedule.get("due_date", "")
            else:
                # Default to 15th of next month if no schedule exists
                from datetime import date, timedelta
                today = date.today()
                if today.day > 15:
                    next_date = date(today.year, today.month, 15) + timedelta(days=30)
                else:
                    next_date = date(today.year, today.month, 15)
                next_payment_date = next_date.isoformat()
            
            # Check facility status
            facility_linked = is_facility_linked(student_id)
            
            # Determine payment status
            payment_status = calculate_payment_status(paid_this_month, monthly_fee)
            
            # Build learner object
            learner = {
                "id": student.get("application_id") or student_id,
                "first_name": student.get("first_name", ""),
                "surname": student.get("surname", ""),
                "student_id": student_id,
                "grade": grade,
                "monthly_fee": monthly_fee,
                "paid_this_month": paid_this_month,
                "outstanding_amount": outstanding_amount,
                "next_payment_date": next_payment_date,
                "facility_linked": facility_linked,
                "payment_status": payment_status
            }
            
            learners.append(learner)
            total_monthly_fees += monthly_fee
            total_paid_this_month += paid_this_month
            total_outstanding += outstanding_amount
            
            print(f"    ✓ Fee: R{monthly_fee:.2f} | Paid: R{paid_this_month:.2f} | Outstanding: R{outstanding_amount:.2f}")
        
        # Get overall fee breakdown (average across all students)
        if learners:
            avg_fee_breakdown = {
                "tuition_fees": (total_monthly_fees * 0.6) / len(learners) * len(learners),
                "activity_fees": (total_monthly_fees * 0.18) / len(learners) * len(learners),
                "facility_fees": (total_monthly_fees * 0.14) / len(learners) * len(learners),
                "other_fees": (total_monthly_fees * 0.08) / len(learners) * len(learners)
            }
        else:
            avg_fee_breakdown = {
                "tuition_fees": 0,
                "activity_fees": 0,
                "facility_fees": 0,
                "other_fees": 0
            }
        
        dashboard_data = {
            "total_learners": len(learners),
            "total_monthly_fees": total_monthly_fees,
            "total_paid_this_month": total_paid_this_month,
            "outstanding_amount": total_outstanding,
            "learners": learners,
            "fee_breakdown": avg_fee_breakdown,
            "current_month": current_month,
            "generated_at": datetime.now().isoformat()
        }
        
        print(f"✅ Dashboard ready: {len(learners)} learners, Total fees: R{total_monthly_fees:.2f}, Outstanding: R{total_outstanding:.2f}\n")
        return dashboard_data
        
    except Exception as e:
        print(f"❌ Error generating dashboard: {e}")
        import traceback
        traceback.print_exc()
        return None

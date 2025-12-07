from fastapi import APIRouter, HTTPException, status
from core.supabase_client import get_supabase_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/school-fees", tags=["school-fees"])


def normalize_grade(grade: str) -> str:
    """
    ✅ GRADE NORMALIZATION HELPER
    
    WHY THIS MATTERS:
    - Students table has: "Grade 7", "Grade 8", "12", "10", etc.
    - school_fees table expects: exactly "Grade 8", "Grade 10", "Grade 12" etc.
    - Without normalization, grade "12" doesn't match "Grade 12" → 404 error
    
    LOGIC:
    1. Strip whitespace and lowercase
    2. If it's just a number (7, 8, 10, 11, 12) → convert to "Grade X"
    3. If it starts with "grade" → standardize to "Grade X"
    4. Try exact match in DB if all else fails
    """
    grade = grade.strip()
    grade_lower = grade.lower()
    
    # Case 1: Pure number like "12" or " 10 "
    if grade.isdigit() or grade_lower.isdigit():
        num = grade.strip()
        return f"Grade {num}"
    
    # Case 2: "grade 12" or "Grade12" or variations
    if grade_lower.startswith("grade"):
        parts = grade_lower.split()
        if len(parts) >= 2 and parts[1].replace(' ', '').isdigit():
            num = parts[1]
            return f"Grade {num}"
        # Handle "Grade12" (no space)
        remainder = grade_lower[5:].strip()
        if remainder.isdigit():
            return f"Grade {remainder}"
    
    # Case 3: Already properly formatted "Grade 10"
    if grade.startswith("Grade "):
        return grade
    
    # Fallback: return as-is
    return grade


@router.get("")
async def get_all_fees():
    """
    ✅ Get all school fees across all grades
    
    Returns:
        List of fee data for all grades
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table("school_fees").select("*").execute()
        
        if not response.data:
            logger.warning("No fees found in school_fees table")
            return {"fees": [], "count": 0}
        
        return {"fees": response.data, "count": len(response.data)}
        
    except Exception as e:
        logger.error(f"Error fetching all fees: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching fees: {str(e)}"
        )


@router.get("/{grade}")
async def get_fee_by_grade(grade: str):
    """
    ✅ Get school fees for a specific grade with smart matching
    
    ❌ PREVIOUS ISSUES:
    - Input "12" couldn't find "Grade 12" in DB → 404
    - No grade normalization
    - No helpful error messages
    - No fallback search
    
    ✅ FIXES APPLIED:
    - normalize_grade() converts "12" → "Grade 12"
    - Exact match first (most efficient)
    - Fuzzy ILIKE fallback if exact fails
    - Returns all available grades if not found
    - Clear logging at each step
    
    Args:
        grade: Grade identifier ("12", "Grade 10", "grade 8", etc.)
        
    Returns:
        {
            "grade": "Grade 12",
            "annual_fee": 63000,
            "term_fee": 15750,
            "registration_fee": 800,
            "re_registration_fee": 400,
            "sport_fee": 0
        }
    """
    try:
        supabase = get_supabase_client()
        
        # Step 1: Normalize the input grade
        normalized_grade = normalize_grade(grade)
        logger.info(f"📍 School Fees: Input '{grade}' → Normalized '{normalized_grade}'")
        
        # Step 2: Try EXACT match first (fastest)
        response = supabase.table("school_fees").select("*").eq("grade", normalized_grade).execute()
        
        if response.data and len(response.data) > 0:
            fee_data = response.data[0]
            logger.info(f"✅ Found fees via EXACT match: {normalized_grade}")
            return {
                "grade": fee_data.get("grade"),
                "annual_fee": fee_data.get("annual_fee"),
                "term_fee": fee_data.get("term_fee"),
                "registration_fee": fee_data.get("registration_fee", 800),
                "re_registration_fee": fee_data.get("re_registration_fee", 400),
                "sport_fee": fee_data.get("sport_fee", 0),
            }
        
        # Step 3: FUZZY fallback (case-insensitive partial match)
        logger.warning(f"⚠️  No EXACT match for '{normalized_grade}', trying fuzzy search with '{grade}'...")
        response = supabase.table("school_fees").select("*").ilike("grade", f"%{grade}%").execute()
        
        if response.data and len(response.data) > 0:
            fee_data = response.data[0]
            logger.info(f"✅ Found fees via FUZZY match: {fee_data.get('grade')}")
            return {
                "grade": fee_data.get("grade"),
                "annual_fee": fee_data.get("annual_fee"),
                "term_fee": fee_data.get("term_fee"),
                "registration_fee": fee_data.get("registration_fee", 800),
                "re_registration_fee": fee_data.get("re_registration_fee", 400),
                "sport_fee": fee_data.get("sport_fee", 0),
            }
        
        # Step 4: NOT FOUND - Get all available grades for helpful error
        logger.error(f"❌ Grade '{grade}' (normalized: '{normalized_grade}') NOT found in school_fees")
        all_response = supabase.table("school_fees").select("grade").execute()
        available = [g.get("grade") for g in all_response.data or []]
        
        error_detail = f"Grade '{grade}' not found. Available grades: {', '.join(available) if available else 'NONE'}"
        logger.error(f"   Available: {error_detail}")
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_detail
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching fees for grade '{grade}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching fees: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching fees: {str(e)}"
        )

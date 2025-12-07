from typing import Optional, Dict
from core.supabase_client import get_supabase_client


class SchoolFeesService:
    """Service for handling school fees operations"""

    @staticmethod
    async def get_fee_by_grade(grade: str) -> Optional[Dict]:
        """
        Fetch school fees for a specific grade
        
        Args:
            grade: Grade identifier (e.g., 'GR_R', 'GR_1-6', 'GR_7-9', 'GR_10-11', 'GR_12')
            
        Returns:
            Dictionary with fee data or None if not found
        """
        try:
            supabase = get_supabase_client()
            
            # Query without .single() to avoid errors when no rows found
            response = supabase.table('school_fees').select('*').eq('grade', grade).execute()
            
            if response.data and len(response.data) > 0:
                data = response.data[0]
                return {
                    'grade': data.get('grade'),
                    'annual_fee': data.get('annual_fee'),
                    'term_fee': data.get('term_fee'),
                    'registration_fee': data.get('registration_fee'),
                    're_registration_fee': data.get('re_registration_fee'),
                    'sport_fee': data.get('sport_fee', 0)
                }
            return None
            
        except Exception as e:
            print(f"Error fetching fees for grade {grade}: {str(e)}")
            return None

    @staticmethod
    async def get_all_fees() -> list:
        """
        Fetch all school fees
        
        Returns:
            List of fee dictionaries
        """
        try:
            supabase = get_supabase_client()
            
            response = supabase.table('school_fees').select('*').execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error fetching all fees: {str(e)}")
            return []

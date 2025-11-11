from core.supabase_client import supabase
from passlib.context import CryptContext
from typing import List, Dict

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_parent(parent_data: dict) -> Dict:
    """
    Create a new parent and their linked address.
    """
    try:
        # ✅ Step 1: Insert address
        address_response = supabase.table("addresses").insert({
            "street_address": parent_data.pop("street_address"),
            "city": parent_data.pop("city"),
            "state": parent_data.pop("state"),
            "postcode": parent_data.pop("postcode"),
        }).execute()

        if not address_response.data:
            raise ValueError("Failed to create address")

        address_id = address_response.data[0]["address_id"]

        # ✅ Step 2: Hash password
        parent_data["password_hash"] = pwd_context.hash(parent_data.pop("password"))

        # ✅ Step 3: Link address
        parent_data["address_id"] = address_id

        # ✅ Step 4: Insert parent
        response = supabase.table("parents").insert(parent_data).execute()

        if not response.data:
            raise ValueError("Failed to create parent")

        return response.data[0]

    except Exception as e:
        print(f"❌ [create_parent] Error: {e}")
        raise e


def get_parent_children(parent_id: str) -> List[Dict]:
    """
    Fetch all students (children) linked to a parent_id (South African ID number).
    """
    try:
        print(f"🔍 Fetching students for parent_id={parent_id}")

        # Include full student contact/address fields so frontend can display/edit them
        students_response = (
            supabase.table("students")
            .select(
                "application_id, first_name, surname, grade_applied_for, id_number, gender, date_of_birth, street_address, city, state, postcode, phone_number, email, status"
            )
            .eq("parent_id", parent_id)
            .execute()
        )

        if not students_response.data:
            print("⚠️ No students found for this parent.")
            return []

        return students_response.data

    except Exception as e:
        print(f"❌ [get_parent_children] Error: {e}")
        raise e

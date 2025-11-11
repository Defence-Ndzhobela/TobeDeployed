from core.supabase_client import supabase
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Create a new student
def create_student(student: dict):
    print("📥 Incoming student data:", student)

    # 1️⃣ Check parent exists by SA ID (linked through id_number)
    parent_check = supabase.table("parents").select("*").eq("id_number", student["parent_id"]).execute()
    if not parent_check.data or len(parent_check.data) == 0:
        raise ValueError(f"Parent with ID {student['parent_id']} does not exist")

    # 2️⃣ Insert address
    address_data = {
        "street_address": student["street_address"],
        "city": student["city"],
        "state": student["state"],
        "postcode": student["postcode"],
    }
    address_res = supabase.table("addresses").insert(address_data).execute()
    if not address_res.data:
        raise ValueError("Failed to insert address")

    address_id = address_res.data[0]["address_id"]
    student["address_id"] = address_id  # add foreign key

    # 3️⃣ Hash password
    student["password_hash"] = pwd_context.hash(student.pop("password"))

    # 4️⃣ Insert student
    student_to_insert = student.copy()
    res = supabase.table("students").insert(student_to_insert).execute()

    if not res.data:
        raise ValueError("Failed to insert student")

    print("🎓 Student inserted:", res.data)
    return res.data


# ✅ Fetch all students for a parent (Parent Dashboard)
def get_students_by_parent_id(parent_id: str):
    """
    Fetch all students linked to a parent by their ID number.
    """
    try:
        print(f"🔍 Fetching students for parent_id={parent_id}")

        # Return additional fields (address/contact/date_of_birth) so frontend can show and edit them
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

        print(f"✅ Found {len(students_response.data)} students")
        return students_response.data

    except Exception as e:
        print(f"❌ [get_students_by_parent_id] Error: {e}")
        raise e
    
def update_student_by_id_number(id_number: str, student_data: dict):
    # Fetch student first
    existing = supabase.table("students").select("*").eq("id_number", id_number).execute()
    if not existing.data or len(existing.data) == 0:
        return None

    student_record = existing.data[0]

    # Update address table if you want
    address_update = {
        "street_address": student_data.get("street_address", student_record["street_address"]),
        "city": student_data.get("city", student_record["city"]),
        "state": student_data.get("state", student_record["state"]),
        "postcode": student_data.get("postcode", student_record["postcode"]),
    }
    supabase.table("addresses").update(address_update).eq("address_id", student_record["address_id"]).execute()

    # Update student table
    student_update = {
        "grade_applied_for": student_data.get("grade_applied_for", student_record["grade_applied_for"]),
        "street_address": address_update["street_address"],
        "city": address_update["city"],
        "state": address_update["state"],
        "postcode": address_update["postcode"],
        "phone_number": student_data.get("phone_number", student_record["phone_number"]),
        "email": student_data.get("email", student_record["email"]),
    }

    res = supabase.table("students").update(student_update).eq("id_number", id_number).execute()
    return res.data


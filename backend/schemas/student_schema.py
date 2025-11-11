from pydantic import BaseModel, EmailStr

class StudentCreate(BaseModel):
    id_number: str
    surname: str
    first_name: str
    date_of_birth: str
    gender: str
    home_language: str
    previous_grade: str
    grade_applied_for: str
    previous_school: str
    street_address: str
    city: str
    state: str
    postcode: str
    phone_number: str
    email: EmailStr
    password: str
    parent_id: str  # Must exist in parents table

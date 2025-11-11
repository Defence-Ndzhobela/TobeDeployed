from pydantic import BaseModel, EmailStr

class ParentCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    id_number: str
    password: str
    street_address: str
    city: str
    state: str
    postcode: str

# schemas/login_schema.py
from pydantic import BaseModel

class LoginRequest(BaseModel):
    id_number: str

"""
Bank Account Schema - Validation for debit order mandates
"""

from pydantic import BaseModel, Field, validator


class BankAccountCreate(BaseModel):
    """Schema for creating/updating bank account details"""
    account_holder_name: str = Field(..., min_length=3, max_length=50)
    bank_name: str = Field(..., min_length=3)
    account_type: str = Field(..., min_length=3)  # Cheque, Savings, etc.
    account_number: str = Field(..., min_length=8, max_length=17)
    branch_code: str = Field(..., min_length=6, max_length=6)

    @validator('account_number')
    def validate_account_number(cls, v):
        if not v.isdigit():
            raise ValueError('Account number must be numeric only')
        return v

    @validator('branch_code')
    def validate_branch_code(cls, v):
        if not v.isdigit():
            raise ValueError('Branch code must be numeric only')
        if len(v) != 6:
            raise ValueError('Branch code must be exactly 6 digits')
        return v

    @validator('account_holder_name')
    def validate_holder_name(cls, v):
        if not v.strip():
            raise ValueError('Account holder name cannot be empty')
        if len(v.strip()) < 3:
            raise ValueError('Account holder name must be at least 3 characters')
        return v.strip()


class BankAccountResponse(BaseModel):
    """Response schema for bank account"""
    id: int
    parent_id_number: str
    account_holder_name: str
    bank_name: str
    account_type: str
    account_number: str
    branch_code: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

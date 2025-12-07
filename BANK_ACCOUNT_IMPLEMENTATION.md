# Bank Account Details Implementation - Complete Guide

## 🎯 Overview
Bank account details form has been added to the **Update Details** page (`/re-registration/update-details`) to collect information needed for Netcash debit order mandate creation.

## ✅ Features Implemented

### Frontend (UpdateDetails.tsx)
✅ **Bank Account Form Section** with:
- Account Holder Name (3-50 characters)
- Bank Name (dropdown: ABSA, FNB, Nedbank, Standard, Capitec, Discovery, African, TymeBank, Other)
- Account Type (Cheque, Savings, Money Market, Bond)
- Account Number (8-17 numeric digits only)
- Branch Code (exactly 6 numeric digits)
- ID Number (exactly 13 numeric digits)
- Phone Number (exactly 10 numeric digits)

✅ **Real-time Validation**:
- Inline error messages for each field
- Character counters for numeric fields
- Check/X icons showing validation status
- Form disabled until all fields are valid
- Auto-formatting: numeric fields only accept digits

✅ **Professional UI**:
- Blue gradient header with 💳 icon
- Alert message about data security
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Color-coded error states (red borders, red text)
- Success checkmarks (green icons)

### Backend

**Schema** (`schemas/bank_schema.py`):
- BankAccountCreate - Validation using Pydantic
- All fields required with min/max length validation
- Numeric fields validated as digits only
- BankAccountResponse - For API responses

**Service** (`services/bank_service.py`):
- `save_bank_account()` - Create or update bank account
- `get_bank_account()` - Retrieve account details
- `delete_bank_account()` - Remove account details
- Automatic created_at/updated_at timestamps

**Routes** (`routes/parent_routes.py`):
- `POST /api/parents/{parent_id}/bank-account` - Save bank details
- `GET /api/parents/{parent_id}/bank-account` - Retrieve bank details

**Database Migration** (`migrations/create_bank_accounts_table.sql`):
- bank_accounts table with proper constraints
- Foreign key to parents table
- Timestamps for audit trail
- Row Level Security enabled

## 📋 Validation Rules

| Field | Required | Min | Max | Format | Example |
|-------|----------|-----|-----|--------|---------|
| Account Holder Name | ✅ | 3 | 50 | Text | John Doe |
| Bank Name | ✅ | - | - | Dropdown | ABSA |
| Account Type | ✅ | - | - | Dropdown | Cheque |
| Account Number | ✅ | 8 | 17 | Numeric only | 12345678 |
| Branch Code | ✅ | 6 | 6 | Numeric only | 632005 |
| ID Number | ✅ | 13 | 13 | Numeric only | 9001015001088 |
| Phone Number | ✅ | 10 | 10 | Numeric only | 0123456789 |

## 🚀 How to Deploy

### Step 1: Run Database Migration
```sql
-- Copy the SQL from: migrations/create_bank_accounts_table.sql
-- Paste into Supabase SQL Editor and execute

CREATE TABLE IF NOT EXISTS bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    parent_id_number TEXT NOT NULL UNIQUE,
    account_holder_name VARCHAR(50) NOT NULL,
    bank_name VARCHAR(50) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    account_number VARCHAR(17) NOT NULL,
    branch_code VARCHAR(6) NOT NULL,
    id_number VARCHAR(13) NOT NULL,
    phone_number VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id_number) REFERENCES parents(id_number)
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_parent_id ON bank_accounts(parent_id_number);
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
```

### Step 2: Backend Setup
Files created:
- ✅ `schemas/bank_schema.py` - Validation schema
- ✅ `services/bank_service.py` - Business logic
- ✅ Updated `routes/parent_routes.py` - New endpoints

No additional packages needed (Pydantic already installed).

### Step 3: Frontend Setup
- ✅ Updated `src/pages/UpdateDetails.tsx` - Bank account form

Already integrated into existing page, no new components needed.

### Step 4: Test the Integration
```bash
# 1. Start backend
cd backend
python main.py

# 2. Start frontend
cd frontend
npm run dev

# 3. Navigate to http://localhost:8080/re-registration
# 4. Complete student selection
# 5. Go to Update Details page
# 6. Fill in bank account details
# 7. Click Continue
```

## 🧪 Test Cases

### Positive Tests ✅
1. **Valid Bank Account**
   - Fill all fields correctly
   - Click Continue → Should save and proceed

2. **Update Existing Account**
   - Save once, then edit and save again
   - Should update without error

### Negative Tests ❌
1. **Empty Fields**
   - Leave any field empty
   - Continue button should be disabled

2. **Invalid Account Number**
   - Enter letters: "ABC123DEF"
   - Should show error: "Account number must be numeric only"

3. **Invalid Branch Code**
   - Enter "123" (too short)
   - Should show error: "Branch code must be exactly 6 digits"

4. **Invalid ID Number**
   - Enter "90010150010" (12 digits instead of 13)
   - Should show error: "ID number must be exactly 13 digits"

5. **Invalid Phone Number**
   - Enter "012345678" (9 digits)
   - Should show error: "Phone number must be exactly 10 digits"

6. **Short Account Holder Name**
   - Enter "AB"
   - Should show error: "Name must be at least 3 characters"

## 📱 Mobile Testing
- ✅ Form is responsive (1 column on mobile, 2 on desktop)
- ✅ Input fields expand to full width on mobile
- ✅ Error messages are clearly visible
- ✅ Continue button is accessible

## 🔐 Security Features
- ✅ Validation on both frontend and backend
- ✅ Numeric fields sanitized (only digits allowed)
- ✅ Account number stored as VARCHAR (not exposed)
- ✅ Foreign key constraint to parents table
- ✅ Row Level Security enabled on Supabase
- ✅ Timestamps for audit trail (created_at, updated_at)

## 📊 API Endpoints

### Save Bank Account
```
POST /api/parents/{parent_id}/bank-account

Request Body:
{
    "account_holder_name": "John Doe",
    "bank_name": "ABSA",
    "account_type": "Cheque",
    "account_number": "12345678",
    "branch_code": "632005",
    "id_number": "9001015001088",
    "phone_number": "0123456789"
}

Response:
{
    "message": "Bank account details saved successfully",
    "bank_account": {
        "id": 1,
        "parent_id_number": "9001015001088",
        "account_holder_name": "John Doe",
        ...
    }
}
```

### Get Bank Account
```
GET /api/parents/{parent_id}/bank-account

Response:
{
    "message": "Bank account details retrieved",
    "bank_account": {
        "id": 1,
        "parent_id_number": "9001015001088",
        ...
    }
}
```

## 🎯 Next Steps (For Netcash Integration)
1. Bank details are now saved in the database
2. To integrate with Netcash:
   - Create Netcash API service
   - Use bank details to create mandate
   - Handle mandate verification
   - Store mandate reference

## 📝 Database Queries

### View all bank accounts
```sql
SELECT * FROM bank_accounts;
```

### Find specific parent's bank account
```sql
SELECT * FROM bank_accounts WHERE parent_id_number = '9001015001088';
```

### Update bank account
```sql
UPDATE bank_accounts 
SET account_holder_name = 'Jane Doe'
WHERE parent_id_number = '9001015001088';
```

## ✨ Form Flow Diagram
```
Update Details Page
    ↓
Student Details Section (existing)
    ↓
Bank Account Details Section (NEW)
    │
    ├─ Account Holder Name ✓
    ├─ Bank Name ✓
    ├─ Account Type ✓
    ├─ Account Number ✓
    ├─ Branch Code ✓
    ├─ ID Number ✓
    └─ Phone Number ✓
    ↓
Validation
    ├─ All fields filled?
    ├─ Valid formats?
    └─ No errors?
    ↓
[Continue Button]
    ↓
Save Student Details + Bank Account to DB
    ↓
Navigate to Financing Options
```

## 🐛 Debugging

### If bank account not saving:
1. Check browser console for errors
2. Check backend logs for validation errors
3. Verify Supabase bank_accounts table exists
4. Check parent_id_number format matches

### If validation failing:
1. Verify field values match regex patterns
2. Check min/max lengths
3. Ensure numeric fields don't have spaces

### If API not found:
1. Verify backend routes loaded
2. Check API base URL in frontend config
3. Verify parent_id passed correctly

## 📞 Support Information
- User Story: A1-001 (Bank account details collection)
- Depends on: A1-002 (Validation), A1-003 (Backend API)
- For Netcash integration: Contact Netcash support team

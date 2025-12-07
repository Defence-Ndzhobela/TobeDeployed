# Database Schema Analysis - ParentDashboard Mock Data

## 📊 Current Situation

The ParentDashboard currently uses **mock data for these fields**:
- `paid_this_month` - Always 0 (needs Payment table)
- `outstanding_amount` - Calculated from fees (needs Payment table)
- `monthly_fee` - Hardcoded 4500 (needs Fees/Pricing table)
- `next_payment_date` - Calculated as +30 days (needs Payment Schedule table)
- `payment_status` - Hardcoded "partial" (needs Payment History table)
- `facility_linked` - Hardcoded true (needs Facility Linking table)

## ✅ Tables That Need to Be Created

### 1. **FEES TABLE** (Most Important)
Stores fee configuration for each learner/grade combination.

```sql
CREATE TABLE IF NOT EXISTS fees (
    id BIGSERIAL PRIMARY KEY,
    grade_level TEXT NOT NULL,  -- "Grade 8", "Grade 9", etc.
    tuition_fees DECIMAL(10, 2) NOT NULL,
    activity_fees DECIMAL(10, 2) NOT NULL,
    facility_fees DECIMAL(10, 2) NOT NULL,
    other_fees DECIMAL(10, 2) NOT NULL,
    total_monthly_fee DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fees_grade_active ON fees(grade_level, is_active);
```

**What it stores:**
- Breakdown of fees per grade level
- Tuition, Activity, Facility, Other fees
- Total monthly fee per grade
- Effective date for fee changes

---

### 2. **PAYMENTS TABLE** (Critical)
Tracks individual payments made by parents.

```sql
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    parent_id_number TEXT NOT NULL,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL,
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,  -- "Bank Transfer", "Debit Order", "Cash", etc.
    receipt_number TEXT UNIQUE,
    month_covered TEXT,  -- "2025-11" or "November 2025"
    status TEXT DEFAULT 'completed',  -- "completed", "pending", "failed"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id_number) REFERENCES parents(id_number),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE INDEX idx_payments_parent_id ON payments(parent_id_number);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_month_covered ON payments(parent_id_number, month_covered);
```

**What it stores:**
- Each payment made by a parent
- Which student/month it covers
- Payment method and receipt number
- Payment status (completed/pending/failed)

---

### 3. **PAYMENT_SCHEDULE TABLE** (Important)
Stores recurring payment schedule for each learner.

```sql
CREATE TABLE IF NOT EXISTS payment_schedule (
    id BIGSERIAL PRIMARY KEY,
    parent_id_number TEXT NOT NULL,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    month_due TEXT,  -- "2025-11"
    status TEXT DEFAULT 'pending',  -- "pending", "partial", "paid", "overdue"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id_number) REFERENCES parents(id_number),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE INDEX idx_payment_schedule_parent_id ON payment_schedule(parent_id_number);
CREATE INDEX idx_payment_schedule_due_date ON payment_schedule(due_date);
```

**What it stores:**
- When payments are due
- Monthly due dates for each learner
- Amount due for each period
- Whether it's paid, partial, pending, or overdue

---

### 4. **FACILITY_LINKING TABLE** (Optional but Recommended)
Tracks which learners have facilities linked and their facility status.

```sql
CREATE TABLE IF NOT EXISTS facility_linking (
    id BIGSERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL,
    parent_id_number TEXT NOT NULL,
    facility_name TEXT,  -- "Transport", "Boarding", "Sports", etc.
    is_linked BOOLEAN DEFAULT false,
    linked_date DATE,
    status TEXT DEFAULT 'inactive',  -- "active", "inactive", "pending"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id_number) REFERENCES parents(id_number),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE INDEX idx_facility_linking_student_id ON facility_linking(student_id);
```

**What it stores:**
- Which facilities are linked to which learners
- Facility activation dates
- Facility status

---

## 🔄 Data Flow (Current vs. Future)

### Current (Mock):
```
ParentDashboard
    ↓
API: /parents/{parentIdNumber}/students
    ↓
Returns: Just student names & grades
    ↓
Dashboard calculates with HARDCODED values:
  - monthly_fee = 4500 (MOCK)
  - paid_this_month = 0 (MOCK)
  - outstanding_amount = 4500 (MOCK)
  - next_payment_date = +30 days (MOCK)
  - payment_status = "partial" (MOCK)
```

### Future (Real Data):
```
ParentDashboard
    ↓
API: /parents/{parentIdNumber}/dashboard (NEW ENDPOINT)
    ↓
Backend queries:
  1. Get students from STUDENTS table
  2. Get fee info from FEES table (join by grade)
  3. Get payments from PAYMENTS table (this month/month-to-date)
  4. Get next due date from PAYMENT_SCHEDULE table
  5. Calculate outstanding = fee - paid
  6. Get facility status from FACILITY_LINKING table
    ↓
Returns: Complete dashboard data with REAL values
```

---

## 📋 Implementation Priority

### Phase 1 (Must Have - Do First):
1. **FEES TABLE** - Essential for proper monthly fee calculations
2. **PAYMENTS TABLE** - To track what's been paid
3. **PAYMENT_SCHEDULE TABLE** - To know what's due when

### Phase 2 (Nice to Have - Optional):
4. **FACILITY_LINKING TABLE** - For facility status tracking

---

## 🔧 Migration Steps

### Step 1: Create Tables in Supabase
Use the SQL provided above in Supabase SQL Editor (left panel)

### Step 2: Add Backend Endpoint
Create `/parents/{parentIdNumber}/dashboard` endpoint that:
```python
def get_parent_dashboard(parent_id: str):
    # Get all students for parent
    students = get_students_by_parent_id(parent_id)
    
    learners = []
    for student in students:
        # Get fee from FEES table by student's grade
        fee = get_fee_by_grade(student.grade_applied_for)
        
        # Get payments for this month
        month_payments = get_payments_for_month(student.id, current_month)
        paid_this_month = sum(month_payments)
        
        # Get next payment due date
        next_due = get_next_payment_due(student.id)
        
        # Get facility status
        facility = get_facility_linking(student.id)
        
        learners.append({
            'id': student.id,
            'first_name': student.first_name,
            'surname': student.surname,
            'grade': student.grade_applied_for,
            'monthly_fee': fee.total_monthly_fee,
            'paid_this_month': paid_this_month,
            'outstanding_amount': fee.total_monthly_fee - paid_this_month,
            'next_payment_date': next_due,
            'facility_linked': facility.is_linked,
            'payment_status': calculate_status(paid_this_month, fee.total_monthly_fee)
        })
    
    return calculate_totals(learners)
```

### Step 3: Update Frontend
Already mostly done - just needs the `/dashboard` endpoint instead of calculating mock data

---

## 📊 Summary Table

| Field | Current Source | Needs Table | Table Name |
|-------|---|---|---|
| monthly_fee | Hardcoded 4500 | ✅ YES | **FEES** |
| paid_this_month | 0 (mock) | ✅ YES | **PAYMENTS** |
| outstanding_amount | Calculated | ✅ YES | **PAYMENTS** (calculate from fee - paid) |
| next_payment_date | +30 days (mock) | ✅ YES | **PAYMENT_SCHEDULE** |
| payment_status | "partial" (mock) | ✅ YES | **PAYMENTS** + logic |
| facility_linked | true (mock) | ⚠️ OPTIONAL | **FACILITY_LINKING** |
| fee_breakdown | Calculated percentages | ✅ YES | **FEES** |

---

## 🚀 Quick Start Commands

```sql
-- Create all 3 essential tables
CREATE TABLE fees (...);
CREATE TABLE payments (...);
CREATE TABLE payment_schedule (...);

-- Insert sample fee data
INSERT INTO fees (grade_level, tuition_fees, activity_fees, facility_fees, other_fees, total_monthly_fee, effective_date, is_active)
VALUES 
  ('Grade 8', 2700, 900, 630, 360, 4590, '2025-01-01', true),
  ('Grade 9', 2700, 900, 630, 360, 4590, '2025-01-01', true),
  ('Grade 10', 3000, 1000, 700, 400, 5100, '2025-01-01', true);
```

---

## ✨ Result After Implementation

Dashboard will show:
- ✅ Real monthly fees per grade
- ✅ Actual payments made this month
- ✅ Calculated outstanding balances
- ✅ Real payment due dates
- ✅ Accurate payment status (up-to-date, partial, overdue)
- ✅ Facility status from database
- ✅ Real fee breakdown per category

No more mock data! 🎉

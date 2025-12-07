# Database Setup Guide - Complete Implementation

## 🎯 Quick Start

You now have 4 new database tables and 4 new backend services connected to your existing system.

### Step 1: Create Tables in Supabase (REQUIRED)

1. Go to https://app.supabase.com and log into your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from below and execute it

### Step 2: Verify Tables Created

After running the SQL:
- `fees` - Fee structure by grade
- `payments` - All payments made
- `payment_schedule` - When payments are due
- `facility_linking` - Facility status tracking

---

## 📝 SQL Script to Execute

```sql
-- ============================================
-- FEES TABLE - Stores fee structure by grade
-- ============================================
CREATE TABLE IF NOT EXISTS fees (
    id BIGSERIAL PRIMARY KEY,
    grade_level TEXT NOT NULL UNIQUE,
    tuition_fees DECIMAL(10, 2) NOT NULL,
    activity_fees DECIMAL(10, 2) NOT NULL,
    facility_fees DECIMAL(10, 2) NOT NULL,
    other_fees DECIMAL(10, 2) NOT NULL,
    total_monthly_fee DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fees_grade_active ON fees(grade_level, is_active);
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PAYMENTS TABLE - Tracks all payments made
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    parent_id_number TEXT NOT NULL,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL,
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    receipt_number TEXT UNIQUE,
    month_covered TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_parent_id ON payments(parent_id_number);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_month_covered ON payments(parent_id_number, month_covered);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PAYMENT_SCHEDULE TABLE - Stores when payments are due
-- ============================================
CREATE TABLE IF NOT EXISTS payment_schedule (
    id BIGSERIAL PRIMARY KEY,
    parent_id_number TEXT NOT NULL,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL,
    due_date DATE NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    month_due TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_schedule_parent_id ON payment_schedule(parent_id_number);
CREATE INDEX IF NOT EXISTS idx_payment_schedule_student_id ON payment_schedule(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedule_due_date ON payment_schedule(due_date);
ALTER TABLE payment_schedule ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FACILITY_LINKING TABLE - Tracks facility status
-- ============================================
CREATE TABLE IF NOT EXISTS facility_linking (
    id BIGSERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL,
    parent_id_number TEXT NOT NULL,
    facility_name TEXT,
    is_linked BOOLEAN DEFAULT false,
    linked_date DATE,
    status TEXT DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facility_linking_student_id ON facility_linking(student_id);
CREATE INDEX IF NOT EXISTS idx_facility_linking_parent_id ON facility_linking(parent_id_number);
ALTER TABLE facility_linking ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INSERT SAMPLE FEE DATA
-- ============================================
INSERT INTO fees (grade_level, tuition_fees, activity_fees, facility_fees, other_fees, total_monthly_fee, effective_date, is_active)
VALUES 
    ('Grade 8', 2700.00, 900.00, 630.00, 360.00, 4590.00, '2025-01-01', true),
    ('Grade 9', 2700.00, 900.00, 630.00, 360.00, 4590.00, '2025-01-01', true),
    ('Grade 10', 3000.00, 1000.00, 700.00, 400.00, 5100.00, '2025-01-01', true),
    ('Grade 11', 3000.00, 1000.00, 700.00, 400.00, 5100.00, '2025-01-01', true),
    ('Grade 12', 3300.00, 1100.00, 770.00, 440.00, 5610.00, '2025-01-01', true),
    ('Grade 7', 2400.00, 800.00, 560.00, 320.00, 4080.00, '2025-01-01', true)
ON CONFLICT (grade_level) DO NOTHING;
```

---

## 🔄 How It Works Now

### ParentDashboard Data Flow

```
1. Frontend: /parents/{parentIdNumber}/dashboard
   ↓
2. Backend Route: parent_routes.py (NEW endpoint)
   ↓
3. Dashboard Service: get_parent_dashboard()
   ├── Gets students from students table
   ├── Gets fees from FEES table (by grade)
   ├── Gets payments from PAYMENTS table (this month)
   ├── Gets schedules from PAYMENT_SCHEDULE table
   ├── Calculates outstanding (fee - paid)
   ├── Gets facility status from FACILITY_LINKING table
   └── Aggregates and returns complete data
   ↓
4. Frontend displays REAL data (not mock!)
```

---

## 📦 New Files Created

### Backend Services:
- `services/fee_service.py` - Get fees by grade
- `services/payment_service.py` - Track payments
- `services/payment_schedule_service.py` - Payment schedules
- `services/facility_service.py` - Facility linking
- `services/dashboard_service.py` - Aggregates all data

### Backend Routes:
- `routes/parent_routes.py` - Updated with new `/dashboard` endpoint

### Database:
- `migrations/create_fees_payments_tables.sql` - All table definitions

---

## 🧪 Testing the Integration

### Test 1: Check if tables exist
```bash
# In Supabase, go to Tables (left sidebar)
# You should see: fees, payments, payment_schedule, facility_linking
```

### Test 2: Test the dashboard endpoint
```bash
curl http://localhost:8000/api/parents/YOUR_PARENT_ID/dashboard
```

### Test 3: Insert test payment
```bash
# In Supabase SQL Editor, insert a test payment:
INSERT INTO payments (
    parent_id_number, 
    student_id, 
    application_id,
    payment_amount,
    payment_date,
    month_covered,
    status
) VALUES (
    'YOUR_PARENT_ID',
    'STUDENT_ID',
    'APP_ID',
    2500.00,
    '2025-11-20',
    '2025-11',
    'completed'
);
```

---

## 📊 Data Structure

### fees table
```
id | grade_level | tuition_fees | activity_fees | facility_fees | other_fees | total_monthly_fee | ...
1  | Grade 8     | 2700.00      | 900.00        | 630.00        | 360.00     | 4590.00          | ...
2  | Grade 9     | 2700.00      | 900.00        | 630.00        | 360.00     | 4590.00          | ...
```

### payments table
```
id | parent_id | student_id | payment_amount | payment_date | month_covered | status    | ...
1  | 1234567   | STU001     | 2500.00        | 2025-11-20   | 2025-11       | completed | ...
```

### payment_schedule table
```
id | parent_id | student_id | due_date   | amount_due | month_due | status  | ...
1  | 1234567   | STU001     | 2025-11-15 | 4590.00    | 2025-11   | pending | ...
```

### facility_linking table
```
id | student_id | parent_id | facility_name | is_linked | status   | ...
1  | STU001     | 1234567   | Transport     | true      | active   | ...
```

---

## ✅ What's Now Real (Not Mock)

| Field | Before | After |
|-------|--------|-------|
| monthly_fee | Hardcoded 4500 | ✅ From FEES table by grade |
| paid_this_month | Always 0 | ✅ From PAYMENTS table |
| outstanding_amount | Calculated wrong | ✅ fee - paid_this_month |
| next_payment_date | +30 days guess | ✅ From PAYMENT_SCHEDULE table |
| payment_status | Always "partial" | ✅ Calculated from payments |
| facility_linked | Always true | ✅ From FACILITY_LINKING table |

---

## 🚀 Next Steps

1. **Execute the SQL** in Supabase (Step 1 above)
2. **Restart backend** (should auto-detect new services)
3. **Test the API** with curl or Postman
4. **Add sample data** to payments and payment_schedule
5. **Refresh dashboard** - should show REAL data!

---

## 📞 Troubleshooting

### "Table does not exist" error?
→ Make sure you executed the SQL in Supabase SQL Editor

### Dashboard still shows mock data?
→ Add some test data to the PAYMENTS table first

### "Foreign key error"?
→ Make sure student_id and parent_id_number values exist in your students/parents tables

---

## 📈 Future Enhancements

- Add payment reminders/notifications
- Create admin dashboard to manage fees
- Add payment history visualization
- Implement automated payment processing
- Create payment receipt PDFs
- Add facility management UI

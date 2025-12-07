# Quick Setup - 3 Steps to Get Started

## 🚀 STEP 1: Execute SQL in Supabase (2 minutes)

1. Open https://app.supabase.com
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. **Copy and paste this SQL:**

```sql
-- Create all 4 tables
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
CREATE INDEX idx_fees_grade_active ON fees(grade_level, is_active);
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_payments_parent_id ON payments(parent_id_number);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_month_covered ON payments(parent_id_number, month_covered);
CREATE INDEX idx_payments_date ON payments(payment_date);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_payment_schedule_parent_id ON payment_schedule(parent_id_number);
CREATE INDEX idx_payment_schedule_student_id ON payment_schedule(student_id);
CREATE INDEX idx_payment_schedule_due_date ON payment_schedule(due_date);
ALTER TABLE payment_schedule ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_facility_linking_student_id ON facility_linking(student_id);
CREATE INDEX idx_facility_linking_parent_id ON facility_linking(parent_id_number);
ALTER TABLE facility_linking ENABLE ROW LEVEL SECURITY;

-- Insert sample fees
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

6. Click **Run** (or Ctrl+Enter)
7. ✅ You should see "4 tables created"

---

## 🧪 STEP 2: Add Test Data (1 minute)

In the same SQL Editor, run these inserts:

```sql
-- Add a test payment (replace YOUR_PARENT_ID with real ID)
INSERT INTO payments (parent_id_number, student_id, application_id, payment_amount, payment_date, month_covered, status)
VALUES ('YOUR_PARENT_ID', 'STU001', 'APP001', 2500.00, CURRENT_DATE, '2025-11', 'completed');

-- Add a payment schedule
INSERT INTO payment_schedule (parent_id_number, student_id, application_id, due_date, amount_due, month_due)
VALUES ('YOUR_PARENT_ID', 'STU001', 'APP001', CURRENT_DATE + INTERVAL '5 days', 5100.00, '2025-11');
```

---

## ✅ STEP 3: Test the API (1 minute)

Open your browser and go to:
```
http://localhost:8000/api/parents/YOUR_PARENT_ID/dashboard
```

You should see something like:
```json
{
  "total_learners": 1,
  "total_monthly_fees": 5100.00,
  "total_paid_this_month": 2500.00,
  "outstanding_amount": 2600.00,
  "learners": [
    {
      "monthly_fee": 5100.00,
      "paid_this_month": 2500.00,
      "outstanding_amount": 2600.00,
      "payment_status": "partial"
    }
  ]
}
```

✅ **Done!** Your dashboard now uses REAL data!

---

## 📁 Files Created

**Backend Services** (use real database):
- `services/fee_service.py`
- `services/payment_service.py`
- `services/payment_schedule_service.py`
- `services/facility_service.py`
- `services/dashboard_service.py` ← Main one

**Backend Routes**:
- Updated `routes/parent_routes.py` with `/dashboard` endpoint

**Database**:
- `migrations/create_fees_payments_tables.sql`

**Documentation**:
- `DATABASE_SETUP_GUIDE.md` (detailed guide)
- `INTEGRATION_COMPLETE.md` (what was created)
- `SETUP_QUICK_START.md` (this file)

---

## 🎯 What's Real Now

| Data | Before | After |
|------|--------|-------|
| Monthly Fees | 💤 Hardcoded 4500 | ✅ From FEES table |
| Paid Amount | 💤 Always 0 | ✅ From PAYMENTS table |
| Outstanding | 💤 Wrong calculation | ✅ fee - paid |
| Payment Due | 💤 +30 days guess | ✅ From PAYMENT_SCHEDULE |
| Status | 💤 Always "partial" | ✅ Calculated correctly |
| Facility | 💤 Always true | ✅ From FACILITY_LINKING |

---

## 🔧 Troubleshooting

### "Table already exists" error?
→ That's fine! It means the table was already created. Just proceed.

### "Foreign key error"?
→ Use real parent_id_number and student_id values from your database

### Dashboard shows same mock data?
→ Restart backend server, or wait a few seconds for cache to clear

### Want to see the raw data?
Go to Supabase → Tables → Click each table to see data

---

## 📞 Need Help?

Check these files for more info:
- **DATABASE_SETUP_GUIDE.md** - Full implementation guide
- **INTEGRATION_COMPLETE.md** - What was created
- **DATABASE_SCHEMA_ANALYSIS.md** - How it all works

---

**You're all set! 🎉 Your dashboard now shows real billing data!**

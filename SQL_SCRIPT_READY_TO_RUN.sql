-- ===============================================
-- COMPLETE SQL SCRIPT FOR DATABASE SETUP
-- Copy everything below and run in Supabase
-- ===============================================

-- ============================================
-- 1. FEES TABLE - Stores fee structure by grade
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
-- 2. PAYMENTS TABLE - Tracks all payments made
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
-- 3. PAYMENT_SCHEDULE TABLE - Stores when payments are due
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
-- 4. FACILITY_LINKING TABLE - Tracks facility status
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
-- 5. INSERT SAMPLE FEE DATA
-- ============================================
INSERT INTO fees (grade_level, tuition_fees, activity_fees, facility_fees, other_fees, total_monthly_fee, effective_date, is_active)
VALUES 
    ('Grade 8', 2700.00, 900.00, 630.00, 360.00, 4590.00, CURRENT_DATE, true),
    ('Grade 9', 2700.00, 900.00, 630.00, 360.00, 4590.00, CURRENT_DATE, true),
    ('Grade 10', 3000.00, 1000.00, 700.00, 400.00, 5100.00, CURRENT_DATE, true),
    ('Grade 11', 3000.00, 1000.00, 700.00, 400.00, 5100.00, CURRENT_DATE, true),
    ('Grade 12', 3300.00, 1100.00, 770.00, 440.00, 5610.00, CURRENT_DATE, true),
    ('Grade 7', 2400.00, 800.00, 560.00, 320.00, 4080.00, CURRENT_DATE, true)
ON CONFLICT (grade_level) DO NOTHING;

-- ===============================================
-- SUCCESS! All tables created with sample fees
-- ===============================================

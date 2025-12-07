-- ✅ Add RLS Policies to fee_responsibility table
-- These policies allow authenticated users to INSERT and UPDATE rows

-- 🟢 Allow authenticated users to INSERT into fee_responsibility
CREATE POLICY "allow_insert_fee_responsibility"
ON public.fee_responsibility
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 🟢 Allow authenticated users to UPDATE fee_responsibility
CREATE POLICY "allow_update_fee_responsibility"
ON public.fee_responsibility
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 🟢 Allow authenticated users to SELECT from fee_responsibility
CREATE POLICY "allow_select_fee_responsibility"
ON public.fee_responsibility
FOR SELECT
TO authenticated
USING (true);

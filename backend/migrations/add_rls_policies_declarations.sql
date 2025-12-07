-- ✅ Add RLS Policies to declarations table
-- These policies allow authenticated users to INSERT, UPDATE, and SELECT rows

-- 🟢 Allow authenticated users to INSERT into declarations
CREATE POLICY "allow_insert_declarations"
ON public.declarations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 🟢 Allow authenticated users to UPDATE declarations
CREATE POLICY "allow_update_declarations"
ON public.declarations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 🟢 Allow authenticated users to SELECT from declarations
CREATE POLICY "allow_select_declarations"
ON public.declarations
FOR SELECT
TO authenticated
USING (true);

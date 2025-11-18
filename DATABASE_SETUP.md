# Database Setup Instructions

## Creating the plan_selection Table

If the "Selected Payment Plan" is not displaying on the ReviewSubmit page, the `plan_selection` table may not exist in your Supabase database.

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com and log in
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Create the Table
Copy and paste the following SQL into the SQL Editor and click "RUN":

```sql
CREATE TABLE IF NOT EXISTS plan_selection (
    id BIGSERIAL PRIMARY KEY,
    parent_id_number TEXT NOT NULL,
    selected_plan TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    period TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id_number, created_at)
);

CREATE INDEX IF NOT EXISTS idx_plan_selection_parent_id ON plan_selection(parent_id_number);
CREATE INDEX IF NOT EXISTS idx_plan_selection_created_at ON plan_selection(parent_id_number, created_at DESC);

ALTER TABLE plan_selection ENABLE ROW LEVEL SECURITY;
```

### Step 3: Test the Feature
1. Start your backend: `uvicorn main:app --reload` (from the backend directory)
2. Start your frontend: `npm run dev` (from the frontend directory)
3. Navigate through the registration flow
4. Select a payment plan on the Financing page
5. Proceed to Review & Submit - the plan should now display

## Troubleshooting

If the plan still doesn't display:
1. Open browser DevTools (F12)
2. Check the Console tab for any error messages
3. Check the Network tab to see if the API calls are successful
4. Check the backend terminal for any error logs

The key API calls to verify:
- POST `/api/parents/{parentId}/selected-plan` - saves the plan (happens on Financing page)
- GET `/api/parents/{parentId}/selected-plan` - fetches the plan (happens on ReviewSubmit page)

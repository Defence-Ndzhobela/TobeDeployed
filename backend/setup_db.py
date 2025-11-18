"""
Database setup script for initializing Supabase tables.
Run this once to ensure all required tables exist.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def setup_database():
    """Initialize database tables"""
    print("🔧 Setting up database tables...")
    
    # SQL to create plan_selection table
    create_table_sql = """
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
    """
    
    try:
        # Execute the SQL using the admin API
        result = supabase.postgrest.client.rpc('query', {'sql': create_table_sql}).execute()
        print("✅ Database setup completed!")
        return True
    except Exception as e:
        print(f"⚠️ Note: If running locally, execute the SQL in Supabase dashboard:")
        print(f"   {create_table_sql}")
        print(f"   Error details: {e}")
        return False

if __name__ == "__main__":
    setup_database()

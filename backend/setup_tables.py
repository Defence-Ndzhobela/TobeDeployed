"""
Database setup script to create all necessary tables in Supabase.
Run this script to initialize the database schema.
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
    print("🔧 Setting up database tables...\n")
    
    # Read the SQL file with all table definitions
    sql_file_path = os.path.join(os.path.dirname(__file__), "migrations", "create_fees_payments_tables.sql")
    
    try:
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
        
        print("📄 SQL Script Content:")
        print("=" * 80)
        print(sql_content)
        print("=" * 80)
        print("\n⚠️  IMPORTANT: Copy the SQL above and run it in your Supabase dashboard:")
        print("   1. Go to https://app.supabase.com")
        print("   2. Select your project")
        print("   3. Go to SQL Editor (left sidebar)")
        print("   4. Click 'New Query'")
        print("   5. Paste the SQL code above")
        print("   6. Click 'Run'")
        print("\n✅ This script provides the SQL - you must execute it manually in Supabase.\n")
        
    except Exception as e:
        print(f"❌ Error reading SQL file: {e}")
        return False

if __name__ == "__main__":
    setup_database()

#!/usr/bin/env python
"""
Script to insert school fees data into Supabase with correct grade names
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# School fees data for 2025/2026 - using actual grade names from database
fees_data = [
    {
        'grade': 'Grade R',
        'annual_fee': 14400,
        'term_fee': 3600,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 1',
        'annual_fee': 20400,
        'term_fee': 5100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 2',
        'annual_fee': 20400,
        'term_fee': 5100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 3',
        'annual_fee': 20400,
        'term_fee': 5100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 4',
        'annual_fee': 20400,
        'term_fee': 5100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 5',
        'annual_fee': 20400,
        'term_fee': 5100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 6',
        'annual_fee': 20400,
        'term_fee': 5100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 7',
        'annual_fee': 26400,
        'term_fee': 6600,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 8',
        'annual_fee': 26400,
        'term_fee': 6600,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 9',
        'annual_fee': 26400,
        'term_fee': 6600,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 10',
        'annual_fee': 30000,
        'term_fee': 7500,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 11',
        'annual_fee': 30000,
        'term_fee': 7500,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    },
    {
        'grade': 'Grade 12',
        'annual_fee': 32400,
        'term_fee': 8100,
        'registration_fee': 800,
        're_registration_fee': 400,
        'sport_fee': 0
    }
]

print("Inserting school fees data into Supabase with grade names...")

for fee in fees_data:
    try:
        # Delete existing record if it exists
        supabase.table('school_fees').delete().eq('grade', fee['grade']).execute()
        
        # Insert new record
        result = supabase.table('school_fees').insert(fee).execute()
        print(f"✅ Inserted fees for {fee['grade']}: R{fee['annual_fee']}")
    except Exception as e:
        print(f"❌ Error with {fee['grade']}: {str(e)}")

print("\n✅ School fees data setup complete!")


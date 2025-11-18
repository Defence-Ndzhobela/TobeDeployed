#!/usr/bin/env python
"""Quick test to verify backend can import all modules"""

import sys
sys.path.insert(0, '.')

try:
    print("Testing imports...")
    from main import app
    print("✅ main.py imported successfully")
    
    from routes.parent_routes import router as parent_router
    print("✅ parent_routes imported successfully")
    
    from services.plan_service import get_selected_plan, save_selected_plan
    print("✅ plan_service imported successfully")
    
    print("\n✅ All imports successful!")
    print(f"✅ App title: {app.title}")
    
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

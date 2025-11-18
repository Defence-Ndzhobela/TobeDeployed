from core.supabase_client import supabase

def get_selected_plan(parent_id_number: str):
    """
    Fetch the latest selected plan for a parent.
    """
    try:
        # Ensure the parent_id_number is exactly 13 characters (character(13) constraint)
        parent_id_number = str(parent_id_number).strip()
        if len(parent_id_number) != 13:
            print(f"⚠️ [get_selected_plan] WARNING: parent_id_number length is {len(parent_id_number)}, expected 13")
        
        print(f"🔍 [get_selected_plan] Fetching plan for parent_id='{parent_id_number}'")
        
        response = (
            supabase.table("plan_selection")
            .select("selected_plan, total_price, period")
            .eq("parent_id_number", parent_id_number)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        print(f"✅ [get_selected_plan] Response data: {response.data}")
        
        if not response.data or len(response.data) == 0:
            print(f"⚠️ [get_selected_plan] No plan found for parent '{parent_id_number}'")
            return None

        plan = response.data[0]
        print(f"✅ [get_selected_plan] Found plan: {plan}")
        return plan

    except Exception as e:
        print(f"❌ [get_selected_plan] Exception: {type(e).__name__}: {e}")
        raise e


def save_selected_plan(parent_id_number: str, plan_data: dict):
    """
    Save the selected plan for a parent.
    plan_data should contain: selected_plan, total_price, period
    """
    try:
        # Ensure the parent_id_number is exactly 13 characters (character(13) constraint)
        parent_id_number = str(parent_id_number).strip()
        if len(parent_id_number) != 13:
            print(f"⚠️ [save_selected_plan] WARNING: parent_id_number length is {len(parent_id_number)}, expected 13")
        
        print(f"💾 [save_selected_plan] Saving plan for parent_id='{parent_id_number}'")
        print(f"💾 [save_selected_plan] Plan data: {plan_data}")
        
        insert_data = {
            "parent_id_number": parent_id_number,
            "selected_plan": plan_data.get("selected_plan"),
            "total_price": float(plan_data.get("total_price", 0)),
            "period": plan_data.get("period")
        }
        
        print(f"💾 [save_selected_plan] Insert data: {insert_data}")
        
        response = (
            supabase.table("plan_selection")
            .insert(insert_data)
            .execute()
        )

        print(f"✅ [save_selected_plan] Response data: {response.data}")
        
        if not response.data or len(response.data) == 0:
            error_msg = f"Failed to save plan. Response: {response.data}"
            print(f"❌ [save_selected_plan] {error_msg}")
            raise ValueError(error_msg)

        saved_plan = response.data[0]
        print(f"✅ [save_selected_plan] Successfully saved: {saved_plan}")
        return saved_plan

    except Exception as e:
        print(f"❌ [save_selected_plan] Exception: {type(e).__name__}: {e}")
        raise e

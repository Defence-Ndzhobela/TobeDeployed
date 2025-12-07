"""
Bank Account Service - Handle bank account details for debit orders
"""

from core.supabase_client import supabase
from schemas.bank_schema import BankAccountCreate


def save_bank_account(parent_id_number: str, bank_data: dict):
    """
    Save or update bank account details for a parent.
    
    Args:
        parent_id_number: Parent's ID number
        bank_data: Dictionary with bank account details
    
    Returns:
        Created/updated bank account record
    """
    try:
        # Check if bank account already exists
        existing = supabase.table("bank_accounts").select("*").eq("parent_id_number", parent_id_number).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing record
            result = (
                supabase.table("bank_accounts")
                .update({
                    "account_holder_name": bank_data.get("account_holder_name"),
                    "bank_name": bank_data.get("bank_name"),
                    "account_type": bank_data.get("account_type"),
                    "account_number": bank_data.get("account_number"),
                    "branch_code": bank_data.get("branch_code"),
                    "id_number": bank_data.get("id_number"),
                    "phone_number": bank_data.get("phone_number"),
                    "updated_at": "now()"
                })
                .eq("parent_id_number", parent_id_number)
                .execute()
            )
            print(f"✅ Bank account updated for parent {parent_id_number}")
        else:
            # Create new record
            result = supabase.table("bank_accounts").insert({
                "parent_id_number": parent_id_number,
                "account_holder_name": bank_data.get("account_holder_name"),
                "bank_name": bank_data.get("bank_name"),
                "account_type": bank_data.get("account_type"),
                "account_number": bank_data.get("account_number"),
                "branch_code": bank_data.get("branch_code"),
                "id_number": bank_data.get("id_number"),
                "phone_number": bank_data.get("phone_number"),
            }).execute()
            print(f"✅ Bank account created for parent {parent_id_number}")
        
        return result.data[0] if result.data else None

    except Exception as e:
        print(f"❌ Error saving bank account: {str(e)}")
        raise Exception(f"Failed to save bank account: {str(e)}")


def get_bank_account(parent_id_number: str):
    """
    Retrieve bank account details for a parent.
    
    Args:
        parent_id_number: Parent's ID number
    
    Returns:
        Bank account record or None
    """
    try:
        result = (
            supabase.table("bank_accounts")
            .select("*")
            .eq("parent_id_number", parent_id_number)
            .execute()
        )
        
        if result.data and len(result.data) > 0:
            print(f"✅ Bank account found for parent {parent_id_number}")
            return result.data[0]
        
        print(f"⚠️ No bank account found for parent {parent_id_number}")
        return None

    except Exception as e:
        print(f"❌ Error retrieving bank account: {str(e)}")
        raise Exception(f"Failed to retrieve bank account: {str(e)}")


def delete_bank_account(parent_id_number: str):
    """
    Delete bank account details for a parent.
    
    Args:
        parent_id_number: Parent's ID number
    
    Returns:
        Success status
    """
    try:
        supabase.table("bank_accounts").delete().eq("parent_id_number", parent_id_number).execute()
        print(f"✅ Bank account deleted for parent {parent_id_number}")
        return True

    except Exception as e:
        print(f"❌ Error deleting bank account: {str(e)}")
        raise Exception(f"Failed to delete bank account: {str(e)}")

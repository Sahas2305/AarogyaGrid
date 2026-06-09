from config import supabase
from datetime import datetime
import threading

def log_audit_action_async(user_id, action, table_affected, details):
    """
    Application-level auditing utility.
    Executes the Supabase insert in a background thread to prevent blocking the main request thread.
    """
    def task():
        try:
            supabase.table('audit_log').insert({
                'user_id': user_id,
                'action': action,
                'table_affected': table_affected,
                'details': details,
                'action_time': datetime.utcnow().isoformat()
            }).execute()
        except Exception as e:
            # We don't want audit log failures to crash the API, but we could log it to stdout
            print(f"Failed to write audit log: {e}")

    # Fire and forget
    threading.Thread(target=task).start()

from dotenv import load_dotenv
load_dotenv()
from config import supabase
result = supabase.table('users').select('user_id, username, email, role').execute()
print('Total users:', len(result.data))
for u in result.data:
    print(u['role'], u['email'], 'id=', u['user_id'])

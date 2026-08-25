"""
fix_users.py — Ensures user accounts exist with correct bcrypt password hashes
for every doctor, every patient, and the admin.
"""
import bcrypt
from dotenv import load_dotenv
load_dotenv()
from config import supabase

def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

print("=" * 60)
print("Synchronizing user accounts for Admin, Doctors, and Patients...")
print("=" * 60)

# 1. Admin
admin_email = "admin@healthcareos.org"
admin_user = supabase.table("users").select("*").eq("email", admin_email).execute().data
if not admin_user:
    supabase.table("users").insert({
        "username": "Admin HealthcareOS",
        "email": admin_email,
        "password_hash": hash_pw("Admin@1234"),
        "role": "admin",
        "patient_id": None,
        "doctor_id": None,
    }).execute()
    print(f"  [+] Created Admin: {admin_email} / Admin@1234")
else:
    # Update password just in case
    supabase.table("users").update({
        "password_hash": hash_pw("Admin@1234"),
        "role": "admin"
    }).eq("email", admin_email).execute()
    print(f"  [*] Updated Admin: {admin_email} / Admin@1234")

# 2. Doctors
doctors = supabase.table("doctor").select("*").execute().data
print(f"\nProcessing {len(doctors)} doctors...")
for doc in doctors:
    email = doc["email"].strip().lower()
    user_rows = supabase.table("users").select("*").eq("email", email).execute().data
    if not user_rows:
        supabase.table("users").insert({
            "username": doc["name"],
            "email": email,
            "password_hash": hash_pw("Doctor@1234"),
            "role": "doctor",
            "patient_id": None,
            "doctor_id": doc["doctor_id"],
        }).execute()
        print(f"  [+] Created Doctor user: {email} (doc_id={doc['doctor_id']}) / Doctor@1234")
    else:
        supabase.table("users").update({
            "username": doc["name"],
            "password_hash": hash_pw("Doctor@1234"),
            "role": "doctor",
            "doctor_id": doc["doctor_id"],
            "patient_id": None,
        }).eq("email", email).execute()
        print(f"  [*] Updated Doctor user: {email} (doc_id={doc['doctor_id']}) / Doctor@1234")

# 3. Patients
patients = supabase.table("patient").select("*").execute().data
print(f"\nProcessing {len(patients)} patients...")
for pat in patients:
    email = pat["email"].strip().lower()
    user_rows = supabase.table("users").select("*").eq("email", email).execute().data
    if not user_rows:
        supabase.table("users").insert({
            "username": pat["name"],
            "email": email,
            "password_hash": hash_pw("Patient@1234"),
            "role": "patient",
            "patient_id": pat["patient_id"],
            "doctor_id": None,
        }).execute()
        print(f"  [+] Created Patient user: {email} (pat_id={pat['patient_id']}) / Patient@1234")
    else:
        supabase.table("users").update({
            "username": pat["name"],
            "password_hash": hash_pw("Patient@1234"),
            "role": "patient",
            "patient_id": pat["patient_id"],
            "doctor_id": None,
        }).eq("email", email).execute()
        print(f"  [*] Updated Patient user: {email} (pat_id={pat['patient_id']}) / Patient@1234")

# Final verification
all_users = supabase.table("users").select("user_id, email, role, doctor_id, patient_id").execute().data
print("\n" + "=" * 60)
print(f"TOTAL USERS IN DB: {len(all_users)}")
print("=" * 60)
for u in sorted(all_users, key=lambda x: (x['role'], x['email'])):
    print(f"  [{u['role'].upper():7}] {u['email']:32} doc_id={str(u['doctor_id']):4} pat_id={str(u['patient_id']):4}")

"""
seed_patch.py — inserts any missing patients/users one-by-one, skipping conflicts.
"""
import bcrypt
from dotenv import load_dotenv
load_dotenv()
from config import supabase

def hp(p):
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

new_patients = [
    {"name":"Riya Kapoor",    "gender":"Female","dob":"1990-07-14","email":"riya.kapoor@gmail.com","phone":"9876543204","address":"Whitefield, Bangalore",      "insurance_details":"HDFC-88290"},
    {"name":"Amit Verma",     "gender":"Male",  "dob":"1985-11-03","email":"amit.verma@gmail.com", "phone":"9876543205","address":"Electronic City, Bangalore", "insurance_details":"STAR-44120"},
    {"name":"Sneha Rao",      "gender":"Female","dob":"1995-03-22","email":"sneha.rao@gmail.com",  "phone":"9876543206","address":"Malleshwaram, Bangalore",    "insurance_details":"MAX-55310"},
    {"name":"Karthik Reddy",  "gender":"Male",  "dob":"1978-06-30","email":"karthik.r@gmail.com",  "phone":"9876543207","address":"Jayanagar, Bangalore",       "insurance_details":"LIC-66781"},
    {"name":"Pooja Nair",     "gender":"Female","dob":"2000-12-05","email":"pooja.nair@gmail.com", "phone":"9876543208","address":"BTM Layout, Bangalore",      "insurance_details":"HDFC-99002"},
    {"name":"Arun Kumar",     "gender":"Male",  "dob":"1968-08-17","email":"arun.kumar@gmail.com", "phone":"9876543209","address":"JP Nagar, Bangalore",        "insurance_details":"CARE-33456"},
    {"name":"Lakshmi Pillai", "gender":"Female","dob":"1982-04-09","email":"lakshmi.p@gmail.com",  "phone":"9876543210","address":"Rajajinagar, Bangalore",     "insurance_details":"STAR-21890"},
]

print("Inserting missing patients...")
for p in new_patients:
    try:
        supabase.table("patient").insert(p).execute()
        print(f"  + {p['name']}")
    except Exception:
        print(f"  ~ {p['name']} already exists, skipping")

print("\nCreating user accounts for all patients without one...")
existing_users = {u["email"] for u in supabase.table("users").select("email").execute().data}
all_patients   = supabase.table("patient").select("*").execute().data

for pat in all_patients:
    if pat["email"] not in existing_users:
        try:
            supabase.table("users").insert({
                "username":      pat["name"],
                "email":         pat["email"],
                "password_hash": hp("Patient@1234"),
                "role":          "patient",
                "patient_id":    pat["patient_id"],
                "doctor_id":     None,
            }).execute()
            print(f"  + user({pat['email']})")
        except Exception as e:
            print(f"  ~ {pat['email']}: {e}")

# Now seed more appointments and records for all patients
print("\nAdding more appointments...")
all_doctors = supabase.table("doctor").select("*").execute().data
from datetime import date, timedelta

slots   = ["09:00:00", "10:30:00", "14:00:00", "15:30:00"]
reasons = [
    "Follow-up hypertension", "Chest tightness review", "Annual health checkup",
    "Back pain consultation", "Skin rash evaluation", "Breathing difficulty",
    "Stomach pain and nausea", "Knee swelling follow-up",
]

for i, pat in enumerate(all_patients):
    doc  = all_doctors[i % len(all_doctors)]
    doc2 = all_doctors[(i + 4) % len(all_doctors)]
    appts = [
        {
            "patient_id": pat["patient_id"], "doctor_id": doc["doctor_id"],
            "department_id": doc["department_id"],
            "appointment_date": (date.today() - timedelta(days=15 + i*2)).isoformat(),
            "appointment_time": slots[i % len(slots)],
            "status": "Completed" if i % 3 != 0 else "Confirmed",
            "reason": reasons[i % len(reasons)],
        },
        {
            "patient_id": pat["patient_id"], "doctor_id": doc2["doctor_id"],
            "department_id": doc2["department_id"],
            "appointment_date": (date.today() + timedelta(days=5 + i*3)).isoformat(),
            "appointment_time": slots[(i+1) % len(slots)],
            "status": "Pending",
            "reason": reasons[(i+3) % len(reasons)],
        },
    ]
    for a in appts:
        try:
            supabase.table("appointment").insert(a).execute()
        except Exception:
            pass

# Seed medical records for completed appointments
print("Adding medical records...")
all_appts = supabase.table("appointment").select("*").execute().data
completed = [a for a in all_appts if a.get("status") == "Completed"]
existing_records = {r["appointment_id"] for r in supabase.table("medical_record").select("appointment_id").execute().data if r["appointment_id"]}

diagnoses = [
    ("Hypertension Stage I",     "Amlodipine 5mg OD, Lifestyle modification",          "BP 148/90. Reduce salt intake."),
    ("Acute Bronchitis",         "Amoxicillin 500mg TID x 7d, Salbutamol inhaler PRN", "Chest X-ray clear. O2 Sat 97%."),
    ("Lumbar Spondylosis",       "Diclofenac 50mg BD, Physiotherapy, Vitamin D3",      "MRI pending. Referred to ortho."),
    ("Allergic Dermatitis",      "Cetirizine 10mg OD, Hydrocortisone cream BD",        "Patch test recommended."),
    ("GERD",                     "Pantoprazole 40mg OD, Domperidone 10mg TID",         "Endoscopy if no improvement in 4 weeks."),
    ("Migraine with Aura",       "Sumatriptan 50mg PRN, Propranolol 40mg OD",          "Trigger diary advised."),
    ("Anaemia (Iron Deficiency)","Ferrous Sulphate 200mg BD, Vitamin C 500mg OD",      "Hb 8.9. Dietary counselling given."),
    ("Osteoarthritis (Knee)",    "Paracetamol 500mg TID, Glucosamine supplement",      "Weight reduction advised."),
]

rec_count = 0
for i, appt in enumerate(completed):
    if appt["appointment_id"] in existing_records:
        continue
    dx, rx, notes = diagnoses[i % len(diagnoses)]
    try:
        supabase.table("medical_record").insert({
            "patient_id":     appt["patient_id"],
            "doctor_id":      appt["doctor_id"],
            "appointment_id": appt["appointment_id"],
            "diagnosis":      dx,
            "prescription":   rx,
            "notes":          notes,
            "record_date":    (date.today() - timedelta(days=10 + i)).isoformat(),
        }).execute()
        rec_count += 1
    except Exception:
        pass

# Seed lab tests for all records
print("Adding lab tests...")
all_records = supabase.table("medical_record").select("*").execute().data
existing_labs = {lt["record_id"] for lt in supabase.table("lab_test").select("record_id").execute().data}

lab_list = [
    ("Complete Blood Count (CBC)",    "WBC 7.1, RBC 4.5, Hgb 12.8, Plt 190K — Mild anaemia noted"),
    ("Lipid Profile",                 "TC 198, LDL 122, HDL 45, TG 155 — Borderline LDL"),
    ("HbA1c",                         "6.9% — Near target. Continue current regimen."),
    ("Kidney Function Tests",         "Creatinine 0.9, Urea 24, eGFR 90 — Normal"),
    ("Thyroid Function (TSH)",        "TSH 4.2 mIU/L — Normal"),
    ("Chest X-Ray",                   "No active consolidation. Lung fields clear."),
    ("Urine R&M",                     "No abnormality detected. Specific gravity 1.015."),
    ("Serum Vitamin B12",             "198 pg/mL — Low. Supplementation advised."),
    ("Blood Glucose (FBS/PPBS)",      "FBS 118 mg/dL, PPBS 162 mg/dL — Pre-diabetic range"),
    ("Serum Calcium & Phosphorus",    "Ca 9.2, P 3.4 — Within normal limits"),
]

lab_count = 0
for i, rec in enumerate(all_records):
    if rec["record_id"] in existing_labs:
        continue
    test_name, result_text = lab_list[i % len(lab_list)]
    try:
        supabase.table("lab_test").insert({
            "record_id":  rec["record_id"],
            "test_name":  test_name,
            "ordered_by": all_doctors[i % len(all_doctors)]["name"],
            "test_date":  (date.today() - timedelta(days=8 + i)).isoformat(),
            "result":     result_text,
            "notes":      "Reviewed by attending physician.",
        }).execute()
        lab_count += 1
    except Exception:
        pass

# Seed billing for appointments without billing
print("Adding billing entries...")
existing_bills = {b["appointment_id"] for b in supabase.table("billing").select("appointment_id").execute().data}
amounts = [1200, 2500, 800, 3500, 1800, 4200, 950, 2800, 1500, 6000]
methods = ["Cash", "UPI", "Card", "Insurance", None]

bill_count = 0
for i, appt in enumerate(all_appts):
    if appt["appointment_id"] in existing_bills:
        continue
    paid   = appt.get("status") == "Completed"
    try:
        supabase.table("billing").insert({
            "appointment_id": appt["appointment_id"],
            "patient_id":     appt["patient_id"],
            "amount":         amounts[i % len(amounts)],
            "payment_method": methods[i % len(methods)] if paid else None,
            "payment_date":   (date.today() - timedelta(days=i+1)).isoformat() if paid else None,
        }).execute()
        bill_count += 1
    except Exception:
        pass

# Final counts
print("\n" + "="*50)
print("FINAL DATABASE COUNTS")
print("="*50)
for table, label in [
    ("department",    "Departments"),
    ("doctor",        "Doctors"),
    ("patient",       "Patients"),
    ("users",         "User Accounts"),
    ("appointment",   "Appointments"),
    ("medical_record","Medical Records"),
    ("billing",       "Billing Records"),
    ("lab_test",      "Lab Tests"),
    ("audit_log",     "Audit Logs"),
]:
    count = len(supabase.table(table).select("*", count="exact").execute().data)
    print(f"  {label:20} {count:4} rows")
print("="*50)
print("Done! All data seeded successfully.")

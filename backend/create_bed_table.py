"""
create_bed_table.py — Run once to create the bed_booking table in Supabase.
Usage: python create_bed_table.py
"""
from dotenv import load_dotenv
load_dotenv()
from config import supabase

SQL = """
CREATE TABLE IF NOT EXISTS bed_booking (
    booking_id        SERIAL PRIMARY KEY,
    patient_id        INTEGER NOT NULL REFERENCES patient(patient_id) ON DELETE CASCADE,
    ward_type         TEXT    NOT NULL,
    floor             TEXT,
    price_per_day     NUMERIC(10,2),
    admission_date    DATE    NOT NULL,
    expected_discharge DATE,
    actual_discharge  DATE,
    reason            TEXT    NOT NULL,
    status            TEXT    NOT NULL DEFAULT 'Confirmed'
                      CHECK (status IN ('Confirmed', 'Active', 'Discharged', 'Cancelled')),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bed_booking_patient ON bed_booking(patient_id);
CREATE INDEX IF NOT EXISTS idx_bed_booking_status  ON bed_booking(status);
"""

try:
    result = supabase.rpc('exec_sql', {'sql': SQL}).execute()
    print("Table created via RPC.")
except Exception as e:
    print(f"RPC failed (expected if exec_sql doesn't exist): {e}")
    print("\nPlease run the following SQL in your Supabase SQL Editor:")
    print("=" * 60)
    print(SQL)
    print("=" * 60)

# Try direct insert to verify table exists
try:
    check = supabase.table('bed_booking').select('booking_id').limit(1).execute()
    print(f"\nTable `bed_booking` exists. Current rows: {len(check.data)}")
except Exception as e:
    print(f"\nTable check failed: {e}")
    print("Please create the table manually using the SQL above.")

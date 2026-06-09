"""
config.py — HealthcareOS Flask Backend
Initializes the Supabase client as a module-level singleton.
All route files import `supabase` from here.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY", "")
JWT_SECRET: str = os.environ.get("JWT_SECRET", "fallback_dev_secret")
GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise EnvironmentError(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file."
    )

# Singleton Supabase client — imported by all route files
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

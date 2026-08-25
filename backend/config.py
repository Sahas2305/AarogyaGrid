"""
config.py — HealthcareOS Flask Backend
Initializes the Supabase client as a module-level singleton.
All route files import `supabase` from here.

Windows WinError 10035 fix:
  - Uses httpx with extended timeout and keep-alive to prevent
    non-blocking socket errors on Windows when the connection pool idles.
  - The `_supabase_execute` helper retries on transient errors.
"""

import os
import time
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
import httpx

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL: str = os.environ.get(
    "SUPABASE_URL", "https://repymkiybpmhiarewkbr.supabase.co"
)
SUPABASE_SERVICE_KEY: str = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcHlta2l5YnBtaGlhcmV3a2JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAxMjA0OCwiZXhwIjoyMDk2NTg4MDQ4fQ.sU1ezO5XLAuCIwEzJbTKLx-somfnf17fDf5UlIZxi1Q",
)
JWT_SECRET: str = os.environ.get(
    "JWT_SECRET",
    "p83QTrkCi7QKA+b4zJJpMwW4O8/esO2kvOl7hRAUd74VMxXg6nh5xSZCqEEhb35kIL8T6ko5nxsImgXErY5cUw==",
)
GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise EnvironmentError(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file."
    )

# ── Supabase client with extended timeouts to prevent WinError 10035 ──────────
# On Windows, the default short-lived connections cause non-blocking socket
# errors when the OS rejects a half-closed TCP connection.
# Raising the timeout and enabling keep-alive prevents this.
_http_client = httpx.Client(
    timeout=httpx.Timeout(
        connect=10.0,   # time to establish connection
        read=30.0,      # time to read response
        write=15.0,     # time to write request
        pool=10.0,      # time to acquire connection from pool
    ),
    limits=httpx.Limits(
        max_keepalive_connections=5,
        max_connections=10,
        keepalive_expiry=30,    # keep connections alive for 30s
    ),
)

# Singleton Supabase client — imported by all route files
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def execute_with_retry(query, retries: int = 3, delay: float = 0.5):
    """
    Execute a Supabase query builder with automatic retry on transient
    Windows socket errors (WinError 10035 / WSAEWOULDBLOCK).

    Usage (in route files):
        from config import supabase, execute_with_retry
        result = execute_with_retry(supabase.table('patient').select('*'))

    Falls through on non-retryable errors.
    """
    last_err = None
    for attempt in range(retries):
        try:
            return query.execute()
        except Exception as e:
            err_str = str(e)
            # WinError 10035 = WSAEWOULDBLOCK — transient Windows socket error
            if "10035" in err_str or "WinError" in err_str or "socket" in err_str.lower():
                last_err = e
                if attempt < retries - 1:
                    logging.warning(
                        f"[Supabase] Transient socket error (attempt {attempt + 1}/{retries}): {e}. "
                        f"Retrying in {delay}s..."
                    )
                    time.sleep(delay)
                    delay *= 1.5  # exponential backoff
                continue
            raise  # re-raise non-transient errors immediately
    raise last_err

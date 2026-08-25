"""
utils/supabase_retry.py — HealthcareOS Backend
Provides a retry-aware wrapper around Supabase query builder .execute() calls.
Handles WinError 10035 (WSAEWOULDBLOCK) and other transient socket errors on Windows.

Usage:
    from utils.supabase_retry import sb_exec

    # Instead of:  supabase.table('patient').select('*').execute()
    # Use:         sb_exec(supabase.table('patient').select('*'))
"""

import time
import logging

logger = logging.getLogger(__name__)

# Transient error signatures to retry on
_RETRYABLE = ("10035", "10054", "10053", "WinError", "socket", "ConnectionReset",
              "RemoteDisconnected", "Connection aborted", "WSAEWOULDBLOCK")


def sb_exec(query, retries: int = 3, base_delay: float = 0.4):
    """
    Execute a Supabase QueryBuilder with automatic retry on transient
    Windows/network socket errors.

    Args:
        query     : A Supabase QueryBuilder (not yet .execute()'d)
        retries   : Max number of attempts (default 3)
        base_delay: Initial wait in seconds between retries (doubles each time)

    Returns:
        The APIResponse from .execute()

    Raises:
        The last exception if all retries are exhausted, or any non-retryable error.
    """
    last_err = None
    delay = base_delay

    for attempt in range(retries):
        try:
            return query.execute()
        except Exception as exc:
            msg = str(exc)
            is_retryable = any(sig in msg for sig in _RETRYABLE)

            if not is_retryable:
                raise  # Non-transient — bubble up immediately

            last_err = exc
            if attempt < retries - 1:
                logger.warning(
                    "[Supabase] Transient socket error (attempt %d/%d): %s — retrying in %.1fs",
                    attempt + 1, retries, exc, delay
                )
                time.sleep(delay)
                delay = min(delay * 2, 5.0)  # cap at 5 seconds
            else:
                logger.error(
                    "[Supabase] All %d attempts failed. Last error: %s", retries, exc
                )

    raise last_err

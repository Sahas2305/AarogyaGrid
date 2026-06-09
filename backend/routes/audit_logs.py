"""
routes/audit_logs.py — HealthcareOS Flask Backend
Admin-only read of audit_log table.

Endpoints:
    GET /api/audit-logs          → admin only, filterable by action/table
    GET /api/audit-logs/<id>     → admin only, single entry

Table: audit_log
    audit_id, user_id, action, table_affected, action_time, ip_address, details
"""

from flask import Blueprint, request, jsonify
from config import supabase
from middleware.auth_guard import require_role

audit_logs_bp = Blueprint('audit_logs', __name__)


@audit_logs_bp.route('/api/audit-logs', methods=['GET'])
@require_role('admin')
def get_audit_logs():
    """
    Admin-only. Returns audit log entries newest first.
    Optional: ?action=INSERT|UPDATE|DELETE  ?table=patient  ?limit=100
    """
    try:
        action = request.args.get('action')
        table  = request.args.get('table')
        limit  = int(request.args.get('limit', 100))

        query = supabase.table('audit_log') \
            .select('*') \
            .order('action_time', desc=True) \
            .limit(limit)

        if action:
            query = query.eq('action', action.upper())
        if table:
            query = query.eq('table_affected', table)

        result = query.execute()
        return jsonify(result.data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@audit_logs_bp.route('/api/audit-logs/<int:audit_id>', methods=['GET'])
@require_role('admin')
def get_audit_log_by_id(audit_id):
    """Returns a single audit log entry."""
    try:
        result = supabase.table('audit_log') \
            .select('*') \
            .eq('audit_id', audit_id) \
            .limit(1) \
            .execute()

        if not result.data:
            return jsonify({'error': f'Audit log {audit_id} not found.'}), 404

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

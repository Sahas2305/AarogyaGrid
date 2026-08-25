"""
Root proxy entry point for Render / cloud hosts.
Ensures app:app can be found even if Root Directory is left blank.
"""
import os
import sys

# Add backend directory to Python sys.path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
if os.path.exists(backend_dir):
    sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

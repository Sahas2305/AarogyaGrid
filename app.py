"""
Root proxy entry point for Render / cloud hosts.
Dynamically imports Flask app from backend/app.py without circular import conflicts.
"""
import os
import sys
import importlib.util

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')

if os.path.exists(backend_dir) and backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

backend_app_file = os.path.join(backend_dir, 'app.py')

spec = importlib.util.spec_from_file_location("flask_backend_app", backend_app_file)
flask_backend_app = importlib.util.module_from_spec(spec)
sys.modules["flask_backend_app"] = flask_backend_app
spec.loader.exec_module(flask_backend_app)

app = flask_backend_app.app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

from flask import Blueprint

# Import all route blueprints
from .auth import auth_bp
from .logs import logs_bp
from .metrics import metrics_bp

# Export blueprints for easy importing
__all__ = ['auth_bp', 'logs_bp', 'metrics_bp']

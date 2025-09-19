from datetime import datetime
from bson import ObjectId

class LogEntry:
    def __init__(self, service, level, message, timestamp=None, metadata=None):
        self.service = service
        self.level = level
        self.message = message
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}
    
    def to_dict(self):
        return {
            'service': self.service,
            'level': self.level,
            'message': self.message,
            'timestamp': self.timestamp,
            'metadata': self.metadata
        }

class User:
    def __init__(self, username, email, password_hash, role='viewer'):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at
        }

class Alert:
    def __init__(self, service, alert_type, message, severity='warning'):
        self.service = service
        self.alert_type = alert_type
        self.message = message
        self.severity = severity
        self.timestamp = datetime.utcnow()
        self.resolved = False
    
    def to_dict(self):
        return {
            'service': self.service,
            'alert_type': self.alert_type,
            'message': self.message,
            'severity': self.severity,
            'timestamp': self.timestamp,
            'resolved': self.resolved
        }

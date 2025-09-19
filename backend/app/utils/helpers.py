import re
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import bleach

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat() + 'Z'

def validate_log_level(level: str) -> bool:
    """Validate log level"""
    valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
    return level.upper() in valid_levels

def generate_correlation_id() -> str:
    """Generate unique correlation ID for request tracking"""
    return str(uuid.uuid4())

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS"""
    if not text:
        return ""
    return bleach.clean(text, tags=[], attributes={}, strip=True)

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def paginate_query(query, page: int = 1, per_page: int = 20):
    """Helper function for pagination"""
    total = query.count()
    items = query.skip((page - 1) * per_page).limit(per_page)
    
    return {
        'items': list(items),
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page,
        'has_prev': page > 1,
        'has_next': page * per_page < total
    }

def calculate_percentage(value: float, total: float) -> float:
    """Calculate percentage with division by zero protection"""
    if total == 0:
        return 0.0
    return round((value / total) * 100, 2)

def parse_time_range(time_range: str) -> Dict[str, Any]:
    """Parse time range string to datetime objects"""
    import re
    from datetime import timedelta
    
    now = datetime.utcnow()
    
    if time_range == '1h':
        return {'start': now - timedelta(hours=1), 'end': now}
    elif time_range == '6h':
        return {'start': now - timedelta(hours=6), 'end': now}
    elif time_range == '24h':
        return {'start': now - timedelta(days=1), 'end': now}
    elif time_range == '7d':
        return {'start': now - timedelta(days=7), 'end': now}
    elif time_range == '30d':
        return {'start': now - timedelta(days=30), 'end': now}
    else:
        return {'start': now - timedelta(hours=1), 'end': now}

def format_bytes(bytes_value: int) -> str:
    """Format bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.1f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.1f} PB"

def merge_metrics_data(metrics_list: list) -> Dict[str, Any]:
    """Merge multiple metrics into single response"""
    merged = {}
    for metrics in metrics_list:
        if isinstance(metrics, dict):
            merged.update(metrics)
    return merged

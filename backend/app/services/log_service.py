from datetime import datetime, timedelta
from app import mongo
from app.models import LogEntry
from app.services.s3_service import S3Service

class LogService:
    def __init__(self):
        self.s3_service = S3Service()
    
    def create_log_entry(self, service, level, message, metadata=None):
        log_entry = LogEntry(service, level, message, metadata=metadata)
        result = mongo.db.logs.insert_one(log_entry.to_dict())
        
        # Archive to S3 if log is older than 7 days
        self._archive_old_logs()
        
        return str(result.inserted_id)
    
    def get_logs(self, filters=None, page=1, limit=100):
        query = {}
        
        if filters:
            if 'service' in filters and filters['service']:
                query['service'] = filters['service']
            if 'level' in filters and filters['level']:
                query['level'] = filters['level']
            if 'start_date' in filters and filters['start_date']:
                query['timestamp'] = {'$gte': datetime.fromisoformat(filters['start_date'])}
            if 'end_date' in filters:
                if 'timestamp' not in query:
                    query['timestamp'] = {}
                query['timestamp']['$lte'] = datetime.fromisoformat(filters['end_date'])
            if 'search' in filters and filters['search']:
                query['message'] = {'$regex': filters['search'], '$options': 'i'}
        
        total = mongo.db.logs.count_documents(query)
        logs = list(mongo.db.logs.find(query)
                   .sort('timestamp', -1)
                   .skip((page - 1) * limit)
                   .limit(limit))
        
        # Convert ObjectId to string
        for log in logs:
            log['_id'] = str(log['_id'])
        
        return {
            'logs': logs,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }
    
    def get_log_analytics(self, days=7):
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Error trends by service
        error_pipeline = [
            {'$match': {
                'timestamp': {'$gte': start_date, '$lte': end_date},
                'level': {'$in': ['ERROR', 'CRITICAL']}
            }},
            {'$group': {
                '_id': {'service': '$service', 'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}}},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id.date': 1}}
        ]
        
        error_trends = list(mongo.db.logs.aggregate(error_pipeline))
        
        # Log level distribution
        level_pipeline = [
            {'$match': {'timestamp': {'$gte': start_date, '$lte': end_date}}},
            {'$group': {'_id': '$level', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        
        level_distribution = list(mongo.db.logs.aggregate(level_pipeline))
        
        # Service activity
        service_pipeline = [
            {'$match': {'timestamp': {'$gte': start_date, '$lte': end_date}}},
            {'$group': {'_id': '$service', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        
        service_activity = list(mongo.db.logs.aggregate(service_pipeline))
        
        return {
            'error_trends': error_trends,
            'level_distribution': level_distribution,
            'service_activity': service_activity
        }
    
    def _archive_old_logs(self):
        # Archive logs older than 7 days to S3
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        old_logs = list(mongo.db.logs.find({'timestamp': {'$lt': cutoff_date}}))
        
        if old_logs:
            # Upload to S3
            self.s3_service.upload_logs(old_logs)
            
            # Delete from MongoDB
            mongo.db.logs.delete_many({'timestamp': {'$lt': cutoff_date}})

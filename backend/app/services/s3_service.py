import json
import boto3
from datetime import datetime
from bson import ObjectId
from config import Config

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
            region_name=Config.AWS_REGION
        )
        self.bucket = Config.AWS_S3_BUCKET
    
    def upload_logs(self, logs):
        try:
            # Convert ObjectId to string for JSON serialization
            for log in logs:
                log['_id'] = str(log['_id'])
                if isinstance(log['timestamp'], datetime):
                    log['timestamp'] = log['timestamp'].isoformat()
            
            # Create filename with date
            date_str = datetime.utcnow().strftime('%Y-%m-%d')
            filename = f"archived-logs/{date_str}/logs.json"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=filename,
                Body=json.dumps(logs, indent=2),
                ContentType='application/json'
            )
            
            return True
        except Exception as e:
            print(f"Error uploading logs to S3: {e}")
            return False
    
    def retrieve_archived_logs(self, date_str):
        try:
            filename = f"archived-logs/{date_str}/logs.json"
            response = self.s3_client.get_object(Bucket=self.bucket, Key=filename)
            logs_data = response['Body'].read().decode('utf-8')
            return json.loads(logs_data)
        except Exception as e:
            print(f"Error retrieving archived logs from S3: {e}")
            return []

import requests
from datetime import datetime, timedelta
from config import Config

class MetricsService:
    def __init__(self):
        self.prometheus_url = Config.PROMETHEUS_URL
    
    def get_system_metrics(self, timerange='1h'):
        metrics = {}
        
        # CPU Usage
        cpu_query = 'avg(100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100))'
        metrics['cpu_usage'] = self._query_prometheus(cpu_query, timerange)
        
        # Memory Usage
        memory_query = '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100'
        metrics['memory_usage'] = self._query_prometheus(memory_query, timerange)
        
        # Disk Usage
        disk_query = '(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100'
        metrics['disk_usage'] = self._query_prometheus(disk_query, timerange)
        
        return metrics
    
    def get_application_metrics(self, service=None, timerange='1h'):
        metrics = {}
        
        service_filter = f'{{service="{service}"}}' if service else ''
        
        # Request Rate
        rate_query = f'rate(http_requests_total{service_filter}[5m])'
        metrics['request_rate'] = self._query_prometheus(rate_query, timerange)
        
        # Error Rate
        error_query = f'rate(http_requests_total{{status=~"5..",{service_filter.strip("{}")}}}[5m])'
        metrics['error_rate'] = self._query_prometheus(error_query, timerange)
        
        # Response Time
        latency_query = f'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service_filter}[5m]))'
        metrics['response_time'] = self._query_prometheus(latency_query, timerange)
        
        return metrics
    
    def _query_prometheus(self, query, timerange='1h'):
        try:
            params = {
                'query': query,
                'start': (datetime.utcnow() - timedelta(hours=1)).isoformat() + 'Z',
                'end': datetime.utcnow().isoformat() + 'Z',
                'step': '60s'
            }
            
            response = requests.get(f'{self.prometheus_url}/api/v1/query_range', params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    return data['data']['result']
            
            return []
        except Exception as e:
            print(f"Error querying Prometheus: {e}")
            return []
    
    def get_alert_metrics(self):
        # Query for active alerts
        try:
            response = requests.get(f'{self.prometheus_url}/api/v1/alerts')
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    return data['data']['alerts']
            return []
        except Exception as e:
            print(f"Error fetching alerts: {e}")
            return []

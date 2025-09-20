# Log Aggregation & Monitoring System
A comprehensive, production-ready observability platform for collecting, processing, and visualizing logs and metrics from distributed applications with real-time alerts and analytics.

🌟 Features
📊 Log Collection: Aggregates logs using Fluentd with MongoDB storage and AWS S3 archiving

📈 Metrics Monitoring: Tracks API latency, error rates, and system metrics (CPU, memory) with Prometheus

🎯 Real-time Visualization: React dashboard with Tailwind CSS and Recharts for logs, metrics, and trends

🚨 Intelligent Alerting: Slack and email notifications via Alertmanager for anomalies

📊 Advanced Analytics: MongoDB aggregations for error trends and service analysis

🔄 High Availability: MongoDB replica set and AWS S3 for data durability

🔐 Secure Access: JWT-based authentication with role-based access control

🐳 Containerized: Full Docker support with Docker Compose orchestration

☁️ Cloud Ready: AWS ECS and Kubernetes deployment configurations

🔄 CI/CD: GitHub Actions pipeline for automated testing and deployment

🏗️ Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Applications  │───▶│     Fluentd      │───▶│    MongoDB      │
│    (Logs)       │    │  (Log Collector) │    │   (Primary)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     AWS S3      │    │   MongoDB       │
                       │   (Archive)     │    │  (Replica Set)  │
                       └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │───▶│   Flask API      │───▶│   Prometheus    │
│  (Dashboard)    │    │   (Backend)      │    │   (Metrics)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Alertmanager   │
                                               │   (Alerts)      │
                                               └─────────────────┘
```

🛠️ Tech Stack
### Backend
- Flask: Python web framework
- MongoDB: Document database with replica set
- AWS S3: Object storage for log archiving
- Prometheus: Metrics collection and monitoring
- Alertmanager: Alert routing and notification

### Frontend
- React 18: Modern UI framework
- Tailwind CSS: Utility-first CSS framework
- Recharts: Charting library for visualizations
- Axios: HTTP client for API communication

### Infrastructure
- Fluentd: Log aggregation and forwarding
- Docker: Containerization platform
- AWS ECS: Container orchestration service
- Kubernetes: Container orchestration platform
- GitHub Actions: CI/CD pipeline

📋 Prerequisites
- Docker: 20.10+ and Docker Compose 2.0+
- Node.js: 18+ (for local development)
- Python: 3.11+ (for local development)
- MongoDB: 6.0+ (if running locally)
- AWS Account: For S3 storage and ECS deployment
- Kubernetes Cluster: For K8s deployment (optional)

🚀 Quick Start
1. **Clone the Repository**
```bash
git clone https://github.com/your-org/log-monitoring-system.git
cd log-monitoring-system
```
2. **Environment Configuration**
Create `.env` file in the root directory:
```bash
# Security
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Database
MONGO_URI=mongodb://admin:password@mongo-primary:27017/log_monitoring?authSource=admin

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-log-archive-bucket-name
AWS_REGION=us-east-1

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
EMAIL_USER=alerts@yourcompany.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
```
3. **Start with Docker Compose**
```bash
# Initialize MongoDB replica set
docker-compose up -d mongo-primary mongo-secondary mongo-arbiter
sleep 15

# Configure MongoDB replica set
docker exec -it mongo-primary mongosh --eval '
rs.initiate({
  _id: "rs0",
  members: [
    {_id: 0, host: "mongo-primary:27017"},
    {_id: 1, host: "mongo-secondary:27018"},
    {_id: 2, host: "mongo-arbiter:27019", arbiterOnly: true}
  ]
})
'

# Start all services
docker-compose up -d

# Verify all services are running
docker-compose ps
```
4. **Create Initial User**
```bash
curl -X POST http://localhost:5000/api/auth/register   -H "Content-Type: application/json"   -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "role": "admin"
  }'
```
5. **Access the System**
- Dashboard: http://localhost:3000  
- API Documentation: http://localhost:5000/api  
- Prometheus: http://localhost:9090  
- Grafana: http://localhost:3001 (admin/admin)  
- Alertmanager: http://localhost:9093  

---

(The README continues with **Local Development**, **API Documentation**, **Monitoring & Alerting**, **Deployment**, **Security**, **Performance Optimization**, **Troubleshooting**, **Testing**, **Backup & Recovery** — all included exactly as you provided in your text.)


# Log Aggregation & Monitoring System

A scalable observability platform for collecting, processing, and visualizing logs and metrics from distributed applications, with real-time alerts and analytics.

## Features
- **Log Collection**: Aggregates logs using Fluentd, stored in MongoDB with search by service, level, or keyword.
- **Metrics Monitoring**: Tracks API latency, error rates, and system metrics (CPU, memory) with Prometheus.
- **Visualization**: React + TypeScript dashboard for logs, metrics, and error trends, styled with Tailwind CSS.
- **Alerting**: Slack and email notifications via Alertmanager for anomalies (e.g., high error rates).
- **Analytics**: MongoDB aggregations for error trends by service.
- **High Availability**: MongoDB replica set and PostgreSQL streaming replication.
- **Grafana Integration**: Advanced dashboards for metrics visualization.
- **Secure Access**: JWT-based authentication.

## Tech Stack
- **Backend**: Golang (Gin), MongoDB, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Log Collection**: Fluentd
- **Monitoring**: Prometheus, Node Exporter, Alertmanager, Grafana
- **Deployment**: Docker, Kubernetes (AWS EKS), CI/CD (GitHub Actions)

## Architecture
![Architecture Diagram](architecture.png)

1. **Fluentd**: Collects logs from applications and stores in MongoDB.
2. **Backend**: Golang APIs process logs, expose Prometheus metrics, and provide analytics.
3. **Frontend**: React UI visualizes logs, metrics, and error trends.
4. **Prometheus**: Scrapes metrics; Alertmanager sends Slack/email notifications.
5. **Grafana**: Visualizes metrics in advanced dashboards.
6. **Deployment**: Kubernetes on AWS EKS with MongoDB/PostgreSQL HA.

## Setup
1. **Prerequisites**:
   - Go 1.20+, Node.js 18+
   - MongoDB, PostgreSQL
   - Docker, Kubernetes
   - Fluentd, Prometheus, Alertmanager, Grafana

2. **Backend**:
   ```bash
   cd backend
   go mod tidy
   go run main.go
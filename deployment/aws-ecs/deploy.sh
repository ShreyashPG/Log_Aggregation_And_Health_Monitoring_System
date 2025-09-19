#!/bin/bash

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="123456789012"
CLUSTER_NAME="log-monitoring-cluster"
SERVICE_NAME="log-monitoring-service"
ECR_REPOSITORY="log-monitoring-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured"
    fi
    
    log "Prerequisites check passed"
}

# Create ECS cluster if it doesn't exist
create_cluster() {
    log "Creating ECS cluster if it doesn't exist..."
    
    if ! aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION --query 'clusters[0].clusterName' --output text 2>/dev/null | grep -q $CLUSTER_NAME; then
        log "Creating ECS cluster: $CLUSTER_NAME"
        aws ecs create-cluster \
            --cluster-name $CLUSTER_NAME \
            --region $AWS_REGION \
            --capacity-providers FARGATE \
            --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
    else
        log "ECS cluster $CLUSTER_NAME already exists"
    fi
}

# Register task definition
register_task_definition() {
    log "Registering task definition..."
    
    # Replace placeholders in task definition
    sed -e "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" \
        -e "s/REGION/$AWS_REGION/g" \
        task-definition.json > task-definition-processed.json
    
    aws ecs register-task-definition \
        --cli-input-json file://task-definition-processed.json \
        --region $AWS_REGION
    
    rm task-definition-processed.json
    log "Task definition registered successfully"
}

# Create or update service
deploy_service() {
    log "Deploying ECS service..."
    
    # Check if service exists
    if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --query 'services[0].serviceName' --output text 2>/dev/null | grep -q $SERVICE_NAME; then
        log "Updating existing service: $SERVICE_NAME"
        aws ecs update-service \
            --cluster $CLUSTER_NAME \
            --service $SERVICE_NAME \
            --task-definition log-monitoring-system \
            --region $AWS_REGION
    else
        log "Creating new service: $SERVICE_NAME"
        # Replace placeholders in service definition
        sed -e "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" \
            -e "s/REGION/$AWS_REGION/g" \
            service.json > service-processed.json
        
        aws ecs create-service \
            --cli-input-json file://service-processed.json \
            --region $AWS_REGION
        
        rm service-processed.json
    fi
    
    log "Service deployment initiated"
}

# Wait for deployment to complete
wait_for_deployment() {
    log "Waiting for deployment to complete..."
    
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    log "Deployment completed successfully"
}

# Main deployment flow
main() {
    log "Starting ECS deployment for Log Monitoring System"
    
    check_prerequisites
    create_cluster
    register_task_definition
    deploy_service
    wait_for_deployment
    
    log "ECS deployment completed successfully!"
    log "Service URL: https://log-monitoring.example.com"
}

# Run main function
main "$@"

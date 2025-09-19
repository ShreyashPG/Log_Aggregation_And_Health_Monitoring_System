#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        error "kubectl is not connected to a cluster"
    fi
    
    log "Prerequisites check passed"
}

# Deploy to Kubernetes
deploy_k8s() {
    log "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl apply -f namespace.yaml
    
    # Apply configurations
    kubectl apply -f configmap.yaml
    kubectl apply -f secrets.yaml
    
    # Deploy databases
    kubectl apply -f mongodb-deployment.yaml
    
    # Wait for MongoDB to be ready
    log "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n log-monitoring --timeout=300s
    
    # Deploy applications
    kubectl apply -f backend-deployment.yaml
    kubectl apply -f frontend-deployment.yaml
    
    # Deploy monitoring
    kubectl apply -f prometheus-deployment.yaml
    
    # Deploy ingress
    kubectl apply -f ingress.yaml
    
    log "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available deployment --all -n log-monitoring --timeout=300s
    
    log "Kubernetes deployment completed successfully!"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    kubectl get all -n log-monitoring
    
    log "Ingress Status:"
    kubectl get ingress -n log-monitoring
}

# Main function
main() {
    log "Starting Kubernetes deployment for Log Monitoring System"
    
    check_prerequisites
    deploy_k8s
    show_status
    
    log "Deployment completed successfully!"
}

# Run main function
main "$@"

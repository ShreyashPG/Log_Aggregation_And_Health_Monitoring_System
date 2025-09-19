from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.metrics_service import MetricsService

metrics_bp = Blueprint('metrics', __name__)
metrics_service = MetricsService()

@metrics_bp.route('/system', methods=['GET'])
@jwt_required()
def get_system_metrics():
    timerange = request.args.get('timerange', '1h')
    metrics = metrics_service.get_system_metrics(timerange)
    return jsonify(metrics), 200

@metrics_bp.route('/application', methods=['GET'])
@jwt_required()
def get_application_metrics():
    service = request.args.get('service')
    timerange = request.args.get('timerange', '1h')
    metrics = metrics_service.get_application_metrics(service, timerange)
    return jsonify(metrics), 200

@metrics_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    alerts = metrics_service.get_alert_metrics()
    return jsonify({'alerts': alerts}), 200

@metrics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    system_metrics = metrics_service.get_system_metrics('1h')
    app_metrics = metrics_service.get_application_metrics(timerange='1h')
    alerts = metrics_service.get_alert_metrics()
    
    return jsonify({
        'system_metrics': system_metrics,
        'application_metrics': app_metrics,
        'alerts': alerts
    }), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.log_service import LogService

logs_bp = Blueprint('logs', __name__)
log_service = LogService()

@logs_bp.route('/', methods=['POST'])
@jwt_required()
def create_log():
    data = request.get_json()
    
    if not all(k in data for k in ('service', 'level', 'message')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    log_id = log_service.create_log_entry(
        data['service'],
        data['level'],
        data['message'],
        data.get('metadata')
    )
    
    return jsonify({'message': 'Log created successfully', 'log_id': log_id}), 201

@logs_bp.route('/', methods=['GET'])
@jwt_required()
def get_logs():
    filters = {
        'service': request.args.get('service'),
        'level': request.args.get('level'),
        'start_date': request.args.get('start_date'),
        'end_date': request.args.get('end_date'),
        'search': request.args.get('search')
    }
    
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 100))
    
    result = log_service.get_logs(filters, page, limit)
    return jsonify(result), 200

@logs_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    days = int(request.args.get('days', 7))
    analytics = log_service.get_log_analytics(days)
    return jsonify(analytics), 200

@logs_bp.route('/search', methods=['GET'])
@jwt_required()
def search_logs():
    query = request.args.get('q', '')
    service = request.args.get('service')
    level = request.args.get('level')
    
    filters = {
        'search': query,
        'service': service,
        'level': level
    }
    
    result = log_service.get_logs(filters)
    return jsonify(result), 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.resource import Resource
from app.middleware.auth_middleware import role_required
from app.utils.validators import validate_resource_data
from datetime import datetime

resources_bp = Blueprint('resources', __name__)

@resources_bp.route('/register', methods=['POST'])
@jwt_required()
@role_required('admin', 'staff')
def register_resource():
    """Register a new resource"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate data
        is_valid, error_msg = validate_resource_data(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Create new resource
        new_resource = Resource(
            type=data['type'],
            name=data['name'],
            status=data.get('status', 'available'),
            ward_id=data.get('ward_id'),
            bed_number=data.get('bed_number'),
            ot_number=data.get('ot_number'),
            serial_number=data.get('serial_number'),
            location=data.get('location'),
            description=data.get('description')
        )
        
        db.session.add(new_resource)
        db.session.commit()
        
        return jsonify({
            'message': 'Resource registered successfully',
            'resource': new_resource.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_resources():
    """Get all resources with optional filtering"""
    try:
        type_filter = request.args.get('type')
        status_filter = request.args.get('status')
        
        query = Resource.query
        
        if type_filter:
            query = query.filter_by(type=type_filter)
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        resources = query.order_by(Resource.created_at.desc()).all()
        
        return jsonify({
            'resources': [resource.to_dict() for resource in resources],
            'count': len(resources)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['GET'])
@jwt_required()
def get_resource(resource_id):
    """Get resource by ID"""
    try:
        resource = Resource.query.get(resource_id)
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        return jsonify(resource.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['PUT'])
@jwt_required()
@role_required('admin', 'staff')
def update_resource(resource_id):
    """Update resource details"""
    try:
        resource = Resource.query.get(resource_id)
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            resource.name = data['name']
        if 'status' in data:
            resource.status = data['status']
        if 'location' in data:
            resource.location = data['location']
        if 'description' in data:
            resource.description = data['description']
        if 'ward_id' in data:
            resource.ward_id = data['ward_id']
        if 'bed_number' in data:
            resource.bed_number = data['bed_number']
        if 'ot_number' in data:
            resource.ot_number = data['ot_number']
        if 'serial_number' in data:
            resource.serial_number = data['serial_number']
        
        resource.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Resource updated successfully',
            'resource': resource.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_resource(resource_id):
    """Delete resource (Admin only)"""
    try:
        resource = Resource.query.get(resource_id)
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        db.session.delete(resource)
        db.session.commit()
        
        return jsonify({'message': 'Resource deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_resources():
    """Get all available resources"""
    try:
        type_filter = request.args.get('type')
        
        query = Resource.query.filter_by(status='available')
        
        if type_filter:
            query = query.filter_by(type=type_filter)
        
        resources = query.all()
        
        return jsonify({
            'resources': [resource.to_dict() for resource in resources],
            'count': len(resources)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/beds', methods=['GET'])
@jwt_required()
def get_beds():
    """Get all beds"""
    try:
        status_filter = request.args.get('status')
        query = Resource.query.filter_by(type='bed')
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        beds = query.all()
        return jsonify({
            'beds': [bed.to_dict() for bed in beds],
            'count': len(beds)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/operation-theatres', methods=['GET'])
@jwt_required()
def get_operation_theatres():
    """Get all operation theatres"""
    try:
        status_filter = request.args.get('status')
        query = Resource.query.filter_by(type='operation_theatre')
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        ots = query.all()
        return jsonify({
            'operation_theatres': [ot.to_dict() for ot in ots],
            'count': len(ots)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/machines', methods=['GET'])
@jwt_required()
def get_machines():
    """Get all machines"""
    try:
        status_filter = request.args.get('status')
        query = Resource.query.filter_by(type='machine')
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        machines = query.all()
        return jsonify({
            'machines': [machine.to_dict() for machine in machines],
            'count': len(machines)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

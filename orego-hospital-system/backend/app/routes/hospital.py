from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.hospital import Hospital
from app.middleware.auth_middleware import role_required

hospital_bp = Blueprint('hospital', __name__)

@hospital_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
@role_required('admin')
def create_hospital():
    """Create or update hospital details (Admin only)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check required fields
        required_fields = ['name', 'address', 'phone_number', 'email', 'registration_number']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if hospital already exists
        existing_hospital = Hospital.query.first()
        
        if existing_hospital:
            # Update existing hospital
            existing_hospital.name = data['name']
            existing_hospital.address = data['address']
            existing_hospital.phone_number = data['phone_number']
            existing_hospital.email = data['email']
            existing_hospital.registration_number = data['registration_number']
            existing_hospital.total_beds = data.get('total_beds', 0)
            existing_hospital.total_operation_theatres = data.get('total_operation_theatres', 0)
            existing_hospital.description = data.get('description')
            existing_hospital.logo_url = data.get('logo_url')
            
            db.session.commit()
            
            return jsonify({
                'message': 'Hospital details updated successfully',
                'hospital': existing_hospital.to_dict()
            }), 200
        else:
            # Create new hospital
            new_hospital = Hospital(
                name=data['name'],
                address=data['address'],
                phone_number=data['phone_number'],
                email=data['email'],
                registration_number=data['registration_number'],
                total_beds=data.get('total_beds', 0),
                total_operation_theatres=data.get('total_operation_theatres', 0),
                description=data.get('description'),
                logo_url=data.get('logo_url')
            )
            
            db.session.add(new_hospital)
            db.session.commit()
            
            return jsonify({
                'message': 'Hospital details created successfully',
                'hospital': new_hospital.to_dict()
            }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@hospital_bp.route('/', methods=['GET'], strict_slashes=False)
def get_hospital():
    """Get hospital details (Public)"""
    try:
        hospital = Hospital.query.first()
        
        if not hospital:
            return jsonify({'error': 'Hospital details not found'}), 404
        
        return jsonify(hospital.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@hospital_bp.route('/', methods=['PUT'], strict_slashes=False)
@jwt_required()
@role_required('admin')
def update_hospital():
    """Update hospital details (Admin only)"""
    try:
        hospital = Hospital.query.first()
        
        if not hospital:
            return jsonify({'error': 'Hospital details not found. Please create first.'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            hospital.name = data['name']
        if 'address' in data:
            hospital.address = data['address']
        if 'phone_number' in data:
            hospital.phone_number = data['phone_number']
        if 'email' in data:
            hospital.email = data['email']
        if 'registration_number' in data:
            hospital.registration_number = data['registration_number']
        if 'total_beds' in data:
            hospital.total_beds = data['total_beds']
        if 'total_operation_theatres' in data:
            hospital.total_operation_theatres = data['total_operation_theatres']
        if 'description' in data:
            hospital.description = data['description']
        if 'logo_url' in data:
            hospital.logo_url = data['logo_url']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Hospital details updated successfully',
            'hospital': hospital.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

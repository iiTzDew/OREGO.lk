from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.user import User
from app.middleware.auth_middleware import role_required, get_current_user
from app.utils.validators import validate_user_data, SPECIALITIES
from app.utils.security import hash_password
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/register', methods=['POST'])
@jwt_required()
@role_required('admin')
def register_user():
    """Register a new user (Admin only)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        role = data.get('role')
        if not role or role not in ['admin', 'doctor', 'nurse', 'patient', 'staff']:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Validate data
        is_valid, error_msg = validate_user_data(data, role)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Check if ID card already exists
        if User.query.filter_by(id_card_number=data['id_card_number']).first():
            return jsonify({'error': 'ID card number already exists'}), 400
        
        # Create new user
        new_user = User(
            username=data['username'],
            password_hash=hash_password(data['password']),
            role=role,
            name=data['name'],
            birthday=datetime.strptime(data['birthday'], '%Y-%m-%d').date(),
            id_card_number=data['id_card_number'],
            address=data['address'],
            phone_number=data['phone_number'],
            email=data['email'],
            speciality=data.get('speciality'),
            medical_status=data.get('medical_status'),
            operation_type=data.get('operation_type')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/', methods=['GET'])
@jwt_required()
@role_required('admin', 'doctor', 'nurse', 'staff')
def get_all_users():
    """Get all users with optional filtering"""
    try:
        role_filter = request.args.get('role')
        speciality_filter = request.args.get('speciality')
        status_filter = request.args.get('status', 'active')
        
        query = User.query
        
        if role_filter:
            query = query.filter_by(role=role_filter)
        
        if speciality_filter:
            query = query.filter_by(speciality=speciality_filter)
        
        if status_filter == 'active':
            query = query.filter_by(is_active=True)
        elif status_filter == 'inactive':
            query = query.filter_by(is_active=False)
        
        users = query.all()
        
        return jsonify({
            'users': [user.to_dict() for user in users],
            'count': len(users)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user by ID"""
    try:
        current_user = get_current_user()
        
        # Users can only view their own profile unless they're admin
        if current_user.role != 'admin' and current_user.id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user details"""
    try:
        current_user = get_current_user()
        
        # Users can only update their own profile unless they're admin
        if current_user.role != 'admin' and current_user.id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            user.name = data['name']
        if 'address' in data:
            user.address = data['address']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        if 'email' in data:
            # Check if email already exists for another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        # Only admin can change role and speciality
        if current_user.role == 'admin':
            if 'speciality' in data:
                user.speciality = data['speciality']
            if 'medical_status' in data:
                user.medical_status = data['medical_status']
            if 'operation_type' in data:
                user.operation_type = data['operation_type']
            if 'is_active' in data:
                user.is_active = data['is_active']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/deactivate', methods=['POST'])
@jwt_required()
@role_required('admin')
def deactivate_user(user_id):
    """Deactivate user account (Admin only)"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'User deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/<user_id>/activate', methods=['POST'])
@jwt_required()
@role_required('admin')
def activate_user(user_id):
    """Activate user account (Admin only)"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = True
        db.session.commit()
        
        return jsonify({'message': 'User activated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/specialities', methods=['GET'])
@jwt_required()
def get_specialities():
    """Get list of all specialities"""
    return jsonify({'specialities': SPECIALITIES}), 200

@users_bp.route('/doctors', methods=['GET'])
@jwt_required()
def get_doctors():
    """Get all doctors"""
    try:
        doctors = User.query.filter_by(role='doctor', is_active=True).all()
        return jsonify({
            'doctors': [doctor.to_dict() for doctor in doctors],
            'count': len(doctors)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/nurses', methods=['GET'])
@jwt_required()
def get_nurses():
    """Get all nurses"""
    try:
        nurses = User.query.filter_by(role='nurse', is_active=True).all()
        return jsonify({
            'nurses': [nurse.to_dict() for nurse in nurses],
            'count': len(nurses)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """Get all staff"""
    try:
        staff = User.query.filter_by(role='staff', is_active=True).all()
        return jsonify({
            'staff': [s.to_dict() for s in staff],
            'count': len(staff)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    """Get all patients"""
    try:
        patients = User.query.filter_by(role='patient', is_active=True).all()
        return jsonify({
            'patients': [patient.to_dict() for patient in patients],
            'count': len(patients)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

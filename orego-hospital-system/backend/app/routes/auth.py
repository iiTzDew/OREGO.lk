from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.security import check_password, hash_password
from datetime import datetime, timedelta
import secrets

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not check_password(data['password'], user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated. Please contact administrator.'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        return jsonify({'access_token': access_token}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user details"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    """Request password reset token"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username'):
            return jsonify({'error': 'Username is required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user:
            # Don't reveal if user exists
            return jsonify({'message': 'If the username exists, a reset token has been generated. Please contact admin.'}), 200
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()
        
        # In production, send this via email. For now, return it (admin will provide it to user)
        return jsonify({
            'message': 'Reset token generated. Please contact admin.',
            'reset_token': reset_token  # In production, send via email instead
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
    try:
        data = request.get_json()
        
        if not data or not data.get('reset_token') or not data.get('new_password'):
            return jsonify({'error': 'Reset token and new password are required'}), 400
        
        user = User.query.filter_by(reset_token=data['reset_token']).first()
        
        if not user:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
        
        if user.reset_token_expiry < datetime.utcnow():
            return jsonify({'error': 'Reset token has expired'}), 400
        
        # Update password
        user.password_hash = hash_password(data['new_password'])
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()
        
        return jsonify({'message': 'Password reset successful'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password for logged-in user"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not check_password(data['current_password'], user.password_hash):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        user.password_hash = hash_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

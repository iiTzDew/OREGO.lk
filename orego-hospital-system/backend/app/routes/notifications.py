from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.notification import Notification
from app.middleware.auth_middleware import get_current_user, role_required

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_notifications():
    """Get notifications for current user"""
    try:
        current_user = get_current_user()
        
        # Get query parameters
        is_read = request.args.get('is_read')
        notification_type = request.args.get('type')
        
        query = Notification.query.filter_by(recipient_id=current_user.id)
        
        if is_read is not None:
            query = query.filter_by(is_read=is_read.lower() == 'true')
        
        if notification_type:
            query = query.filter_by(type=notification_type)
        
        notifications = query.order_by(Notification.created_at.desc()).all()
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications],
            'count': len (notifications),
            'unread_count': Notification.query.filter_by(recipient_id=current_user.id, is_read=False).count()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>/read', methods=['POST'], strict_slashes=False)
@jwt_required()
def mark_as_read(notification_id):
    """Mark notification as read"""
    try:
        current_user = get_current_user()
        
        notification = Notification.query.get(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Ensure user owns this notification
        if notification.recipient_id != current_user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'message': 'Notification marked as read',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/mark-all-read', methods=['POST'], strict_slashes=False)
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read for current user"""
    try:
        current_user = get_current_user()
        
        Notification.query.filter_by(recipient_id=current_user.id, is_read=False).update({
            'is_read': True
        })
        db.session.commit()
        
        return jsonify({'message': 'All notifications marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_notification(notification_id):
    """Delete notification"""
    try:
        current_user = get_current_user()
        
        notification = Notification.query.get(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Ensure user owns this notification
        if notification.recipient_id != current_user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({'message': 'Notification deleted'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/create', methods=['POST'], strict_slashes=False)
@jwt_required()
@role_required('admin')
def create_notification():
    """Create a notification (Admin only)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['recipient_id', 'title', 'message', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        new_notification = Notification(
            recipient_id=data['recipient_id'],
            title=data['title'],
            message=data['message'],
            type=data['type'],
            related_id=data.get('related_id')
        )
        
        db.session.add(new_notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Notification created successfully',
            'notification': new_notification.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/broadcast', methods=['POST'], strict_slashes=False)
@jwt_required()
@role_required('admin')
def broadcast_notification():
    """Broadcast notification to all users or specific role (Admin only)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('message'):
            return jsonify({'error': 'Title and message are required'}), 400
        
        from app.models.user import User
        
        role_filter = data.get('role')
        
        if role_filter:
            users = User.query.filter_by(role=role_filter, is_active=True).all()
        else:
            users = User.query.filter_by(is_active=True).all()
        
        notifications_created = 0
        for user in users:
            notification = Notification(
                recipient_id=user.id,
                title=data['title'],
                message=data['message'],
                type=data.get('type', 'general')
            )
            db.session.add(notification)
            notifications_created += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Broadcast sent to {notifications_created} users',
            'count': notifications_created
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

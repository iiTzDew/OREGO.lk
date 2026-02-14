from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.booking import Booking, BookingResource
from app.models.resource import Resource
from app.models.user import User
from app.models.notification import Notification
from app.middleware.auth_middleware import role_required, get_current_user
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required('admin', 'doctor')
def create_booking():
    """Create a new booking/appointment/surgery"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['patient_id', 'doctor_id', 'booking_type', 'scheduled_date', 'duration_hours']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse dates
        scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
        duration_hours = int(data['duration_hours'])
        scheduled_end_date = datetime.fromtimestamp(scheduled_date.timestamp() + duration_hours * 3600)
        
        # Check if doctor exists
        doctor = User.query.get(data['doctor_id'])
        if not doctor or doctor.role != 'doctor':
            return jsonify({'error': 'Invalid doctor'}), 400
        
        # Check if patient exists
        patient = User.query.get(data['patient_id'])
        if not patient or patient.role != 'patient':
            return jsonify({'error': 'Invalid patient'}), 400
        
        # Check for doctor conflicts
        conflicting_bookings = Booking.query.filter(
            Booking.doctor_id == data['doctor_id'],
            Booking.status == 'scheduled',
            Booking.scheduled_date < scheduled_end_date,
            Booking.scheduled_end_date > scheduled_date
        ).all()
        
        if conflicting_bookings:
            return jsonify({'error': 'Doctor already has a booking during this time slot'}), 409
        
        # Create booking
        new_booking = Booking(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            booking_type=data['booking_type'],
            scheduled_date=scheduled_date,
            scheduled_end_date=scheduled_end_date,
            duration_hours=duration_hours,
            notes=data.get('notes')
        )
        
        db.session.add(new_booking)
        db.session.flush()  # Get booking ID
        
        # Allocate resources (nurses, staff, beds, OTs, machines)
        if 'allocated_resources' in data:
            for resource_allocation in data['allocated_resources']:
                resource_type = resource_allocation.get('resource_type')
                
                if resource_type in ['nurse', 'staff']:
                    # Allocate nurse/staff
                    staff_id = resource_allocation.get('staff_id')
                    if staff_id:
                        staff = User.query.get(staff_id)
                        if staff and staff.role == resource_type:
                            # Check staff availability
                            staff_conflicts = BookingResource.query.join(Booking).filter(
                                BookingResource.staff_id == staff_id,
                                Booking.status == 'scheduled',
                                Booking.scheduled_date < scheduled_end_date,
                                Booking.scheduled_end_date > scheduled_date
                            ).all()
                            
                            if staff_conflicts:
                                db.session.rollback()
                                return jsonify({'error': f'{resource_type.capitalize()} {staff.name} is already allocated during this time'}), 409
                            
                            booking_resource = BookingResource(
                                booking_id=new_booking.id,
                                resource_type=resource_type,
                                staff_id=staff_id
                            )
                            db.session.add(booking_resource)
                            
                            # Create notification for staff
                            notification = Notification(
                                recipient_id=staff_id,
                                title=f'New {data["booking_type"].capitalize()} Assignment',
                                message=f'You have been assigned to a {data["booking_type"]} on {scheduled_date.strftime("%Y-%m-%d %H:%M")} with Dr. {doctor.name}',
                                type='booking',
                                related_id=new_booking.id
                            )
                            db.session.add(notification)
                
                else:
                    # Allocate physical resource (bed, OT, machine)
                    resource_id = resource_allocation.get('resource_id')
                    if resource_id:
                        resource = Resource.query.get(resource_id)
                        if resource and resource.status == 'available':
                            # Check resource availability
                            resource_conflicts = BookingResource.query.join(Booking).filter(
                                BookingResource.resource_id == resource_id,
                                Booking.status == 'scheduled',
                                Booking.scheduled_date < scheduled_end_date,
                                Booking.scheduled_end_date > scheduled_date
                            ).all()
                            
                            if resource_conflicts:
                                db.session.rollback()
                                return jsonify({'error': f'Resource {resource.name} is already booked during this time'}), 409
                            
                            booking_resource = BookingResource(
                                booking_id=new_booking.id,
                                resource_id=resource_id,
                                resource_type=resource.type
                            )
                            db.session.add(booking_resource)
                            
                            # Update resource status
                            resource.status = 'booked'
        
        # Create notification for patient
        patient_notification = Notification(
            recipient_id=data['patient_id'],
            title=f'{data["booking_type"].capitalize()} Scheduled',
            message=f'Your {data["booking_type"]} has been scheduled on {scheduled_date.strftime("%Y-%m-%d %H:%M")} with Dr. {doctor.name}',
            type='booking',
            related_id=new_booking.id
        )
        db.session.add(patient_notification)
        
        # Create notification for doctor
        doctor_notification = Notification(
            recipient_id=data['doctor_id'],
            title=f'New {data["booking_type"].capitalize()} Scheduled',
            message=f'A {data["booking_type"]} has been scheduled for {scheduled_date.strftime("%Y-%m-%d %H:%M")} with patient {patient.name}',
            type='booking',
            related_id=new_booking.id
        )
        db.session.add(doctor_notification)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': new_booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_bookings():
    """Get all bookings with optional filtering"""
    try:
        current_user = get_current_user()
        
        # Filter bookings based on role
        if current_user.role == 'patient':
            bookings = Booking.query.filter_by(patient_id=current_user.id).order_by(Booking.scheduled_date.desc()).all()
        elif current_user.role == 'doctor':
            bookings = Booking.query.filter_by(doctor_id=current_user.id).order_by(Booking.scheduled_date.desc()).all()
        elif current_user.role in ['nurse', 'staff']:
            # Get bookings where user is allocated
            booking_ids = db.session.query(BookingResource.booking_id).filter(BookingResource.staff_id == current_user.id).all()
            booking_ids = [bid[0] for bid in booking_ids]
            bookings = Booking.query.filter(Booking.id.in_(booking_ids)).order_by(Booking.scheduled_date.desc()).all()
        else:  # admin
            bookings = Booking.query.order_by(Booking.scheduled_date.desc()).all()
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in bookings],
            'count': len(bookings)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Get booking by ID"""
    try:
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        return jsonify(booking.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>/complete', methods=['POST'])
@jwt_required()
@role_required('admin', 'doctor')
def complete_booking(booking_id):
    """Mark booking as completed"""
    try:
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        booking.status = 'completed'
        
        # Release all allocated resources
        for booking_resource in booking.allocated_resources:
            if booking_resource.resource_id:
                resource = Resource.query.get(booking_resource.resource_id)
                if resource:
                    resource.status = 'available'
            booking_resource.released_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Booking marked as completed',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<booking_id>/cancel', methods=['POST'])
@jwt_required()
@role_required('admin', 'doctor')
def cancel_booking(booking_id):
    """Cancel booking"""
    try:
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        booking.status = 'cancelled'
        
        # Release all allocated resources
        for booking_resource in booking.allocated_resources:
            if booking_resource.resource_id:
                resource = Resource.query.get(booking_resource.resource_id)
                if resource:
                    resource.status = 'available'
            booking_resource.released_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Booking cancelled',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

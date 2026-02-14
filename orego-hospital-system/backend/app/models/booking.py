from app import db
from datetime import datetime
import uuid

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    booking_type = db.Column(db.String(50), nullable=False)  # surgery, appointment, test
    
    scheduled_date = db.Column(db.DateTime, nullable=False)
    scheduled_end_date = db.Column(db.DateTime, nullable=False)  # For multi-hour surgeries
    duration_hours = db.Column(db.Integer, nullable=False, default=1)
    
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    allocated_resources = db.relationship('BookingResource', backref='booking', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.name if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else None,
            'booking_type': self.booking_type,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduled_end_date': self.scheduled_end_date.isoformat() if self.scheduled_end_date else None,
            'duration_hours': self.duration_hours,
            'status': self.status,
            'notes': self.notes,
            'allocated_resources': [br.to_dict() for br in self.allocated_resources],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class BookingResource(db.Model):
    __tablename__ = 'booking_resources'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    resource_id = db.Column(db.String(36), db.ForeignKey('resources.id'), nullable=True)
    resource_type = db.Column(db.String(50), nullable=False)  # nurse, staff, bed, operation_theatre, machine
    staff_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)  # For nurses/staff allocation
    allocated_at = db.Column(db.DateTime, default=datetime.utcnow)
    released_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    staff = db.relationship('User', foreign_keys=[staff_id], backref='resource_allocations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'resource_id': self.resource_id,
            'resource_type': self.resource_type,
            'resource_name': self.resource.name if self.resource else None,
            'staff_id': self.staff_id,
            'staff_name': self.staff.name if self.staff else None,
            'allocated_at': self.allocated_at.isoformat() if self.allocated_at else None,
            'released_at': self.released_at.isoformat() if self.released_at else None
        }

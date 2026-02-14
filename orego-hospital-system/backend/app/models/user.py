from app import db
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, doctor, nurse, patient, staff
    
    # Common fields
    name = db.Column(db.String(100), nullable=False)
    birthday = db.Column(db.Date, nullable=False)
    id_card_number = db.Column(db.String(20), unique=True, nullable=False)
    address = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    
    # Optional fields
    speciality = db.Column(db.String(100), nullable=True)  # For doctors and staff
    medical_status = db.Column(db.String(50), nullable=True)  # For patients
    operation_type = db.Column(db.String(50), nullable=True)  # For patients (surgical, medical, operation)
    
    # Status fields
    is_active = db.Column(db.Boolean, default=True)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    bookings_as_patient = db.relationship('Booking', foreign_keys='Booking.patient_id', backref='patient', lazy=True)
    bookings_as_doctor = db.relationship('Booking', foreign_keys='Booking.doctor_id', backref='doctor', lazy=True)
    notifications = db.relationship('Notification', backref='recipient', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'name': self.name,
            'birthday': self.birthday.isoformat() if self.birthday else None,
            'id_card_number': self.id_card_number,
            'address': self.address,
            'phone_number': self.phone_number,
            'email': self.email,
            'speciality': self.speciality,
            'medical_status': self.medical_status,
            'operation_type': self.operation_type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

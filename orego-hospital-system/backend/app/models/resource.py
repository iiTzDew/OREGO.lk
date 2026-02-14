from app import db
from datetime import datetime
import uuid

class Resource(db.Model):
    __tablename__ = 'resources'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.String(50), nullable=False)  # bed, operation_theatre, machine
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='available')  # available, booked, maintenance
    
    # Specific identifiers
    ward_id = db.Column(db.String(50), nullable=True)  # For beds
    bed_number = db.Column(db.String(20), nullable=True)  # For beds
    ot_number = db.Column(db.String(20), nullable=True)  # For operation theatres
    serial_number = db.Column(db.String(50), nullable=True)  # For machines
    
    location = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    registered_date = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    booking_resources = db.relationship('BookingResource', backref='resource', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        identifier = None
        if self.type == 'bed':
            identifier = f"Ward: {self.ward_id}, Bed: {self.bed_number}"
        elif self.type == 'operation_theatre':
            identifier = f"OT-{self.ot_number}"
        elif self.type == 'machine':
            identifier = f"SN: {self.serial_number}"
            
        return {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'status': self.status,
            'ward_id': self.ward_id,
            'bed_number': self.bed_number,
            'ot_number': self.ot_number,
            'serial_number': self.serial_number,
            'identifier': identifier,
            'location': self.location,
            'description': self.description,
            'registered_date': self.registered_date.isoformat() if self.registered_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

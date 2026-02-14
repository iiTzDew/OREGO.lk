from app import db
from datetime import datetime
import uuid

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    total_beds = db.Column(db.Integer, default=0)
    total_operation_theatres = db.Column(db.Integer, default=0)
    description = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'phone_number': self.phone_number,
            'email': self.email,
            'registration_number': self.registration_number,
            'total_beds': self.total_beds,
            'total_operation_theatres': self.total_operation_theatres,
            'description': self.description,
            'logo_url': self.logo_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

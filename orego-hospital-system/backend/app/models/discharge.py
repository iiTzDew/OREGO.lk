from app import db
from datetime import datetime
import uuid

class Discharge(db.Model):
    __tablename__ = 'discharges'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    admission_date = db.Column(db.Date, nullable=False)
    discharge_date = db.Column(db.Date, nullable=False)
    
    diagnosed_disease = db.Column(db.Text, nullable=True)
    treatment_summary = db.Column(db.Text, nullable=True)
    prescribed_medicines = db.Column(db.Text, nullable=True)
    follow_up_instructions = db.Column(db.Text, nullable=True)
    
    bed_id = db.Column(db.String(36), db.ForeignKey('resources.id'), nullable=True)
    
    doctor_approval = db.Column(db.Boolean, default=False)
    discharge_summary = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('User', foreign_keys=[patient_id], backref='discharges_as_patient')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='discharges_approved')
    bed = db.relationship('Resource', foreign_keys=[bed_id])
    
    def to_dict(self):
        duration = (self.discharge_date - self.admission_date).days if self.discharge_date and self.admission_date else 0
        
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.name if self.patient else None,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else None,
            'admission_date': self.admission_date.isoformat() if self.admission_date else None,
            'discharge_date': self.discharge_date.isoformat() if self.discharge_date else None,
            'duration_days': duration,
            'diagnosed_disease': self.diagnosed_disease,
            'treatment_summary': self.treatment_summary,
            'prescribed_medicines': self.prescribed_medicines,
            'follow_up_instructions': self.follow_up_instructions,
            'bed_id': self.bed_id,
            'bed_info': self.bed.to_dict() if self.bed else None,
            'doctor_approval': self.doctor_approval,
            'discharge_summary': self.discharge_summary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

from app import db
from datetime import datetime
import uuid

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # booking, discharge, alert, general
    is_read = db.Column(db.Boolean, default=False)
    related_id = db.Column(db.String(36), nullable=True)  # Related booking/discharge ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipient_id': self.recipient_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'related_id': self.related_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

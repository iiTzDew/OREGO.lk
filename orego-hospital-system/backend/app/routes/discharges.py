from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.discharge import Discharge
from app.models.user import User
from app.models.resource import Resource
from app.models.notification import Notification
from app.middleware.auth_middleware import role_required, get_current_user
from datetime import datetime

discharges_bp = Blueprint('discharges', __name__)

@discharges_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required('admin', 'doctor', 'staff')
def create_discharge():
    """Create discharge record"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Required fields
        required_fields = ['patient_id', 'doctor_id', 'admission_date', 'discharge_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse dates
        admission_date = datetime.strptime(data['admission_date'], '%Y-%m-%d').date()
        discharge_date = datetime.strptime(data['discharge_date'], '%Y-%m-%d').date()
        
        # Validate discharge date is after admission date
        if discharge_date <= admission_date:
            return jsonify({'error': 'Discharge date must be after admission date'}), 400
        
        # Check if patient and doctor exist
        patient = User.query.get(data['patient_id'])
        if not patient or patient.role != 'patient':
            return jsonify({'error': 'Invalid patient'}), 400
        
        doctor = User.query.get(data['doctor_id'])
        if not doctor or doctor.role != 'doctor':
            return jsonify({'error': 'Invalid doctor'}), 400
        
        # Create discharge record
        new_discharge = Discharge(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            admission_date=admission_date,
            discharge_date=discharge_date,
            diagnosed_disease=data.get('diagnosed_disease'),
            treatment_summary=data.get('treatment_summary'),
            prescribed_medicines=data.get('prescribed_medicines'),
            follow_up_instructions=data.get('follow_up_instructions'),
            bed_id=data.get('bed_id') if data.get('bed_id') else None,
            doctor_approval=data.get('doctor_approval', False)
        )
        
        # Generate discharge summary
        duration = (discharge_date - admission_date).days
        summary = f"""
DISCHARGE SUMMARY
-----------------
Patient Name: {patient.name}
Patient ID: {patient.id_card_number}
Admission Date: {admission_date.strftime('%Y-%m-%d')}
Discharge Date: {discharge_date.strftime('%Y-%m-%d')}
Duration of Stay: {duration} days

Diagnosed Disease: {data.get('diagnosed_disease', 'N/A')}

Treatment Summary:
{data.get('treatment_summary', 'N/A')}

Prescribed Medicines:
{data.get('prescribed_medicines', 'N/A')}

Follow-up Instructions:
{data.get('follow_up_instructions', 'N/A')}

Discharged by: Dr. {doctor.name}
Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}
"""
        new_discharge.discharge_summary = summary
        
        db.session.add(new_discharge)
        
        # If bed was allocated, release it
        if data.get('bed_id'):
            bed = Resource.query.get(data['bed_id'])
            if bed:
                bed.status = 'available'
        
        # Create notification for patient
        patient_notification = Notification(
            recipient_id=data['patient_id'],
            title='Discharge Processed',
            message=f'You have been discharged from the hospital. Please review your discharge summary and follow-up instructions.',
            type='discharge',
            related_id=new_discharge.id
        )
        db.session.add(patient_notification)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Discharge record created successfully',
            'discharge': new_discharge.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@discharges_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_discharges():
    """Get all discharge records with optional filtering"""
    try:
        current_user = get_current_user()
        
        # Filter based on role
        if current_user.role == 'patient':
            discharges = Discharge.query.filter_by(patient_id=current_user.id).order_by(Discharge.discharge_date.desc()).all()
        elif current_user.role == 'doctor':
            discharges = Discharge.query.filter_by(doctor_id=current_user.id).order_by(Discharge.discharge_date.desc()).all()
        else:  # admin, nurse, staff
            discharges = Discharge.query.order_by(Discharge.discharge_date.desc()).all()
        
        return jsonify({
            'discharges': [discharge.to_dict() for discharge in discharges],
            'count': len(discharges)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@discharges_bp.route('/<discharge_id>', methods=['GET'])
@jwt_required()
def get_discharge(discharge_id):
    """Get discharge record by ID"""
    try:
        discharge = Discharge.query.get(discharge_id)
        
        if not discharge:
            return jsonify({'error': 'Discharge record not found'}), 404
        
        return jsonify(discharge.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@discharges_bp.route('/<discharge_id>', methods=['PUT'])
@jwt_required()
@role_required('admin', 'doctor')
def update_discharge(discharge_id):
    """Update discharge record"""
    try:
        discharge = Discharge.query.get(discharge_id)
        
        if not discharge:
            return jsonify({'error': 'Discharge record not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'diagnosed_disease' in data:
            discharge.diagnosed_disease = data['diagnosed_disease']
        if 'treatment_summary' in data:
            discharge.treatment_summary = data['treatment_summary']
        if 'prescribed_medicines' in data:
            discharge.prescribed_medicines = data['prescribed_medicines']
        if 'follow_up_instructions' in data:
            discharge.follow_up_instructions = data['follow_up_instructions']
        if 'doctor_approval' in data:
            discharge.doctor_approval = data['doctor_approval']
        
        # Regenerate summary if content changed
        if any(key in data for key in ['diagnosed_disease', 'treatment_summary', 'prescribed_medicines', 'follow_up_instructions']):
            patient = discharge.patient
            doctor = discharge.doctor
            duration = (discharge.discharge_date - discharge.admission_date).days
            
            summary = f"""
DISCHARGE SUMMARY
-----------------
Patient Name: {patient.name}
Patient ID: {patient.id_card_number}
Admission Date: {discharge.admission_date.strftime('%Y-%m-%d')}
Discharge Date: {discharge.discharge_date.strftime('%Y-%m-%d')}
Duration of Stay: {duration} days

Diagnosed Disease: {discharge.diagnosed_disease or 'N/A'}

Treatment Summary:
{discharge.treatment_summary or 'N/A'}

Prescribed Medicines:
{discharge.prescribed_medicines or 'N/A'}

Follow-up Instructions:
{discharge.follow_up_instructions or 'N/A'}

Discharged by: Dr. {doctor.name}
Updated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}
"""
            discharge.discharge_summary = summary
        
        discharge.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Discharge record updated successfully',
            'discharge': discharge.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@discharges_bp.route('/<discharge_id>/approve', methods=['POST'])
@jwt_required()
@role_required('doctor')
def approve_discharge(discharge_id):
    """Approve discharge (Doctor only)"""
    try:
        current_user = get_current_user()
        discharge = Discharge.query.get(discharge_id)
        
        if not discharge:
            return jsonify({'error': 'Discharge record not found'}), 404
        
        # Only the assigned doctor can approve
        if discharge.doctor_id != current_user.id:
            return jsonify({'error': 'Only the assigned doctor can approve this discharge'}), 403
        
        discharge.doctor_approval = True
        discharge.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Discharge approved successfully',
            'discharge': discharge.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

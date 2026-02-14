import re
from datetime import datetime

# List of specialities for doctors and staff
SPECIALITIES = [
    'General Medicine',
    'General Surgery',
    'Emergency Medicine',
    'Obstetrics and Gynecology',
    'Pediatrics',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Orthopedics',
    'Cardiology',
    'Dermatology',
    'ENT (Otolaryngology)',
    'Ophthalmology',
    'Psychiatry',
    'Neurology',
    'Urology',
    'Nephrology',
    'Pulmonology',
    'Gastroenterology',
    'Endocrinology',
    'Oncology',
    'Hematology',
    'Rheumatology',
    'Plastic Surgery',
    'Cardiothoracic Surgery',
    'Neurosurgery',
    'Vascular Surgery',
    'Infectious Disease',
    'Radiologic Technologist',
    'MRI Technologist',
    'CT Technologist',
    'Ultrasound Sonographer',
    'X-ray Technician',
    'ECG Technician',
    'EEG Technician',
    'Other'
]

OPERATION_TYPES = ['surgical', 'medical', 'operation']

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number (10 digits)"""
    pattern = r'^0[0-9]{9}$'
    return re.match(pattern, phone) is not None

def validate_id_card(id_card):
    """Validate Sri Lankan ID card format (9 digits followed by V or X)"""
    pattern = r'^[0-9]{9}[vVxX]$'
    return re.match(pattern, id_card) is not None

def validate_date(date_string):
    """Validate date format YYYY-MM-DD"""
    try:
        datetime.strptime(date_string, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_user_data(data, role):
    """
    Validate user registration data based on role
    Returns (is_valid, error_message)
    """
    errors = []
    
    # Required fields for all roles
    required_fields = ['username', 'password', 'name', 'birthday', 'id_card_number', 
                      'address', 'phone_number', 'email', 'role']
    
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f'{field} is required')
    
    if errors:
        return False, ', '.join(errors)
    
    # Email validation
    if not validate_email(data['email']):
        errors.append('Invalid email format')
    
    # Phone validation
    if not validate_phone(data['phone_number']):
        errors.append('Invalid phone number format (should be 10 digits starting with 0)')
    
    # ID card validation
    if not validate_id_card(data['id_card_number']):
        errors.append('Invalid ID card format (should be 9 digits followed by V or X)')
    
    # Role-specific validation
    if role == 'patient':
        if not data.get('medical_status'):
            errors.append('Medical status is required for patients')
        if not data.get('operation_type'):
            errors.append('Operation type is required for patients')
        elif data['operation_type'] not in OPERATION_TYPES:
            errors.append(f'Operation type must be one of: {", ".join(OPERATION_TYPES)}')
    
    if role in ['doctor', 'staff']:
        if not data.get('speciality'):
            errors.append(f'Speciality is required for {role}')
    
    if errors:
        return False, ', '.join(errors)
    
    return True, None

def validate_resource_data(data):
    """
    Validate resource registration data
    Returns (is_valid, error_message)
    """
    errors = []
    
    required_fields = ['type', 'name']
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f'{field} is required')
    
    if 'type' in data:
        valid_types = ['bed', 'operation_theatre', 'machine']
        if data['type'] not in valid_types:
            errors.append(f'Type must be one of: {", ".join(valid_types)}')
        
        # Type-specific validation
        if data['type'] == 'bed':
            if not data.get('bed_number'):
                errors.append('Bed number is required for beds')
        
        elif data['type'] == 'operation_theatre':
            if not data.get('ot_number'):
                errors.append('OT number is required for operation theatres')
        
        elif data['type'] == 'machine':
            if not data.get('serial_number'):
                errors.append('Serial number is required for machines')
    
    if errors:
        return False, ', '.join(errors)
    
    return True, None

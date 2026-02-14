from dotenv import load_dotenv

# MUST load environment variables FIRST
load_dotenv(override=True)

import os
from datetime import date
import uuid

print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")

from app import create_app, db
from app.models.user import User
from app.utils.security import hash_password

app = create_app()

test_users = [
    {
        'username': 'doctor1',
        'password': 'doctor123',
        'role': 'doctor',
        'name': 'Dr. John Smith',
        'email': 'doctor1@hospital.com',
        'speciality': 'Cardiology'
    },
    {
        'username': 'nurse1',
        'password': 'nurse123',
        'role': 'nurse',
        'name': 'Mary Johnson',
        'email': 'nurse1@hospital.com',
        'speciality': None
    },
    {
        'username': 'patient1',
        'password': 'patient123',
        'role': 'patient',
        'name': 'Alice Williams',
        'email': 'patient1@hospital.com',
        'speciality': None
    },
    {
        'username': 'staff1',
        'password': 'staff123',
        'role': 'staff',
        'name': 'Bob Brown',
        'email': 'staff1@hospital.com',
        'speciality': 'Administration'
    }
]

with app.app_context():
    print("\nCreating test users...\n")
    
    for user_data in test_users:
        # Check if user already exists
        existing_user = User.query.filter_by(username=user_data['username']).first()
        if existing_user:
            print(f"❌ User '{user_data['username']}' already exists!")
            continue
        
        # Create new user
        new_user = User(
            id=str(uuid.uuid4()),
            username=user_data['username'],
            password_hash=hash_password(user_data['password']),
            role=user_data['role'],
            name=user_data['name'],
            birthday=date(1990, 1, 1),
            id_card_number=f"{user_data['username'][:8]}123V",
            address='Hospital Address',
            phone_number='0771234567',
            email=user_data['email'],
            speciality=user_data['speciality'],
            is_active=True
        )
        db.session.add(new_user)
        print(f"✅ Created {user_data['role'].upper()}: {user_data['username']} / {user_data['password']}")
    
    db.session.commit()
    
    print("\n" + "="*60)
    print("All test users created successfully!")
    print("="*60)
    print("\nLogin Credentials:")
    print("-" * 60)
    print("ADMIN:    username: admin     | password: admin123")
    print("DOCTOR:   username: doctor1   | password: doctor123")
    print("NURSE:    username: nurse1    | password: nurse123")
    print("PATIENT:  username: patient1  | password: patient123")
    print("STAFF:    username: staff1    | password: staff123")
    print("-" * 60)

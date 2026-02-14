from dotenv import load_dotenv

# MUST load environment variables FIRST, before importing app modules
load_dotenv(override=True)

import os
from datetime import date
import uuid

# Verify the DATABASE_URL
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")

from app import create_app, db
from app.models.user import User
from app.utils.security import hash_password

app = create_app()
with app.app_context():
    # Check if admin already exists
    existing_admin = User.query.filter_by(username='admin').first()
    if existing_admin:
        print("Admin user already exists!")
    else:
        admin = User(
            id=str(uuid.uuid4()),
            username='admin',
            password_hash=hash_password('admin123'),
            role='admin',
            name='System Administrator',
            birthday=date(1990, 1, 1),
            id_card_number='123456789V',
            address='Hospital Address',
            phone_number='0771234567',
            email='admin@hospital.com',
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print('✅ Admin user created successfully!')
        print('Username: admin')
        print('Password: admin123')

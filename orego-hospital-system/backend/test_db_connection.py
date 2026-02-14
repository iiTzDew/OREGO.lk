import psycopg2
from dotenv import load_dotenv
import os

# Force reload the .env file
load_dotenv(override=True)

# Get DATABASE_URL from .env
database_url = os.getenv('DATABASE_URL')
print(f"DATABASE_URL from .env: {database_url}")

# Try different passwords
passwords = ['postgres2002', 'postgres1234', 'postgres', 'admin', 'password', '123456', '']

for password in passwords:
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='orego_hospital',
            user='postgres',
            password=password
        )
        print(f"\n✅ SUCCESS! Password is: '{password}'")
        print(f"Update your .env with: DATABASE_URL=postgresql://postgres:{password}@localhost:5432/orego_hospital")
        conn.close()
        break
    except psycopg2.OperationalError as e:
        print(f"❌ Failed with password: '{password}'")
else:
    print("\n⚠️ None of the common passwords worked.")
    print("Please check your PostgreSQL password manually.")

from dotenv import load_dotenv
from app import create_app, db
from app.models.user import User
from app.models.hospital import Hospital
from app.models.resource import Resource
from app.models.booking import Booking, BookingResource
from app.models.notification import Notification
from app.models.discharge import Discharge

# Load environment variables
load_dotenv()

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Hospital': Hospital,
        'Resource': Resource,
        'Booking': Booking,
        'Notification': Notification,
        'Discharge': Discharge
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')

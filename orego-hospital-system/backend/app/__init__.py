from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from app.config import Config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'].split(','))
    migrate.init_app(app, db)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.resources import resources_bp
    from app.routes.bookings import bookings_bp
    from app.routes.notifications import notifications_bp
    from app.routes.discharges import discharges_bp
    from app.routes.hospital import hospital_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(discharges_bp, url_prefix='/api/discharges')
    app.register_blueprint(hospital_bp, url_prefix='/api/hospital')
    
    return app

from app import app, db
from flask_migrate import Migrate, upgrade

migrate = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        
        # Run migrations
        upgrade() 
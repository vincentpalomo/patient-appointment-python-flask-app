# models/patient.py
from flask_bcrypt import Bcrypt
from .person import Person, db
from .appointments import Appointment

# Initialize bcrypt Security
bcrypt = Bcrypt()

class Patient(Person):
    __tablename__ = 'patient'
    password_hash = db.Column(db.String(128))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.is_doctor = False  # Ensure this is set to False for patients

    def get_info(self):
        return f"Patient Info - Name: {self.name}, Email: {self.email}, Phone: {self.phone}"

    def set_password(self, password):
        # Set the password hash using bcrypt Security
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        # Check if the password is correct and hashed
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def update_info(self, name=None, email=None, phone=None):
        if name:
            self.name = name
        if email:
            self.email = email
        if phone:
            self.phone = phone
        db.session.commit()

    def update_appointment(self, appointment_id, new_time):
        appointment = Appointment.query.get(appointment_id)
        if appointment and appointment.patient_id == self.id:
            appointment.appointment_time = new_time
            appointment.status = 'rescheduled'  # Update status to 'rescheduled'
            db.session.commit()
            return appointment
        return None
    
    def cancel_appointment(self, appointment_id):
        appointment = Appointment.query.get(appointment_id)
        if appointment and appointment.patient_id == self.id:
            appointment.status = 'canceled'  # Update status to 'canceled'
            db.session.commit()
            return True
        return False

    def delete_appointment(self, appointment_id):
        appointment = Appointment.query.get(appointment_id)
        if appointment and appointment.patient_id == self.id:
            db.session.delete(appointment)
            db.session.commit()
            return True
        return False
    
    # Create a patient using Polymorphism
    @staticmethod
    def get_seed_data():
        """Base method for seed data"""
        return [
            {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '1234567890',
                'password': 'password123'
            },
            {
                'name': 'Jane Smith',
                'email': 'jane@example.com',
                'phone': '0987654321',
                'password': 'password123'
            }
        ]
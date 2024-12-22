from app import app, db
from models import Patient, Doctor

# Seed the database using Polymorphism
def seed_database():
    # Create sample patients using seed data
    for patient_data in Patient.get_seed_data():
        patient = Patient(
            name=patient_data['name'],
            email=patient_data['email'],
            phone=patient_data['phone']
        )
        patient.set_password(patient_data['password'])
        db.session.add(patient)

    # Create sample doctors using seed data
    for doctor_data in Doctor.get_seed_data():
        doctor = Doctor(
            name=doctor_data['name'],
            email=doctor_data['email'],
            phone=doctor_data['phone'],
            specialization=doctor_data['specialization']
        )
        db.session.add(doctor)

    # Commit the session to save the data to the database
    db.session.commit()
    print("Database seeded!")

if __name__ == '__main__':
    with app.app_context():
        seed_database()
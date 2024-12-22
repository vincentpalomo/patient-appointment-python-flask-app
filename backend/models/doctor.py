# models/doctor.py
from .person import Person, db
from .appointments import Appointment  # Import the Appointment model

class Doctor(Person):
    __tablename__ = 'doctor'
    specialization = db.Column(db.String(100))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.is_doctor = True  # Ensure this is set to True for doctors

    # Get the doctor's information ***Polymorphism***
    def get_info(self):
        return f"Doctor Info - Name: {self.name}, Email: {self.email}, Phone: {self.phone}, Specialization: {self.specialization}"

    def get_appointments(self):
        """Retrieve all appointments for this doctor."""
        return Appointment.query.filter_by(doctor_id=self.id).all()
    
    # Create a doctor using Polymorphism
    @staticmethod
    def get_seed_data():
        """Return seed data for doctors"""
        return [
            {
                'name': 'Dr. Alice',
                'email': 'alice@example.com',
                'phone': '5551234567',
                'specialization': 'Cardiology'
            },
            {
                'name': 'Dr. Bob',
                'email': 'bob@example.com',
                'phone': '5559876543',
                'specialization': 'Dermatology'
            },
            {
                'name': 'Dr. Charlie',
                'email': 'charlie@example.com', 
                'phone': '5551122334',
                'specialization': 'Pediatrics'
            },
            {
                'name': 'Dr. David',
                'email': 'david@example.com',
                'phone': '5554455667', 
                'specialization': 'Neurology'
            },
            {
                'name': 'Dr. Emily',
                'email': 'emily@example.com',
                'phone': '5557788990',
                'specialization': 'Orthopedics'
            },
            {
                'name': 'Dr. Frank',
                'email': 'frank@example.com',
                'phone': '5552233445',
                'specialization': 'Gastroenterology'
            },
            {
                'name': 'Dr. Grace',
                'email': 'grace@example.com',
                'phone': '5555566778',
                'specialization': 'Psychiatry'
            },
            {
                'name': 'Dr. Henry',
                'email': 'henry@example.com',
                'phone': '5558899001',
                'specialization': 'Endocrinology'
            },
            {
                'name': 'Dr. Isabella',
                'email': 'isabella@example.com',
                'phone': '5553344556',
                'specialization': 'Radiology'
            },
            {
                'name': 'Dr. Jack',
                'email': 'jack@example.com',
                'phone': '5556677889',
                'specialization': 'Urology'
            },
            # Additional doctors with high-volume specializations
            {
                'name': 'Dr. Karen',
                'email': 'karen@example.com',
                'phone': '5551112233',
                'specialization': 'Family Medicine'
            },
            {
                'name': 'Dr. Lisa',
                'email': 'lisa@example.com',
                'phone': '5552223344',
                'specialization': 'Family Medicine'
            },
            {
                'name': 'Dr. Mike',
                'email': 'mike@example.com',
                'phone': '5553334455',
                'specialization': 'Family Medicine'
            },
            {
                'name': 'Dr. Nancy',
                'email': 'nancy@example.com',
                'phone': '5554445566',
                'specialization': 'Pediatrics'
            },
            {
                'name': 'Dr. Oscar',
                'email': 'oscar@example.com',
                'phone': '5555556677',
                'specialization': 'Pediatrics'
            },
            {
                'name': 'Dr. Patricia',
                'email': 'patricia@example.com',
                'phone': '5556667788',
                'specialization': 'Pediatrics'
            },
            {
                'name': 'Dr. Quinn',
                'email': 'quinn@example.com',
                'phone': '5557778899',
                'specialization': 'Cardiology'
            },
            {
                'name': 'Dr. Rachel',
                'email': 'rachel@example.com',
                'phone': '5558889900',
                'specialization': 'Cardiology'
            },
            {
                'name': 'Dr. Steve',
                'email': 'steve@example.com',
                'phone': '5559990011',
                'specialization': 'Dermatology'
            },
            {
                'name': 'Dr. Tom',
                'email': 'tom@example.com',
                'phone': '5550001122',
                'specialization': 'Dermatology'
            },
            {
                'name': 'Dr. Uma',
                'email': 'uma@example.com',
                'phone': '5551122334',
                'specialization': 'OB/GYN'
            },
            {
                'name': 'Dr. Victor',
                'email': 'victor@example.com',
                'phone': '5552233445',
                'specialization': 'OB/GYN'
            },
            {
                'name': 'Dr. Wendy',
                'email': 'wendy@example.com',
                'phone': '5553344556',
                'specialization': 'Psychiatry'
            },
            {
                'name': 'Dr. Xavier',
                'email': 'xavier@example.com',
                'phone': '5554455667',
                'specialization': 'Psychiatry'
            },
            {
                'name': 'Dr. Yolanda',
                'email': 'yolanda@example.com',
                'phone': '5555566778',
                'specialization': 'Orthopedics'
            },
            {
                'name': 'Dr. Zack',
                'email': 'zack@example.com',
                'phone': '5556677889',
                'specialization': 'Orthopedics'
            },
            {
                'name': 'Dr. Adam',
                'email': 'adam@example.com',
                'phone': '5557788990',
                'specialization': 'Internal Medicine'
            },
            {
                'name': 'Dr. Beth',
                'email': 'beth@example.com',
                'phone': '5558899001',
                'specialization': 'Internal Medicine'
            },
            {
                'name': 'Dr. Carl',
                'email': 'carl@example.com',
                'phone': '5559900112',
                'specialization': 'Neurosurgery'
            }
        ]
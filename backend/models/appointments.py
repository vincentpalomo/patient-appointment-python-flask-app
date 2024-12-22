# models/appointment.py
from .person import db

class Appointment(db.Model):
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    appointment_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # e.g., scheduled, canceled, completed
    notes = db.Column(db.String(500))  # Add notes column with max length of 500 characters

    # Specify foreign keys for the relationships
    doctor = db.relationship('Doctor', foreign_keys=[doctor_id], backref='appointments')
    patient = db.relationship('Patient', foreign_keys=[patient_id], backref='appointments')
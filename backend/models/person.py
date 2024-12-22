# models/person.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Person(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    is_doctor = db.Column(db.Boolean, default=False) # True if the person is a doctor, False if the person is a patient

    # Get the person's information ***Polymorphism***
    def get_info(self):
        return f"Name: {self.name}, Email: {self.email}, Phone: {self.phone}"
    
    # Create a person ***Polymorphism***
    @staticmethod
    def get_seed_data():
        """Base method for seed data"""
        return []
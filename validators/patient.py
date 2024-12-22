# validators/patient.py
import re
from datetime import datetime

def validate_email(email):
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return False, "Invalid email format"
    return True, ""

def validate_password(password):
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, ""

def validate_phone(phone):
    if not re.match(r"^\d{10}$", phone):
        return False, "Invalid phone number format. Must be 10 digits."
    return True, ""

def validate_name(name):
    if not re.match(r"^[a-zA-Z ]+$", name):
        return False, "Invalid name format. Must contain only letters and spaces."
    return True, ""

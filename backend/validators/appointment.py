# validators/appointment.py
from datetime import datetime

def validate_appointment_time(appointment_time):
    try:
        datetime.strptime(appointment_time, "%Y-%m-%d %H:%M")
        return True, ""
    except ValueError:
        return False, "Invalid appointment time format. Use YYYY-MM-DD HH:MM."
    
def validate_appointment_status(status):
    if status not in ['scheduled', 'canceled', 'completed']:
        return False, "Invalid appointment status. Must be 'scheduled', 'canceled', or 'completed'."
    return True, ""


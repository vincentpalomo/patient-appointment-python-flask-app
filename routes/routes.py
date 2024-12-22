# routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from models import db, Patient, Doctor, Appointment
from validators import validate_email, validate_password, validate_phone, validate_name, validate_appointment_time, validate_appointment_status

api = Blueprint('api', __name__)

# Patient routes

# Register a new patient
@api.route('/api/patients/register', methods=['POST'])
def register_patient():
    data = request.get_json()

    # Validate email
    is_valid, message = validate_email(data['email'])
    if not is_valid:
        return jsonify({"msg": message}), 400

    # Validate password
    is_valid, message = validate_password(data['password'])
    if not is_valid:
        return jsonify({"msg": message}), 400

    new_patient = Patient(name=data['name'], email=data['email'], phone=data['phone'])
    new_patient.set_password(data['password'])
    db.session.add(new_patient)
    db.session.commit()
    return jsonify({"msg": "Patient registered successfully"}), 201

# Login a patient
@api.route('/api/patients/login', methods=['POST'])
def login_patient():
    data = request.get_json()
    patient = Patient.query.filter_by(email=data['email']).first()

    # Validate password
    is_valid, message = validate_password(data['password'])
    if not is_valid:
        return jsonify({"msg": message}), 400

    # Check if patient exists and password is correct
    if patient and patient.check_password(data['password']):
        # Create access token JWT Security
        access_token = create_access_token(identity=patient.id)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Bad email or password"}), 401

# Get a patient's profile
@api.route('/api/patients/profile', methods=['GET'])
@jwt_required()
def get_patient_profile():
    current_user_id = get_jwt_identity()  # Get the current user's ID
    patient = Patient.query.get_or_404(current_user_id)  # Get the patient details

    # Get the appointments for the patient
    appointments = Appointment.query.filter_by(patient_id=current_user_id).all()

    # Prepare the response data
    profile_data = {
        'id': patient.id,
        'name': patient.name,
        'email': patient.email,
        'phone': patient.phone,
        'appointments': [{
            'id': appointment.id,
            'doctor_id': appointment.doctor_id,
            'appointment_time': appointment.appointment_time.strftime("%Y-%m-%d %H:%M"),
            'status': appointment.status
        } for appointment in appointments]
    }

    return jsonify(profile_data), 200

# Update patient information
@api.route('/api/patients/profile', methods=['PUT'])
@jwt_required()
def update_patient_info():
    current_user_id = get_jwt_identity()
    patient = Patient.query.get_or_404(current_user_id)

    data = request.get_json()

    # Validate name
    is_valid, message = validate_name(data['name'])
    if not is_valid:
        return jsonify({"msg": message}), 400
    
    # Validate email
    is_valid, message = validate_email(data['email'])
    if not is_valid:
        return jsonify({"msg": message}), 400
    
    # Validate phone
    is_valid, message = validate_phone(data['phone'])
    if not is_valid:
        return jsonify({"msg": message}), 400

    patient.update_info(name=data.get('name'), email=data.get('email'), phone=data.get('phone'))

    return jsonify({"msg": "Patient information updated successfully"}), 200

# Update an appointment
@api.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    patient = Patient.query.get_or_404(current_user_id)

    data = request.get_json()

    # Validate appointment time
    is_valid, message = validate_appointment_time(data['appointment_time'])
    if not is_valid:
        return jsonify({"msg": message}), 400 
    
    # Validate appointment status
    is_valid, message = validate_appointment_status(data['status'])
    if not is_valid:
        return jsonify({"msg": message}), 400

    new_time = datetime.strptime(data['appointment_time'], "%Y-%m-%d %H:%M")

    updated_appointment = patient.update_appointment(appointment_id, new_time)
    if updated_appointment:
        return jsonify({"msg": "Appointment rescheduled successfully", "appointment_time": updated_appointment.appointment_time.strftime("%Y-%m-%d %H:%M"), "status": updated_appointment.status}), 200
    return jsonify({"msg": "Appointment not found or you do not have permission to update it"}), 404

# Cancel an appointment
@api.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    patient = Patient.query.get_or_404(current_user_id)

    if patient.cancel_appointment(appointment_id):
        return jsonify({"msg": "Appointment canceled successfully"}), 200
    return jsonify({"msg": "Appointment not found or you do not have permission to cancel it"}), 404

# Delete an appointment
@api.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    patient = Patient.query.get_or_404(current_user_id)

    if patient.delete_appointment(appointment_id):
        return jsonify({"msg": "Appointment deleted successfully"}), 200
    return jsonify({"msg": "Appointment not found or you do not have permission to delete it"}), 404

# Get all patients
@api.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.filter_by(is_doctor=False).all()  # Filter for patients
    return jsonify([{'name': patient.name, 'email': patient.email, 'phone': patient.phone} for patient in patients]), 200

# Get all doctors 
@api.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.filter_by(is_doctor=True).all()  # Filter for doctors
    return jsonify([{'name': doctor.name, 'email': doctor.email, 'phone': doctor.phone, 'specialization': doctor.specialization} for doctor in doctors]), 200


# Doctor routes

# Get a doctor's schedule
@api.route('/api/doctors/<int:doctor_id>/appointments', methods=['GET'])
@jwt_required()
def get_doctor_appointments(doctor_id):
    # Get the doctor by ID
    doctor = Doctor.query.get_or_404(doctor_id)

    # Use the method to get appointments
    appointments = doctor.get_appointments()

    # Prepare the response data
    appointment_data = [{
        'id': appointment.id,
        'patient_id': appointment.patient_id,
        'appointment_time': appointment.appointment_time.strftime("%Y-%m-%d %H:%M"),
        'status': appointment.status
    } for appointment in appointments]

    return jsonify(appointment_data), 200



# Appointment routes 

# Create Appointment
@api.route('/api/appointments/create', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user_id = get_jwt_identity()  # Get the current user's ID
    data = request.get_json()

    # Assuming the patient is the one making the appointment
    patient = Patient.query.get(current_user_id)
    doctor = Doctor.query.get(data['doctor_id'])

    if not doctor:
        return jsonify({"msg": "Doctor not found"}), 404

    appointment_time = datetime.strptime(data['appointment_time'], "%Y-%m-%d %H:%M")

    # Check if the appointment time is already taken
    existing_appointment = Appointment.query.filter_by(
        doctor_id=doctor.id,
        appointment_time=appointment_time
    ).first()

    if existing_appointment:
        return jsonify({"msg": "Time slot is already taken"}), 400
    
    # Validate appointment status
    is_valid, message = validate_appointment_status(data['status'])
    if not is_valid:
        return jsonify({"msg": message}), 400
    
    # Validate appointment time
    is_valid, message = validate_appointment_time(data['appointment_time'])
    if not is_valid:
        return jsonify({"msg": message}), 400
    

    # Create a new appointment
    appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=patient.id,
        appointment_time=appointment_time
    )

    db.session.add(appointment)
    db.session.commit()

    return jsonify({"msg": "Appointment created successfully", "appointment_id": appointment.id}), 201

# Get all appointments
@api.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    current_user_id = get_jwt_identity()
    appointments = Appointment.query.filter((Appointment.patient_id == current_user_id) | (Appointment.doctor_id == current_user_id)).all()

    return jsonify([{
        'id': appointment.id,
        'doctor_id': appointment.doctor_id,
        'patient_id': appointment.patient_id,
        'appointment_time': appointment.appointment_time.strftime("%Y-%m-%d %H:%M"),
        'status': appointment.status
    } for appointment in appointments]), 200

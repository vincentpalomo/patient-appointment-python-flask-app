import pytest
from datetime import datetime, timedelta
from app import app as flask_app
from models import db, Patient, Doctor, Appointment

# create a test app and test client
@pytest.fixture
def app():
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key'
    })

    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()

# start test client
@pytest.fixture
def client(app):
    return app.test_client()

# create a test patient
@pytest.fixture
def test_patient(app):
    with app.app_context():
        patient = Patient(
            name="Test Patient",
            email="test@example.com",
            phone="1234567890"
        )
        patient.set_password("testpass123")
        db.session.add(patient)
        db.session.commit()
        print(patient.id)
        return patient

# create a test doctor
@pytest.fixture
def test_doctor(app):
    with app.app_context():
        doctor = Doctor(
            name="Test Doctor",
            email="doctor@example.com",
            phone="0987654321",
            specialization="General",
            is_doctor=True
        )
        db.session.add(doctor)
        db.session.commit()

        print(doctor.id)
        return doctor

# create a test auth headers
@pytest.fixture
def auth_headers(client, test_patient):
    response = client.post('/api/patients/login', json={
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

# test patient registration
def test_patient_registration(client):
    response = client.post('/api/patients/register', json={
        'name': 'New Patient',
        'email': 'new@example.com',
        'phone': '1112223333',
        'password': 'Password123!'
    })
    assert response.status_code == 201
    assert b'Patient registered successfully' in response.data

# test patient login
def test_patient_login(client, test_patient):
    response = client.post('/api/patients/login', json={
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json

# test create appointment
def test_create_appointment(client, auth_headers, test_doctor):
    appointment_time = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    response = client.post('/api/appointments/create', 
        headers=auth_headers,
        json={
            'doctor_id': test_doctor.id,
            'appointment_time': appointment_time,
            'notes': 'Test appointment'
        }
    )
    assert response.status_code == 201
    assert b'Appointment created successfully' in response.data

# test get appointments
def test_get_appointments(client, auth_headers, test_patient, test_doctor, app):
    with app.app_context():
        # First create an appointment
        appointment_time = datetime.now() + timedelta(days=1)
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            appointment_time=appointment_time,
            status='scheduled'
        )
        db.session.add(appointment)
        db.session.commit()

        response = client.get('/api/appointments', headers=auth_headers)
        assert response.status_code == 200
        appointments = response.json
        assert len(appointments) > 0
        assert appointments[0]['doctor_id'] == test_doctor.id
        assert appointments[0]['patient_id'] == test_patient.id

# test update appointment
def test_update_appointment(client, auth_headers, test_patient, test_doctor, app):
    with app.app_context():
        # Create an appointment first
        initial_time = datetime.now() + timedelta(days=1)
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            appointment_time=initial_time,
            status='scheduled'
        )
        db.session.add(appointment)
        db.session.commit()

        # Update the appointment
        new_time = (initial_time + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")
        response = client.put(
            f'/api/appointments/{appointment.id}',
            headers=auth_headers,
            json={'appointment_time': new_time}
        )
        assert response.status_code == 200
        assert b'Appointment updated successfully' in response.data

# test cancel appointment
def test_cancel_appointment(client, auth_headers, test_patient, test_doctor, app):
    with app.app_context():
        # Create an appointment first
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            appointment_time=datetime.now() + timedelta(days=1),
            status='scheduled'
        )
        db.session.add(appointment)
        db.session.commit()

        response = client.delete(f'/api/appointments/{appointment.id}', headers=auth_headers)
        assert response.status_code == 200
        assert b'Appointment canceled successfully' in response.data 

# test get all patients
def test_get_all_patients(client, test_patient):
    response = client.get('/api/patients')
    assert response.status_code == 200
    patients = response.json
    assert len(patients) > 0
    assert any(p['email'] == 'test@example.com' for p in patients)
    assert any(p['name'] == 'Test Patient' for p in patients)

# test get all doctors
def test_get_all_doctors(client, test_doctor):
    response = client.get('/api/doctors')
    assert response.status_code == 200
    doctors = response.json
    assert len(doctors) > 0
    assert any(d['email'] == 'doctor@example.com' for d in doctors)
    assert any(d['specialization'] == 'General' for d in doctors)

# test update patient info
def test_update_patient_info(client, auth_headers, test_patient):
    response = client.put('/api/patients/profile',
        headers=auth_headers,
        json={
            'name': 'Updated Patient Name',
            'email': 'updated@example.com',
            'phone': '9876543210'
        }
    )
    assert response.status_code == 200
    assert b'Patient information updated successfully' in response.data

    # Verify the updates by getting the profile
    profile_response = client.get('/api/patients/profile', headers=auth_headers)
    assert profile_response.status_code == 200
    updated_profile = profile_response.json
    assert updated_profile['name'] == 'Updated Patient Name'
    assert updated_profile['email'] == 'updated@example.com'
    assert updated_profile['phone'] == '9876543210'

# test get doctor appointments
def test_get_doctor_appointments(client, auth_headers, test_patient, test_doctor, app):
    with app.app_context():
        # Create a test appointment first
        appointment_time = datetime.now() + timedelta(days=1)
        appointment = Appointment(
            patient_id=test_patient.id,
            doctor_id=test_doctor.id,
            appointment_time=appointment_time,
            status='scheduled'
        )
        db.session.add(appointment)
        db.session.commit()

        response = client.get(f'/api/doctors/{test_doctor.id}/appointments', headers=auth_headers)
        assert response.status_code == 200
        appointments = response.json
        assert len(appointments) > 0
        assert appointments[0]['patient_id'] == test_patient.id
        assert appointments[0]['status'] == 'scheduled'

# test double booking prevention
def test_double_booking_prevention(client, auth_headers, test_doctor, test_patient, app):
    with app.app_context():
        # Create first appointment
        appointment_time = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
        first_response = client.post('/api/appointments/create',
            headers=auth_headers,
            json={
                'doctor_id': test_doctor.id,
                'appointment_time': appointment_time,
                'notes': 'First appointment'
            }
        )
        assert first_response.status_code == 201

        # Try to book the same time slot
        second_response = client.post('/api/appointments/create',
            headers=auth_headers,
            json={
                'doctor_id': test_doctor.id,
                'appointment_time': appointment_time,
                'notes': 'Second appointment'
            }
        )
        assert second_response.status_code == 400
        assert b'Time slot is already taken' in second_response.data 
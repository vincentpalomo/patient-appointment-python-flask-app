# Patient Appointment Fullstack Application

## Overview
Create a fullstack application for managing patient appointments. The application will allow patients to book, view, and cancel appointments with doctors. Doctors will be able to manage their schedules and view patient appointments.

## User Stories
- As a patient, I want to register and log in so that I can manage my appointments.
- As a doctor, I want to view my schedule and manage my availability.
- As a user, I want to search for doctors by name or specialization to find the right healthcare provider.

## Technologies
- **Backend**: Python with Flask
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript
- **Testing**: Use Test-Driven Development (TDD) principles
- **Authentication**: Implement user registration and login

## Object-Oriented Programming Principles
1. **Encapsulation**: Ensure that the data related to patients and doctors is encapsulated within their respective classes.
2. **Inheritance**: Create a base class for `Person` that can be inherited by `Patient` and `Doctor` classes.
3. **Polymorphism**: Implement methods in the `Patient` and `Doctor` classes that can be overridden to provide specific functionality.

## Requirements

### Backend
1. **Models**:
   - `Person` (base class)
     - Attributes: `name`, `email`, `phone`
     - Methods: `get_info()`
   - `Patient` (inherits from `Person`)
     - Attributes: `medical_history`, `password_hash`
     - Methods: `book_appointment()`, `update_appointment()`, `cancel_appointment()`, `register()`, `login()`
   - `Doctor` (inherits from `Person`)
     - Attributes: `specialization`, `schedule`
     - Methods: `add_availability()`, `view_appointments()`, `update_availability()`
   - **Search Functionality**: Implement a method to search for doctors by name or specialization.

2. **API Endpoints**:
   - `POST /api/patients/register` - Create a new patient
   - `POST /api/patients/login` - Login a patient
   - `GET /api/patients/profile` - Get a patient's profile
   - `PUT /api/patients/profile` - Update patient information
   - `PUT /api/appointments/<int:appointment_id>` - Update an appointment
   - `DELETE /api/appointments/<int:appointment_id>` - Cancel an appointment
   - `GET /api/patients` - Get all patients
   - `GET /api/doctors` - Get all doctors
   - `GET /api/doctors/<int:doctor_id>/appointments` - Get a doctor's schedule
   - `POST /api/appointments/create` - Create an appointment
   - `GET /api/appointments` - Get all appointments

3. **Error Handling**:
   - Implement error handling for invalid inputs and server errors in API responses.

4. **Database**:
   - Use PostgreSQL to store patient and doctor information, as well as appointment details.

### Frontend
1. **Pages**:
   - Home page with links to book an appointment and view appointments.
   - Patient registration page.
   - Doctor registration page.
   - Appointment booking page.
   - Appointment management page for doctors.
   - **Search functionality**: Include a search input to find doctors by name or specialization.

<!-- 2. **UI/UX Considerations**:
   - Use a responsive design framework (e.g., Bootstrap) for better user experience. -->

2. **Functionality**:
   - Use JavaScript to handle form submissions and API calls.
   - Use CSS for styling the application.
   - Implement the search functionality to filter doctors based on user input.

### Authentication and Authorization
- Implement user authentication for patients and doctors using JWT or OAuth.
- Define roles and permissions for patients and doctors.

### Testing
- Write unit tests for all models and API endpoints using a testing framework (e.g., pytest for Python).
- Ensure that all tests pass before deploying the application.

### Deployment Instructions
- Provide instructions for deploying the application, including any necessary environment configurations.

### Performance Considerations
- Ensure API response times are optimized for a smooth user experience.

### Documentation Standards
- Use Swagger or similar tools for API documentation.

## API Routes
### Patient Routes
- **POST** `/api/patients/register` - Register a new patient
- **POST** `/api/patients/login` - Login a patient
- **GET** `/api/patients/profile` - Get a patient's profile
- **PUT** `/api/patients/profile` - Update patient information
- **DELETE** `/api/patients/<int:patient_id>` - Delete a patient account
- **GET** `/api/patients` - Get all patients

### Doctor Routes
- **GET** `/api/doctors` - Get all doctors
- **GET** `/api/doctors/<int:doctor_id>/appointments` - Get a doctor's schedule
- **POST** `/api/doctors/register` - Register a new doctor
- **POST** `/api/doctors/login` - Login a doctor
- **PUT** `/api/doctors/<int:doctor_id>/availability` - Update doctor's availability
- **DELETE** `/api/doctors/<int:doctor_id>` - Delete a doctor account

### Appointment Routes
- **POST** `/api/appointments/create` - Create an appointment
- **PUT** `/api/appointments/<int:appointment_id>` - Update an appointment
- **DELETE** `/api/appointments/<int:appointment_id>` - Cancel an appointment
- **GET** `/api/appointments` - Get all appointments
- **GET** `/api/appointments/<int:appointment_id>` - Get details of a specific appointment

## Additional Notes
- Follow best practices for coding and documentation.
- Ensure that the application is secure and handles user data responsibly.

## Deliverables
- A complete codebase for the fullstack application.
- Documentation on how to set up and run the application.
- A test suite with all necessary tests.

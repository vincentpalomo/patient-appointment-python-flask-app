#!/bin/bash
set -e

echo "Waiting for PostgreSQL to start..."

# Function to test PostgreSQL connection
postgres_ready() {
  PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "postgres" -d "postgres" -c "SELECT 1" >/dev/null 2>&1
}

# Wait for PostgreSQL to be ready with a timeout
RETRIES=30
until postgres_ready || [ $RETRIES -eq 0 ]; do
  echo "Waiting for PostgreSQL to be ready... $((RETRIES)) remaining attempts..."
  RETRIES=$((RETRIES-1))
  sleep 1
done

if [ $RETRIES -eq 0 ]; then
  echo "Failed to connect to PostgreSQL after 30 attempts. Exiting."
  exit 1
fi

echo "PostgreSQL is up - dropping and recreating database"

# Drop and recreate database
PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "postgres" -d "postgres" -c "DROP DATABASE IF EXISTS appointment_scheduler;"
PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "postgres" -d "postgres" -c "CREATE DATABASE appointment_scheduler;"

echo "Database recreated - executing migrations"

# Initialize database
echo "Running database migrations..."
flask db upgrade

# Seed the database
echo "Seeding the database..."
python seed.py

# Start the Flask application
echo "Starting Flask application..."
exec flask run --host=0.0.0.0 --port=5000 
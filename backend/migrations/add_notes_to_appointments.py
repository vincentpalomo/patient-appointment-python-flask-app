"""Add notes column to appointments

Revision ID: add_notes_to_appointments
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add notes column to appointments table
    op.add_column('appointment', sa.Column('notes', sa.String(500), nullable=True))

def downgrade():
    # Remove notes column from appointments table
    op.drop_column('appointment', 'notes') 
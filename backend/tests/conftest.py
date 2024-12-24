import os
import sys

# Get the absolute path of the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add the backend directory to the Python path
sys.path.insert(0, backend_dir) 
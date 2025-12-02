"""
Configuration file for the Flask application.
This file holds all the settings our app needs to run.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Configuration class that holds all app settings.
    We use a class so we can easily change settings for different environments.
    """
    
    # Secret key for signing JWT tokens - must be kept secret!
    # In production, this should be a long random string
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database URL - tells SQLAlchemy where to store the database
    # SQLite is a simple file-based database, perfect for development
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///tameet.db'
    
    # Disable tracking modifications to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False


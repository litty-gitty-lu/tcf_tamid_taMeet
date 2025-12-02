"""
Configuration file for the Flask application.
This file holds all the settings our app needs to run.

When user logs in, we create a JWT token signed with the key generated, 
allowing the users profile information to stored

We use a JSON database
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
# This lets you set SECRET_KEY in a .env file instead of hardcoding it
load_dotenv()

class Config:
    """
    Configuration class that holds all app settings.
    We use a class so we can easily change settings for different environments.
    """
    
    # Secret key for signing JWT tokens - must be kept secret!
    # This is used to sign and verify JWT tokens for authentication
    # In production, this should be a long random string stored in .env file
    # 
    # How it works:
    # - When user logs in, we create a JWT token signed with this key
    # - When user makes requests, we verify the token using this key
    # - If someone changes the token, verification will fail
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'


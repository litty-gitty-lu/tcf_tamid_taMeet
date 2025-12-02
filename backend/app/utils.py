"""
Utility functions - helper functions used throughout the app.
These are functions we'll use in multiple places.
"""

import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import Config

def hash_password(password):
    """
    Hash a password using bcrypt.
    We never store plain text passwords - always hash them first!
    
    Args:
        password: The plain text password to hash
        
    Returns:
        The hashed password as a string
    """
    # Generate a salt and hash the password
    # Salt adds random data to make passwords more secure
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def check_password(password, password_hash):
    """
    Check if a plain text password matches a hashed password.
    
    Args:
        password: The plain text password to check
        password_hash: The stored hashed password
        
    Returns:
        True if passwords match, False otherwise
    """
    # Compare the plain password with the hashed password
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def generate_token(user_id):
    """
    Generate a JWT token for a user.
    JWT tokens are used to verify that a user is logged in.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        A JWT token string
    """
    # Token expires in 7 days
    expiration = datetime.utcnow() + timedelta(days=7)
    
    # Create the token with user ID and expiration
    token = jwt.encode(
        {
            'user_id': user_id,
            'exp': expiration
        },
        Config.SECRET_KEY,
        algorithm='HS256'
    )
    
    return token


def verify_token(token):
    """
    Verify a JWT token and get the user ID from it.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        The user ID if token is valid, None otherwise
    """
    try:
        # Decode the token using our secret key
        decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return decoded['user_id']
    except:
        # If token is invalid or expired, return None
        return None


def require_auth(f):
    """
    Decorator function that requires authentication.
    Use this on any route that needs the user to be logged in.
    Works with JSON database.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the token from the Authorization header
        # Frontend sends it as: Authorization: Bearer <token>
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        # Extract the token from "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except:
            return jsonify({'error': 'Invalid authorization header'}), 401
        
        # Verify the token and get user ID
        user_id = verify_token(token)
        
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get the user from JSON database
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from json_db import get_user_by_id
        
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        # Add the user to the request so the route function can use it
        request.current_user = user
        
        # Call the original function
        return f(*args, **kwargs)
    
    return decorated_function


"""
Authentication routes - handles user signup and login.
Uses JSON database instead of SQL.
"""

from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from json_db import create_user, verify_user, get_user_by_id
from app.utils import generate_token

# Create a blueprint for auth routes
bp = Blueprint('auth', __name__)


@bp.route('/signup', methods=['POST'])
def signup():
    """
    Create a new user account.
    Gets email, password, and name from request.
    Creates user, hashes password, and returns token.
    Automatically matches with Maddie!
    """
    
    # Get data from request
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    # Create user (automatically matches with Maddie)
    new_user = create_user(email, password, name)
    
    if not new_user:
        return jsonify({'error': 'User already exists'}), 400
    
    # Generate token for authentication
    token = generate_token(new_user['id'])
    
    # Return user data and token
    user_dict = {
        'id': new_user['id'],
        'email': new_user['email'],
        'name': new_user['name'],
        'bio': new_user.get('bio', ''),
        'profile_picture': new_user.get('profile_picture'),
        'interests': []
    }
    
    return jsonify({
        'user': user_dict,
        'token': token
    }), 201


@bp.route('/login', methods=['POST'])
def login():
    """
    Log in a user.
    Gets email and password from request.
    Checks password and returns token.
    """
    
    # Get data from request
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Verify user
    user = verify_user(email, password)
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate token
    token = generate_token(user['id'])
    
    # Return user data and token
    from json_db import get_user_interests
    user_dict = {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'bio': user.get('bio', ''),
        'profile_picture': user.get('profile_picture'),
        'interests': get_user_interests(user['id'])
    }
    
    return jsonify({
        'user': user_dict,
        'token': token
    }), 200

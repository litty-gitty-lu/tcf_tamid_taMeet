"""
Authentication routes - handles user signup and login.
Simple endpoints that create accounts and log users in.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from app.utils import hash_password, check_password, generate_token

# Create a blueprint for auth routes
bp = Blueprint('auth', __name__)


@bp.route('/signup', methods=['POST'])
def signup():
    """
    Create a new user account.
    Gets email, password, and name from request.
    Creates user, hashes password, and returns token.
    """
    
    # Get data from request
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    # Hash the password (never store plain text passwords)
    password_hash = hash_password(password)
    
    # Create new user
    new_user = User(
        email=email,
        password_hash=password_hash,
        name=name,
        bio='',
        profile_picture=None
    )
    
    # Save to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token for authentication
    token = generate_token(new_user.id)
    
    # Return user data and token
    return jsonify({
        'user': new_user.to_dict(),
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
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # Check if user exists and password matches
    if not user or not check_password(password, user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate token
    token = generate_token(user.id)
    
    # Return user data and token
    return jsonify({
        'user': user.to_dict(),
        'token': token
    }), 200

"""
Profile that handles user profile operations.
Uses JSON database.
"""

from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Imports functions for user data management and interest handling
from json_db import get_user_by_id, update_user, get_user_interests, set_user_interests
from app.utils import require_auth

# Create a blueprint for profile routes
# groups related routes together
bp = Blueprint('profile', __name__)

# get request for the profile
@bp.route('', methods=['GET'])
@require_auth
# getting the users profile, returning the json objectn with the users data
def get_profile():
    """
    Get current user's profile.
    Returns user data with interests.
    """
    
    # Get current user (from authentication), returns a user
    user = request.current_user
    
    # Get user's interests from the database, returns a list
    interests = get_user_interests(user['id'])
    
    # Return user data
    user_data = {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'bio': user.get('bio', ''),
        'profile_picture': user.get('profile_picture'),
        'interests': interests,
        'goals': [],
        'activityPreferences': [],
        'following': 0,
        'followers': 0,
        'slackSynced': False
    }
    
    return jsonify(user_data), 200

# put method to update the profile, puts the new information
@bp.route('', methods=['PUT'])
@require_auth
def update_profile():
    """
    Update current user's profile.
    Updates name, bio, picture, or interests if provided.
    """
    
    # Get current user from the request
    user = request.current_user
    
    # Get data from request
    data = request.get_json()
    
    # Prepare update data
    # we are checking specifically what the user wants to update
    # if the user wants to update name, it updates name
    update_data = {}
    if 'name' in data:
        update_data['name'] = data['name']
    if 'bio' in data:
        update_data['bio'] = data['bio']
    if 'profile_picture' in data:
        update_data['profile_picture'] = data['profile_picture']
    
    # Update user
    # if the user needs to be updated, update it
    if update_data:
        update_user(user['id'], **update_data)
    
    # Update interests if provided
    # handles the replacement of the interests separately
    if 'interests' in data:
        set_user_interests(user['id'], data['interests'])
    
    # Get updated user
    updated_user = get_user_by_id(user['id'])
    interests = get_user_interests(user['id'])
    
    # Return updated user data
    # fetching the new data
    user_data = {
        'id': updated_user['id'],
        'email': updated_user['email'],
        'name': updated_user['name'],
        'bio': updated_user.get('bio', ''),
        'profile_picture': updated_user.get('profile_picture'),
        'interests': interests
    }
    
    return jsonify(user_data), 200


@bp.route('/onboarding', methods=['POST'])
@require_auth
# post request to create a new profile, creating a competely new profile
# special endpoint for new users completing registration
def complete_onboarding():
    """
    Complete user onboarding.
    Sets up profile after signup with name, bio, picture, and interests.
    """
    
    # Get current user
    user = request.current_user
    
    # Get data from request
    data = request.get_json()
    
    # Update user
    # updates everything that is present
    update_data = {}
    if 'name' in data:
        update_data['name'] = data.get('name', user['name'])
    if 'bio' in data:
        update_data['bio'] = data.get('bio', '')
    if 'profile_picture' in data:
        update_data['profile_picture'] = data.get('profile_picture')
    
    if update_data:
        # updates the user data
        update_user(user['id'], **update_data)
    
    # Update interests
    # updates interests separately
    if 'interests' in data:
        set_user_interests(user['id'], data.get('interests', []))
    
    # Get updated user
    updated_user = get_user_by_id(user['id'])
    interests = get_user_interests(user['id'])
    
    # Return updated user data
    user_data = {
        'id': updated_user['id'],
        'email': updated_user['email'],
        'name': updated_user['name'],
        'bio': updated_user.get('bio', ''),
        'profile_picture': updated_user.get('profile_picture'),
        'interests': interests
    }
    
    return jsonify(user_data), 200

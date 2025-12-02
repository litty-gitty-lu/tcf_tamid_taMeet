"""
Profile routes - handles user profile operations.
Simple endpoints to view and update profiles.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models import User, UserInterest
from app.utils import require_auth

# Create a blueprint for profile routes
bp = Blueprint('profile', __name__)


@bp.route('', methods=['GET'])
@require_auth
def get_profile():
    """
    Get current user's profile.
    Returns user data with interests.
    """
    
    # Get current user (from authentication)
    user = request.current_user
    
    # Get user's interests
    interests = [interest.interest_name for interest in user.interests]
    
    # Return user data
    user_data = user.to_dict()
    user_data['interests'] = interests
    
    return jsonify(user_data), 200


@bp.route('', methods=['PUT'])
@require_auth
def update_profile():
    """
    Update current user's profile.
    Updates name, bio, picture, or interests if provided.
    """
    
    # Get current user
    user = request.current_user
    
    # Get data from request
    data = request.get_json()
    
    # Update name if provided
    if 'name' in data:
        user.name = data['name']
    
    # Update bio if provided
    if 'bio' in data:
        user.bio = data['bio']
    
    # Update profile picture if provided
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    
    # Update interests if provided
    if 'interests' in data:
        # Delete old interests
        UserInterest.query.filter_by(user_id=user.id).delete()
        
        # Add new interests
        for interest_name in data['interests']:
            new_interest = UserInterest(
                user_id=user.id,
                interest_name=interest_name
            )
            db.session.add(new_interest)
    
    # Save changes
    db.session.commit()
    
    # Get updated interests
    interests = [interest.interest_name for interest in user.interests]
    
    # Return updated user data
    user_data = user.to_dict()
    user_data['interests'] = interests
    
    return jsonify(user_data), 200


@bp.route('/onboarding', methods=['POST'])
@require_auth
def complete_onboarding():
    """
    Complete user onboarding.
    Sets up profile after signup with name, bio, picture, and interests.
    """
    
    # Get current user
    user = request.current_user
    
    # Get data from request
    data = request.get_json()
    
    # Update name
    user.name = data.get('name', user.name)
    
    # Update bio
    user.bio = data.get('bio', '')
    
    # Update profile picture
    user.profile_picture = data.get('profile_picture', None)
    
    # Update interests
    UserInterest.query.filter_by(user_id=user.id).delete()
    
    for interest_name in data.get('interests', []):
        new_interest = UserInterest(
            user_id=user.id,
            interest_name=interest_name
        )
        db.session.add(new_interest)
    
    # Save changes
    db.session.commit()
    
    # Get updated interests
    interests = [interest.interest_name for interest in user.interests]
    
    # Return updated user data
    user_data = user.to_dict()
    user_data['interests'] = interests
    
    return jsonify(user_data), 200

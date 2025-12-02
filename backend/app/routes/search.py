"""
Search routes - handles user search and follow functionality.
Uses JSON database.
"""

from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from json_db import (
    get_all_users, get_user_by_id, follow_user, unfollow_user,
    is_following, get_follower_count, get_following_count, get_user_interests
)
from app.utils import require_auth

# Create a blueprint for search routes
bp = Blueprint('search', __name__)


@bp.route('/users', methods=['GET'])
@require_auth
def search_users():
    """
    Search for users by name or email.
    If no query, returns all users.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get search query from URL
    query = request.args.get('q', '').lower()
    
    # Get all users except current user
    all_users = get_all_users(except_user_id=current_user['id'])
    
    # Filter by query if provided
    if query:
        users = [
            u for u in all_users
            if query in u['name'].lower() or query in u['email'].lower()
        ]
    else:
        users = all_users
    
    # Build list of users
    users_list = []
    
    for user in users:
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'bio': user.get('bio', ''),
            'profile_picture': user.get('profile_picture'),
            'is_following': is_following(current_user['id'], user['id']),
            'followers': get_follower_count(user['id']),
            'following': get_following_count(user['id'])
        }
        users_list.append(user_data)
    
    return jsonify(users_list), 200


@bp.route('/follow', methods=['POST'])
@require_auth
def follow_user_route():
    """
    Follow a user.
    Creates a follow relationship.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get user ID to follow
    data = request.get_json()
    user_id = data.get('user_id')
    
    # Create follow relationship
    follow_user(current_user['id'], user_id)
    
    return jsonify({'message': 'User followed'}), 201


@bp.route('/unfollow', methods=['POST'])
@require_auth
def unfollow_user_route():
    """
    Unfollow a user.
    Deletes the follow relationship.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get user ID to unfollow
    data = request.get_json()
    user_id = data.get('user_id')
    
    # Remove follow relationship
    unfollow_user(current_user['id'], user_id)
    
    return jsonify({'message': 'User unfollowed'}), 200


@bp.route('/user/<int:user_id>', methods=['GET'])
@require_auth
def get_user_profile(user_id):
    """
    Get a specific user's public profile.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get the user
    user = get_user_by_id(user_id)
    
    # Check if user exists
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get interests
    interests = get_user_interests(user_id)
    
    # Get user data
    user_data = {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'bio': user.get('bio', ''),
        'profile_picture': user.get('profile_picture'),
        'interests': interests,
        'is_following': is_following(current_user['id'], user_id),
        'followers': get_follower_count(user_id),
        'following': get_following_count(user_id)
    }
    
    return jsonify(user_data), 200

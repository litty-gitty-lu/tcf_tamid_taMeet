"""
Search routes - handles user search and follow functionality.
Simple endpoints to search users and follow/unfollow them.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Follow
from app.utils import require_auth
from sqlalchemy import or_, and_

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
    query = request.args.get('q', '')
    
    # If no query, return all users except current user
    if not query:
        users = User.query.filter(User.id != current_user.id).all()
    else:
        # Search in name and email
        search_pattern = f'%{query}%'
        users = User.query.filter(
            and_(
                User.id != current_user.id,
                or_(
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
        ).all()
    
    # Build list of users
    users_list = []
    
    for user in users:
        user_data = user.to_dict()
        
        # Check if current user is following this user
        follow = Follow.query.filter_by(
            follower_id=current_user.id,
            followed_id=user.id
        ).first()
        
        user_data['is_following'] = follow is not None
        
        # Get follower/following counts
        follower_count = Follow.query.filter_by(followed_id=user.id).count()
        following_count = Follow.query.filter_by(follower_id=user.id).count()
        
        user_data['followers'] = follower_count
        user_data['following'] = following_count
        
        users_list.append(user_data)
    
    return jsonify(users_list), 200


@bp.route('/follow', methods=['POST'])
@require_auth
def follow_user():
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
    new_follow = Follow(
        follower_id=current_user.id,
        followed_id=user_id
    )
    
    # Save to database
    db.session.add(new_follow)
    db.session.commit()
    
    return jsonify({'message': 'User followed'}), 201


@bp.route('/unfollow', methods=['POST'])
@require_auth
def unfollow_user():
    """
    Unfollow a user.
    Deletes the follow relationship.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get user ID to unfollow
    data = request.get_json()
    user_id = data.get('user_id')
    
    # Find and delete follow relationship
    follow = Follow.query.filter_by(
        follower_id=current_user.id,
        followed_id=user_id
    ).first()
    
    db.session.delete(follow)
    db.session.commit()
    
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
    user = User.query.get(user_id)
    
    # Check if user exists
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user data
    user_data = user.to_dict()
    
    # Get interests
    interests = [interest.interest_name for interest in user.interests]
    user_data['interests'] = interests
    
    # Check if current user is following this user
    follow = Follow.query.filter_by(
        follower_id=current_user.id,
        followed_id=user_id
    ).first()
    
    user_data['is_following'] = follow is not None
    
    # Get follower/following counts
    follower_count = Follow.query.filter_by(followed_id=user_id).count()
    following_count = Follow.query.filter_by(follower_id=user_id).count()
    
    user_data['followers'] = follower_count
    user_data['following'] = following_count
    
    return jsonify(user_data), 200

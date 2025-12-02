"""
Match routes - handles matching functionality.
Uses JSON database.
"""

from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from json_db import (
    get_user_by_id, get_all_users, get_user_matches, 
    create_match, archive_match, get_user_interests
)
from app.utils import require_auth

# Create a blueprint for match routes
bp = Blueprint('matches', __name__)


def calculate_match_score(user1, user2):
    """
    Calculate how well two users match.
    Counts shared interests and converts to percentage (0-100).
    """
    
    # Get interests for both users
    user1_interests = set(get_user_interests(user1['id']))
    user2_interests = set(get_user_interests(user2['id']))
    
    # Find shared interests
    shared_interests = user1_interests.intersection(user2_interests)
    
    # Calculate score based on shared interests
    if len(user1_interests) <= len(user2_interests):
        base_count = len(user1_interests)
    else:
        base_count = len(user2_interests)
    
    # Calculate percentage
    if base_count == 0:
        score = 0
    else:
        score = int((len(shared_interests) / base_count) * 100)
    
    return score


@bp.route('/find', methods=['POST'])
@require_auth
def find_match():
    """
    Find a new match for the current user.
    Returns a user that hasn't been matched with yet.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get all users except current user
    all_users = get_all_users(except_user_id=current_user['id'])
    
    # Get existing matches
    existing_matches = get_user_matches(current_user['id'], active_only=True)
    
    # Get IDs of users we've already matched with
    matched_user_ids = set()
    for match in existing_matches:
        if match['user1_id'] == current_user['id']:
            matched_user_ids.add(match['user2_id'])
        else:
            matched_user_ids.add(match['user1_id'])
    
    # Filter out users we've already matched with
    available_users = [user for user in all_users if user['id'] not in matched_user_ids]
    
    # Check if there are any available users
    if not available_users:
        return jsonify({'error': 'No available users to match with'}), 404
    
    # Find the best match based on interests
    best_match = None
    best_score = 0
    
    for user in available_users:
        score = calculate_match_score(current_user, user)
        if score > best_score:
            best_score = score
            best_match = user
    
    # If no good match, just pick first available user
    if not best_match:
        best_match = available_users[0]
        best_score = calculate_match_score(current_user, best_match)
    
    # Return matched user data
    match_data = {
        'id': best_match['id'],
        'email': best_match['email'],
        'name': best_match['name'],
        'bio': best_match.get('bio', ''),
        'profile_picture': best_match.get('profile_picture'),
        'match_score': best_score
    }
    
    return jsonify(match_data), 200


@bp.route('/accept', methods=['POST'])
@require_auth
def accept_match():
    """
    Accept a match with another user.
    Creates a match record in the database.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get data from request
    data = request.get_json()
    matched_user_id = data.get('user_id')
    match_score = data.get('match_score', 0)
    
    # Create match
    new_match = create_match(current_user['id'], matched_user_id, match_score)
    
    return jsonify({'match_id': new_match['id']}), 201


@bp.route('/decline', methods=['POST'])
@require_auth
def decline_match():
    """
    Decline a match.
    Just returns success - we don't store declined matches.
    """
    
    return jsonify({'message': 'Match declined'}), 200


@bp.route('/current', methods=['GET'])
@require_auth
def get_current_matches():
    """
    Get all current (active) matches for the current user.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get all active matches
    matches = get_user_matches(current_user['id'], active_only=True)
    
    # Build list of matches
    matches_list = []
    
    for match in matches:
        # Get the other user in the match
        if match['user1_id'] == current_user['id']:
            other_user = get_user_by_id(match['user2_id'])
        else:
            other_user = get_user_by_id(match['user1_id'])
        
        if other_user:
            # Add match data
            match_data = {
                'id': other_user['id'],
                'email': other_user['email'],
                'name': other_user['name'],
                'bio': other_user.get('bio', ''),
                'profile_picture': other_user.get('profile_picture'),
                'match_id': match['id'],
                'match_score': match.get('match_score', 0),
                'match_date': match.get('created_at', ''),
                'scheduled': False
            }
            matches_list.append(match_data)
    
    return jsonify(matches_list), 200


@bp.route('/archive', methods=['POST'])
@require_auth
def archive_match_route():
    """
    Archive a match (move to past matches).
    """
    
    # Get match ID from request
    data = request.get_json()
    match_id = data.get('match_id')
    
    # Archive it
    match = archive_match(match_id)
    
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    
    return jsonify({'message': 'Match archived'}), 200


@bp.route('/past', methods=['GET'])
@require_auth
def get_past_matches():
    """
    Get all past (archived) matches for the current user.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get all archived matches
    matches = get_user_matches(current_user['id'], active_only=False)
    
    # Filter for archived only
    archived_matches = [m for m in matches if not m.get('is_active', True)]
    
    # Build list of matches
    matches_list = []
    
    for match in archived_matches:
        # Get the other user
        if match['user1_id'] == current_user['id']:
            other_user = get_user_by_id(match['user2_id'])
        else:
            other_user = get_user_by_id(match['user1_id'])
        
        if other_user:
            # Add match data
            match_data = {
                'id': other_user['id'],
                'email': other_user['email'],
                'name': other_user['name'],
                'bio': other_user.get('bio', ''),
                'profile_picture': other_user.get('profile_picture'),
                'match_id': match['id'],
                'archived_date': match.get('archived_at', '')
            }
            matches_list.append(match_data)
    
    return jsonify(matches_list), 200

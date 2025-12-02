"""
Match routes - handles matching functionality.
Simple endpoints to find matches, accept/decline, and view matches.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Match
from app.utils import require_auth
from sqlalchemy import and_, or_

# Create a blueprint for match routes
bp = Blueprint('matches', __name__)


def calculate_match_score(user1, user2):
    """
    Calculate how well two users match.
    Counts shared interests and converts to percentage (0-100).
    """
    
    # Get interests for both users
    user1_interests = set([interest.interest_name for interest in user1.interests])
    user2_interests = set([interest.interest_name for interest in user2.interests])
    
    # Find shared interests
    shared_interests = user1_interests.intersection(user2_interests)
    
    # Calculate score based on shared interests
    # Use the user with fewer interests as the base
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
    all_users = User.query.filter(User.id != current_user.id).all()
    
    # Get all existing matches
    existing_matches = Match.query.filter(
        or_(
            Match.user1_id == current_user.id,
            Match.user2_id == current_user.id
        )
    ).all()
    
    # Get IDs of users we've already matched with
    matched_user_ids = set()
    for match in existing_matches:
        if match.user1_id == current_user.id:
            matched_user_ids.add(match.user2_id)
        else:
            matched_user_ids.add(match.user1_id)
    
    # Filter out users we've already matched with
    available_users = [user for user in all_users if user.id not in matched_user_ids]
    
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
    match_data = best_match.to_dict()
    match_data['match_score'] = best_score
    
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
    
    # Create match (always put smaller ID as user1 to avoid duplicates)
    if current_user.id < matched_user_id:
        user1_id = current_user.id
        user2_id = matched_user_id
    else:
        user1_id = matched_user_id
        user2_id = current_user.id
    
    # Create new match
    new_match = Match(
        user1_id=user1_id,
        user2_id=user2_id,
        user1_accepted=True if user1_id == current_user.id else False,
        user2_accepted=True if user2_id == current_user.id else False,
        match_score=match_score,
        is_active=True
    )
    
    # Save to database
    db.session.add(new_match)
    db.session.commit()
    
    return jsonify({'match_id': new_match.id}), 201


@bp.route('/decline', methods=['POST'])
@require_auth
def decline_match():
    """
    Decline a match.
    Just returns success - we don't store declined matches.
    """
    
    # Just return success
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
    matches = Match.query.filter(
        and_(
            or_(
                Match.user1_id == current_user.id,
                Match.user2_id == current_user.id
            ),
            Match.is_active == True
        )
    ).all()
    
    # Build list of matches
    matches_list = []
    
    for match in matches:
        # Get the other user in the match
        if match.user1_id == current_user.id:
            other_user = User.query.get(match.user2_id)
        else:
            other_user = User.query.get(match.user1_id)
        
        # Add match data
        match_data = other_user.to_dict()
        match_data['match_id'] = match.id
        match_data['match_score'] = match.match_score
        match_data['match_date'] = match.created_at.isoformat()
        match_data['scheduled'] = False
        matches_list.append(match_data)
    
    return jsonify(matches_list), 200


@bp.route('/archive', methods=['POST'])
@require_auth
def archive_match():
    """
    Archive a match (move to past matches).
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get match ID from request
    data = request.get_json()
    match_id = data.get('match_id')
    
    # Find the match
    match = Match.query.get(match_id)
    
    # Archive it
    match.is_active = False
    from datetime import datetime
    match.archived_at = datetime.utcnow()
    
    # Save changes
    db.session.commit()
    
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
    matches = Match.query.filter(
        and_(
            or_(
                Match.user1_id == current_user.id,
                Match.user2_id == current_user.id
            ),
            Match.is_active == False
        )
    ).all()
    
    # Build list of matches
    matches_list = []
    
    for match in matches:
        # Get the other user
        if match.user1_id == current_user.id:
            other_user = User.query.get(match.user2_id)
        else:
            other_user = User.query.get(match.user1_id)
        
        # Add match data
        match_data = other_user.to_dict()
        match_data['match_id'] = match.id
        match_data['archived_date'] = match.archived_at.isoformat()
        matches_list.append(match_data)
    
    return jsonify(matches_list), 200

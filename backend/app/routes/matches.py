"""
Match routes - handles matching functionality.
Uses JSON database.

GET /current: Returns all your active matches 
GET /past: Returns all your archived matches
POST /find: Finds and returns one new potential match for you
POST /accept: Creates a match record when you accept/like someone
POST /decline: Does nothing, just returns success if the match has been delcined
POST /archive: Moves an active match to past matches (sets is_active=False)

The Matching Algorithm: 

Gets all users except the current and anyone already matched with
For each available user, calculates a compatibility score based on shared interests only
works with the lowest of the two 
The score formula: (shared interests / smaller interest count) × 100

Example: You have 4 interests, they have 3, you share 2 → (2/3) × 100 = 67%


Returns the user with the highest score as your match

The matching algorithm prioritizes people with similar interests, calculating a 
compatibility score from 0-100% based on how many interests they share.
"""

from flask import Blueprint, request, jsonify
import sys
import os
# Path manipulation to import from parent directory since json_db is in backend/
# and this file is in backend/app/routes/
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from json_db import (
    get_user_by_id, get_all_users, get_user_matches, 
    create_match, archive_match, get_user_interests
)
from app.utils import require_auth

# Create a blueprint for match routes - groups all matching-related endpoints together
# When registered in main app, all these routes will be prefixed (like /api/matches)
bp = Blueprint('matches', __name__)

def calculate_match_score(user1, user2):
    """
    Calculate how well two users match based on shared interests.
    
    The algorithm works by finding common interests and calculating what percentage
    of interests they share. We use the person with FEWER interests as the base
    to avoid penalizing people who have many interests.
    
    Example: 
    - User A likes: ['hiking', 'cooking', 'music'] (3 interests)
    - User B likes: ['hiking', 'music', 'reading', 'gaming', 'art'] (5 interests)
    - Shared: ['hiking', 'music'] (2 interests)
    - Score: 2/3 = 66% (using User A's count as base since it's smaller)
    
    Returns: Integer from 0-100 representing match percentage
    """
    
    # Convert lists to sets for efficient comparison
    # Sets allow us to use intersection() to find common elements quickly
    user1_interests = set(get_user_interests(user1['id']))
    user2_interests = set(get_user_interests(user2['id']))
    
    # Find shared interests using set intersection
    # This gives us all interests that appear in BOTH sets
    shared_interests = user1_interests.intersection(user2_interests)
    
    # Choose the smaller set as our base for percentage calculation
    # This prevents unfair scoring - if someone has 20 interests and shares 3,
    # that's still a good match for someone who only has 3 interests total
    if len(user1_interests) <= len(user2_interests):
        base_count = len(user1_interests)
    else:
        base_count = len(user2_interests)
    
    # Calculate percentage, handling edge case where someone has no interests
    if base_count == 0:
        score = 0
    else:
        # Convert to percentage and round to integer
        # Example: 2 shared / 3 total = 0.666... = 66%
        score = int((len(shared_interests) / base_count) * 100)
    
    return score


@bp.route('/find', methods=['POST'])
@require_auth
def find_match():
    """
    Find a new match for the current user.
    
    This is the main matching endpoint - it finds the most compatible person
    that the user hasn't been matched with yet.
    
    Process:
    1. Get all users except yourself
    2. Filter out people you're already matched with
    3. Calculate compatibility scores with everyone remaining
    4. Return the highest scoring match
    
    POST because this is an action (finding) not just retrieving data
    Each call might return different results as new users join
    """
    
    # Get the authenticated user from the request
    # This was added by @require_auth decorator
    current_user = request.current_user
    
    # Get all users except yourself (can't match with yourself!)
    all_users = get_all_users(except_user_id=current_user['id'])
    
    # Get all your current active matches (not archived ones)
    # active_only=True means we ignore past/archived matches
    existing_matches = get_user_matches(current_user['id'], active_only=True)
    
    # Build a set of user IDs we're already matched with
    # We need to check both user1_id and user2_id because we could be either one
    matched_user_ids = set()
    for match in existing_matches:
        # If we're user1 in this match, the other person is user2
        if match['user1_id'] == current_user['id']:
            matched_user_ids.add(match['user2_id'])
        # If we're user2 in this match, the other person is user1
        else:
            matched_user_ids.add(match['user1_id'])
    
    # Filter out users we're already matched with using list comprehension
    # This gives us only "fresh" users we haven't connected with yet
    available_users = [user for user in all_users if user['id'] not in matched_user_ids]
    
    # Handle edge case: what if everyone is already matched?
    if not available_users:
        # Return 404 (Not Found) since there's no match resource available
        return jsonify({'error': 'No available users to match with'}), 404
    
    # Find the best match by checking compatibility with each available user
    # This is a classic "find the maximum" algorithm
    best_match = None  # Will store the user object of best match
    best_score = 0     # Will store their compatibility score
    
    # Loop through all available users and calculate scores
    for user in available_users:
        score = calculate_match_score(current_user, user)
        # If this user has a higher score than our current best, update
        if score > best_score:
            best_score = score
            best_match = user
    
    # Fallback: if no one has common interests (all scores are 0),
    # just pick the first available user so user always gets someone
    if not best_match:
        best_match = available_users[0]
        # Still calculate their score (will be 0) for consistency
        best_score = calculate_match_score(current_user, best_match)
    
    # Build the response with the matched user's data
    # We send all their public info plus the calculated match score
    match_data = {
        'id': best_match['id'],
        'email': best_match['email'],
        'name': best_match['name'],
        'bio': best_match.get('bio', ''),  # Default to empty string if no bio
        'profile_picture': best_match.get('profile_picture'),  # None if no picture
        'match_score': best_score  # The calculated compatibility percentage
    }
    
    # Return 200 (OK) with the match data
    return jsonify(match_data), 200


@bp.route('/accept', methods=['POST'])
@require_auth
def accept_match():
    """
    Accept a match with another user - like swiping right!
    
    This creates a permanent match record in the database, connecting
    the two users. Once accepted, they appear in each other's matches list.
    
    Frontend sends:
    - user_id: ID of the person being accepted
    - match_score: The compatibility score (so we don't recalculate)
    
    POST because we're creating a new resource (the match record)
    """
    
    # Get the authenticated user
    current_user = request.current_user
    
    # Extract data from request body
    data = request.get_json()
    matched_user_id = data.get('user_id')  # ID of person they're accepting
    match_score = data.get('match_score', 0)  # Their compatibility score, default 0
    
    # Create the match record in database
    # This function handles making the connection bidirectional
    new_match = create_match(current_user['id'], matched_user_id, match_score)
    
    # Return 201 (Created) since we made a new resource
    # Include the match ID so frontend can reference it later
    return jsonify({'match_id': new_match['id']}), 201


@bp.route('/decline', methods=['POST'])
@require_auth
def decline_match():
    """
    Decline a match - like swiping left.
    
    Interestingly, we DON'T store declined matches. This means:
    - Database stays smaller (no "rejection" records)
    - Users might see the same person again later
    - People get second chances if interests change
    - More privacy-friendly (no permanent rejection list)
    
    POST because it's an action, even though we don't store anything
    """
    
    # Just return success - we don't actually do anything with declines
    return jsonify({'message': 'Match declined'}), 200


@bp.route('/current', methods=['GET'])
@require_auth
def get_current_matches():
    """
    Get all current (active) matches for the logged-in user.
    
    These are people you've matched with but haven't archived yet.
    Think of it as your "active connections" list - people you might
    want to meet or are currently engaging with.
    
    Returns detailed info about each match including when you matched
    and your compatibility score.
    
    GET because we're just retrieving existing data
    """
    
    # Get the authenticated user
    current_user = request.current_user
    
    # Get all active matches (not archived ones)
    # active_only=True filters out past/archived matches
    matches = get_user_matches(current_user['id'], active_only=True)
    
    # Build the response list with details about each match
    matches_list = []
    
    # Loop through each match record
    for match in matches:
        # Figure out who the OTHER person in this match is
        # Match records have user1_id and user2_id - we need the one that's NOT us
        if match['user1_id'] == current_user['id']:
            # We're user1, so get user2
            other_user = get_user_by_id(match['user2_id'])
        else:
            # We're user2, so get user1
            other_user = get_user_by_id(match['user1_id'])
        
        # Only add to list if user still exists (handles deleted accounts)
        if other_user:
            # Build match data combining user info + match metadata
            match_data = {
                # User's basic information
                'id': other_user['id'],
                'email': other_user['email'],
                'name': other_user['name'],
                'bio': other_user.get('bio', ''),
                'profile_picture': other_user.get('profile_picture'),
                
                # Match-specific information
                'match_id': match['id'],  # Important! Used for notes, archiving, etc.
                'match_score': match.get('match_score', 0),  # Compatibility percentage
                'match_date': match.get('created_at', ''),  # When you matched
                'scheduled': False  # Placeholder for future scheduling feature
            }
            matches_list.append(match_data)
    
    # Return the list with 200 (OK) status
    return jsonify(matches_list), 200


@bp.route('/archive', methods=['POST'])
@require_auth
def archive_match_route():
    """
    Archive a match - move it from current to past matches.
    
    Use this when:
    - You've already met the person
    - You want to clear your active list
    - The connection is no longer relevant
    
    Archiving doesn't delete the match, just marks it as inactive.
    You can still see it in your past matches history.
    
    POST because we're modifying the match state
    """
    
    # Get the match ID from request body
    # Note: this is the MATCH ID, not the user ID!
    data = request.get_json()
    match_id = data.get('match_id')
    
    # Archive the match (sets is_active=False and archived_at timestamp)
    match = archive_match(match_id)
    
    # Handle case where match ID doesn't exist
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    
    # Return success message with 200 (OK)
    return jsonify({'message': 'Match archived'}), 200


@bp.route('/past', methods=['GET'])
@require_auth
def get_past_matches():
    """
    Get all past (archived) matches for the current user.
    
    This is your "history" - people you've already met or connections
    that are no longer active. Useful for:
    - Remembering who you've networked with
    - Reviewing past connections
    - Seeing your networking history
    
    GET because we're retrieving existing archived data
    """
    
    # Get the authenticated user
    current_user = request.current_user
    
    # Get ALL matches including archived ones
    # active_only=False means we get both active AND inactive matches
    matches = get_user_matches(current_user['id'], active_only=False)
    
    # Filter to get ONLY the archived (inactive) matches
    # The .get('is_active', True) handles old data that might not have this field
    # If is_active doesn't exist, we assume it's active (True), so 'not True' = False
    archived_matches = [m for m in matches if not m.get('is_active', True)]
    
    # Build the response list with archived match details
    matches_list = []
    
    # Loop through each archived match
    for match in archived_matches:
        # Same logic as current matches - figure out who the other person is
        if match['user1_id'] == current_user['id']:
            other_user = get_user_by_id(match['user2_id'])
        else:
            other_user = get_user_by_id(match['user1_id'])
        
        # Only add if user still exists
        if other_user:
            # Build match data - similar to current but with archived_date
            match_data = {
                'id': other_user['id'],
                'email': other_user['email'],
                'name': other_user['name'],
                'bio': other_user.get('bio', ''),
                'profile_picture': other_user.get('profile_picture'),
                'match_id': match['id'],
                'archived_date': match.get('archived_at', '')  # When it was archived
                # Note: no match_score or match_date here - keeping response lighter
            }
            matches_list.append(match_data)
    
    # Return the list with 200 (OK) status
    return jsonify(matches_list), 200
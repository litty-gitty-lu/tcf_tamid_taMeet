"""
handles all the matching notes from the users, it is like a journal where 
you can keep notes of the people, as these notes are private to each user. 
Has a get request to get the match id and get the current match note
has a post request to create to the match note / edit it 
has a delete request to delete a match note
"""

# imports flask components:
# blueprint for organizing routes
# request to access the incoming data 
# jsonify to turn python dictionaries to json

from flask import Blueprint, request, jsonify
import sys
import os
# modifying the path to find the json_db module that contains all the helper functions
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from json_db import get_match_note, save_match_note, delete_match_note
# imports the util function that makes sure the user is authenticated
from app.utils import require_auth

# Create a blueprint named notes to group related components together
bp = Blueprint('notes', __name__)

# get request that checks if the user is authenticated
@bp.route('/match/<int:match_id>', methods=['GET'])
@require_auth
# function that recieves the match_id and gets the match notes
# returns the match notes for the user 
def get_match_notes(match_id):
    """
    Get notes for a specific match.
    Returns empty string if no notes exist.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Find note for this match and user
    note = get_match_note(match_id, current_user['id'])
    
    # Return note text or empty string
    if note:
        return jsonify({'note': note['note_text']}), 200
    else:
        return jsonify({'note': ''}), 200


@bp.route('/match/<int:match_id>', methods=['POST'])
@require_auth
# function to create or uopdate the match notes
def create_or_update_match_note(match_id):
    """
    Create or update a note for a match.
    If note exists, updates it. If not, creates a new one.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Get note text from request
    data = request.get_json()
    note_text = data.get('note', '')
    
    # Save note
    save_match_note(match_id, current_user['id'], note_text)
    
    return jsonify({'message': 'Note saved'}), 200


@bp.route('/match/<int:match_id>', methods=['DELETE'])
@require_auth
# deletes the match notes
def delete_match_note_route(match_id):
    """
    Delete a note for a match.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Delete the note
    delete_match_note(match_id, current_user['id'])
    
    return jsonify({'message': 'Note deleted'}), 200

"""
Match notes routes - handles notes about matches.
Uses JSON database.
"""

from flask import Blueprint, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from json_db import get_match_note, save_match_note, delete_match_note
from app.utils import require_auth

# Create a blueprint for notes routes
bp = Blueprint('notes', __name__)


@bp.route('/match/<int:match_id>', methods=['GET'])
@require_auth
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
def delete_match_note_route(match_id):
    """
    Delete a note for a match.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Delete the note
    delete_match_note(match_id, current_user['id'])
    
    return jsonify({'message': 'Note deleted'}), 200

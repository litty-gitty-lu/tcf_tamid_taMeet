"""
Match notes routes - handles notes about matches.
Simple endpoints to add, view, and update notes.
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models import Match, MatchNote
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
    note = MatchNote.query.filter_by(
        match_id=match_id,
        user_id=current_user.id
    ).first()
    
    # Return note text or empty string
    if note:
        return jsonify({'note': note.note_text}), 200
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
    
    # Find existing note
    existing_note = MatchNote.query.filter_by(
        match_id=match_id,
        user_id=current_user.id
    ).first()
    
    if existing_note:
        # Update existing note
        existing_note.note_text = note_text
        db.session.commit()
    else:
        # Create new note
        new_note = MatchNote(
            match_id=match_id,
            user_id=current_user.id,
            note_text=note_text
        )
        db.session.add(new_note)
        db.session.commit()
    
    return jsonify({'message': 'Note saved'}), 200


@bp.route('/match/<int:match_id>', methods=['DELETE'])
@require_auth
def delete_match_note(match_id):
    """
    Delete a note for a match.
    """
    
    # Get current user
    current_user = request.current_user
    
    # Find the note
    note = MatchNote.query.filter_by(
        match_id=match_id,
        user_id=current_user.id
    ).first()
    
    # Check if note exists
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    # Delete the note
    db.session.delete(note)
    db.session.commit()
    
    return jsonify({'message': 'Note deleted'}), 200

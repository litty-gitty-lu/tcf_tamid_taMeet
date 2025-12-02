"""
Simple JSON database - stores all data in a JSON file.
Much simpler than SQLite for development!
"""

import json
import os
import bcrypt
from datetime import datetime

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password, password_hash):
    """Check if password matches hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

DB_FILE = 'database.json'

def load_db():
    """Load database from JSON file"""
    if not os.path.exists(DB_FILE):
        # Initialize empty database
        return {
            "users": [],
            "interests": [],
            "matches": [],
            "follows": [],
            "notes": []
        }
    
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    """Save database to JSON file"""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_next_id(items):
    """Get next ID for a list of items"""
    if not items:
        return 1
    return max(item.get('id', 0) for item in items) + 1

# User functions
def get_user_by_email(email):
    """Get user by email"""
    db = load_db()
    for user in db['users']:
        if user['email'] == email:
            return user
    return None

def get_user_by_id(user_id):
    """Get user by ID"""
    db = load_db()
    for user in db['users']:
        if user['id'] == user_id:
            return user
    return None

def create_user(email, password, name, bio='', profile_picture=None):
    """Create a new user"""
    db = load_db()
    
    # Check if user already exists
    if get_user_by_email(email):
        return None
    
    # Create user
    new_user = {
        'id': get_next_id(db['users']),
        'email': email,
        'password_hash': hash_password(password),
        'name': name,
        'bio': bio,
        'profile_picture': profile_picture,
        'created_at': datetime.utcnow().isoformat()
    }
    
    db['users'].append(new_user)
    save_db(db)
    
    # Automatically create match with Maddie
    maddie = get_user_by_email('maddie.cush@northeastern.edu')
    if maddie and maddie['id'] != new_user['id']:
        create_match(new_user['id'], maddie['id'], 95)
    
    return new_user

def verify_user(email, password):
    """Verify user login"""
    user = get_user_by_email(email)
    if not user:
        return None
    
    if check_password(password, user['password_hash']):
        return user
    return None

def update_user(user_id, **kwargs):
    """Update user fields"""
    db = load_db()
    for user in db['users']:
        if user['id'] == user_id:
            for key, value in kwargs.items():
                if key != 'id' and key != 'email':
                    user[key] = value
            save_db(db)
            return user
    return None

def get_user_interests(user_id):
    """Get interests for a user"""
    db = load_db()
    return [i['interest_name'] for i in db['interests'] if i['user_id'] == user_id]

def set_user_interests(user_id, interests):
    """Set interests for a user"""
    db = load_db()
    # Remove old interests
    db['interests'] = [i for i in db['interests'] if i['user_id'] != user_id]
    # Add new interests
    for interest_name in interests:
        db['interests'].append({
            'user_id': user_id,
            'interest_name': interest_name
        })
    save_db(db)

# Match functions
def create_match(user1_id, user2_id, match_score=0):
    """Create a match between two users"""
    db = load_db()
    
    # Check if match already exists
    for match in db['matches']:
        if (match['user1_id'] == user1_id and match['user2_id'] == user2_id) or \
           (match['user1_id'] == user2_id and match['user2_id'] == user1_id):
            return match
    
    # Create new match
    new_match = {
        'id': get_next_id(db['matches']),
        'user1_id': min(user1_id, user2_id),
        'user2_id': max(user1_id, user2_id),
        'user1_accepted': True,
        'user2_accepted': True,
        'match_score': match_score,
        'is_active': True,
        'created_at': datetime.utcnow().isoformat(),
        'archived_at': None
    }
    
    db['matches'].append(new_match)
    save_db(db)
    return new_match

def get_user_matches(user_id, active_only=True):
    """Get all matches for a user"""
    db = load_db()
    matches = []
    
    for match in db['matches']:
        if match['user1_id'] == user_id or match['user2_id'] == user_id:
            if not active_only or match['is_active']:
                matches.append(match)
    
    return matches

def archive_match(match_id):
    """Archive a match"""
    db = load_db()
    for match in db['matches']:
        if match['id'] == match_id:
            match['is_active'] = False
            match['archived_at'] = datetime.utcnow().isoformat()
            save_db(db)
            return match
    return None

def get_all_users(except_user_id=None):
    """Get all users except specified one"""
    db = load_db()
    users = db['users'].copy()
    if except_user_id:
        users = [u for u in users if u['id'] != except_user_id]
    return users

# Follow functions
def follow_user(follower_id, followed_id):
    """Create follow relationship"""
    db = load_db()
    
    # Check if already following
    for follow in db['follows']:
        if follow['follower_id'] == follower_id and follow['followed_id'] == followed_id:
            return follow
    
    new_follow = {
        'id': get_next_id(db['follows']),
        'follower_id': follower_id,
        'followed_id': followed_id,
        'created_at': datetime.utcnow().isoformat()
    }
    
    db['follows'].append(new_follow)
    save_db(db)
    return new_follow

def unfollow_user(follower_id, followed_id):
    """Remove follow relationship"""
    db = load_db()
    db['follows'] = [f for f in db['follows'] 
                     if not (f['follower_id'] == follower_id and f['followed_id'] == followed_id)]
    save_db(db)

def is_following(follower_id, followed_id):
    """Check if user is following another"""
    db = load_db()
    for follow in db['follows']:
        if follow['follower_id'] == follower_id and follow['followed_id'] == followed_id:
            return True
    return False

def get_follower_count(user_id):
    """Get number of followers"""
    db = load_db()
    return len([f for f in db['follows'] if f['followed_id'] == user_id])

def get_following_count(user_id):
    """Get number of users following"""
    db = load_db()
    return len([f for f in db['follows'] if f['follower_id'] == user_id])

# Notes functions
def get_match_note(match_id, user_id):
    """Get note for a match"""
    db = load_db()
    for note in db['notes']:
        if note['match_id'] == match_id and note['user_id'] == user_id:
            return note
    return None

def save_match_note(match_id, user_id, note_text):
    """Save or update note for a match"""
    db = load_db()
    
    # Find existing note
    for note in db['notes']:
        if note['match_id'] == match_id and note['user_id'] == user_id:
            note['note_text'] = note_text
            note['updated_at'] = datetime.utcnow().isoformat()
            save_db(db)
            return note
    
    # Create new note
    new_note = {
        'id': get_next_id(db['notes']),
        'match_id': match_id,
        'user_id': user_id,
        'note_text': note_text,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    db['notes'].append(new_note)
    save_db(db)
    return new_note

def delete_match_note(match_id, user_id):
    """Delete note for a match"""
    db = load_db()
    db['notes'] = [n for n in db['notes'] 
                   if not (n['match_id'] == match_id and n['user_id'] == user_id)]
    save_db(db)


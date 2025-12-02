"""
Database models - these define the structure of our database tables.
Each class represents a table, and each attribute represents a column.
"""

from app import db
from datetime import datetime

class User(db.Model):
    """
    User model - stores information about each user in the app.
    This is like a table in a spreadsheet with columns for each piece of info.
    """
    
    # Table name in database
    __tablename__ = 'users'
    
    # Primary key - unique ID for each user
    id = db.Column(db.Integer, primary_key=True)
    
    # User's email - must be unique (no two users can have same email)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Hashed password - we never store plain text passwords!
    password_hash = db.Column(db.String(255), nullable=False)
    
    # User's name
    name = db.Column(db.String(100), nullable=False)
    
    # User's bio/description
    bio = db.Column(db.Text, nullable=True)
    
    # Profile picture URL or file path
    profile_picture = db.Column(db.String(255), nullable=True)
    
    # When the user account was created
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # When the user last updated their profile
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to interests - one user can have many interests
    interests = db.relationship('UserInterest', backref='user', lazy=True, cascade='all, delete-orphan')
    
    # Relationship to matches where this user is user1
    matches_as_user1 = db.relationship('Match', foreign_keys='Match.user1_id', backref='user1', lazy=True)
    
    # Relationship to matches where this user is user2
    matches_as_user2 = db.relationship('Match', foreign_keys='Match.user2_id', backref='user2', lazy=True)
    
    # Relationship to follows where this user is the follower
    following = db.relationship('Follow', foreign_keys='Follow.follower_id', backref='follower', lazy=True)
    
    # Relationship to follows where this user is being followed
    followers = db.relationship('Follow', foreign_keys='Follow.followed_id', backref='followed', lazy=True)
    
    def to_dict(self):
        """
        Convert user object to dictionary so we can send it as JSON to frontend.
        This makes it easy to return user data in API responses.
        """
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'bio': self.bio,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'interests': [interest.interest_name for interest in self.interests]
        }


class Interest(db.Model):
    """
    Interest model - stores all available interests users can select.
    This is like a master list of all possible interests.
    """
    
    __tablename__ = 'interests'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Name of the interest (e.g., "Product Management", "Software Engineering")
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    # When this interest was added to the system
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserInterest(db.Model):
    """
    UserInterest model - links users to their interests.
    This is a "join table" - it connects users and interests.
    One user can have many interests, and one interest can belong to many users.
    """
    
    __tablename__ = 'user_interests'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Which user this interest belongs to
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # The name of the interest (we store it as text for simplicity)
    interest_name = db.Column(db.String(100), nullable=False)
    
    # When the user added this interest
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Match(db.Model):
    """
    Match model - stores matches between two users.
    When two users match, we create a record here.
    """
    
    __tablename__ = 'matches'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # First user in the match
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Second user in the match
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Whether user1 has accepted the match
    user1_accepted = db.Column(db.Boolean, default=False)
    
    # Whether user2 has accepted the match
    user2_accepted = db.Column(db.Boolean, default=False)
    
    # Whether the match is active (not archived)
    is_active = db.Column(db.Boolean, default=True)
    
    # Match score (0-100) - how well they matched
    match_score = db.Column(db.Integer, nullable=True)
    
    # When the match was created
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # When the match was archived (moved to past matches)
    archived_at = db.Column(db.DateTime, nullable=True)
    
    # Make sure we can't have duplicate matches between same two users
    __table_args__ = (db.UniqueConstraint('user1_id', 'user2_id', name='unique_match'),)


class MatchNote(db.Model):
    """
    MatchNote model - stores notes users write about their matches.
    Users can add personal notes to remember things about each match.
    """
    
    __tablename__ = 'match_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Which match this note belongs to
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    
    # Which user wrote this note
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # The actual note text
    note_text = db.Column(db.Text, nullable=False)
    
    # When the note was created
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # When the note was last updated
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to match
    match = db.relationship('Match', backref='notes')


class Follow(db.Model):
    """
    Follow model - stores follow relationships between users.
    When user A follows user B, we create a record here.
    """
    
    __tablename__ = 'follows'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # User who is doing the following
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # User who is being followed
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # When the follow relationship was created
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Make sure a user can't follow the same person twice
    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_id', name='unique_follow'),)


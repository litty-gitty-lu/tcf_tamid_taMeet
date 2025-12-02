"""
This file initializes the Flask application.
It sets up the database, CORS (so React can talk to Flask), and registers all our routes.
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

# Create database object - we'll use this to define our database models
db = SQLAlchemy()

def create_app():
    """
    Creates and configures the Flask application.
    This is a factory function - it creates the app when called.
    """
    
    # Create Flask app instance
    app = Flask(__name__)
    
    # Load configuration from config.py
    app.config.from_object(Config)
    
    # Initialize database with our app
    db.init_app(app)
    
    # Enable CORS - this allows our React frontend (localhost:3000) to make requests
    # to our Flask backend (localhost:5000)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    
    # Import models first to ensure they're registered with db
    from app import models
    
    # Import and register our route blueprints
    # Blueprints organize our routes into separate files
    from app.routes import auth, profile, matches, search, notes
    
    # Register each blueprint with a URL prefix
    # All auth routes will be at /api/auth/*
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    
    # All profile routes will be at /api/profile
    app.register_blueprint(profile.bp, url_prefix='/api/profile')
    
    # All match routes will be at /api/matches
    app.register_blueprint(matches.bp, url_prefix='/api/matches')
    
    # All search routes will be at /api/search
    app.register_blueprint(search.bp, url_prefix='/api/search')
    
    # All notes routes will be at /api/notes
    app.register_blueprint(notes.bp, url_prefix='/api/notes')
    
    # Create database tables when app starts (only if they don't exist)
    with app.app_context():
        db.create_all()
    
    return app


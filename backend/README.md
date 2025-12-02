# TaMeet Backend

Simple Flask backend for the TaMeet matching application.

## Setup Instructions

1. **Create a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create a `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and change the `SECRET_KEY` to something random and secure.

4. **Run the application**:
   ```bash
   python run.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login and get authentication token

### Profile
- `GET /api/profile` - Get current user's profile (requires auth)
- `PUT /api/profile` - Update current user's profile (requires auth)
- `POST /api/profile/onboarding` - Complete onboarding (requires auth)

### Matches
- `POST /api/matches/find` - Find a new match (requires auth)
- `POST /api/matches/accept` - Accept a match (requires auth)
- `POST /api/matches/decline` - Decline a match (requires auth)
- `GET /api/matches/current` - Get current matches (requires auth)
- `POST /api/matches/archive` - Archive a match (requires auth)
- `GET /api/matches/past` - Get past matches (requires auth)

### Search
- `GET /api/search/users?q=query` - Search for users (requires auth)
- `POST /api/search/follow` - Follow a user (requires auth)
- `POST /api/search/unfollow` - Unfollow a user (requires auth)
- `GET /api/search/user/<user_id>` - Get user profile (requires auth)

### Notes
- `GET /api/notes/match/<match_id>` - Get notes for a match (requires auth)
- `POST /api/notes/match/<match_id>` - Create/update notes (requires auth)
- `DELETE /api/notes/match/<match_id>` - Delete notes (requires auth)

## Database

The app uses SQLite by default (a simple file-based database). The database file will be created automatically as `tameet.db` in the backend directory.

## Authentication

Most endpoints require authentication. Include the JWT token in the request header:
```
Authorization: Bearer <your-token-here>
```


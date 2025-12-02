# Complete Backend Explanation

This document explains the entire backend in simple terms. Everything is straightforward and easy to understand.

## What is the Backend?

The backend is a Flask server that provides API endpoints. Your React frontend calls these endpoints to:
- Create user accounts
- Log users in
- Store and retrieve user data
- Find matches between users
- Handle search and follow functionality
- Store notes about matches

Think of it like a waiter in a restaurant - the frontend (customer) asks for something, and the backend (waiter) brings it from the kitchen (database).

---

## File Structure

```
backend/
├── app/
│   ├── __init__.py          # Sets up Flask app
│   ├── models.py            # Database tables
│   ├── utils.py             # Helper functions
│   └── routes/
│       ├── auth.py          # Signup and login
│       ├── profile.py        # User profiles
│       ├── matches.py        # Matching system
│       ├── search.py         # Search and follow
│       └── notes.py          # Match notes
├── config.py                # Settings
├── run.py                   # Start the server
└── requirements.txt        # Python packages needed
```

---

## 1. config.py - Settings

**What it does:**
Stores all the settings our app needs.

**Key settings:**
- `SECRET_KEY`: Used to create secure tokens (like a password for the app)
- `SQLALCHEMY_DATABASE_URI`: Where to store the database file
- SQLite database: Simple file-based database (no setup needed)

**Why:**
Keeps all settings in one place so we can easily change them.

---

## 2. app/__init__.py - App Setup

**What it does:**
Creates the Flask application and sets everything up.

**What happens:**
1. Creates Flask app
2. Connects to database
3. Enables CORS (allows React to talk to Flask)
4. Registers all route files
5. Creates database tables

**Why:**
This is where everything gets connected together when the app starts.

---

## 3. app/models.py - Database Tables

**What it does:**
Defines the structure of our database tables. Each class is a table, each attribute is a column.

**Tables:**

### User Table
Stores user information:
- id (unique number)
- email
- password_hash (hashed password, never plain text)
- name
- bio
- profile_picture
- created_at (when account was created)

### UserInterest Table
Links users to their interests:
- user_id (which user)
- interest_name (which interest)

### Match Table
Stores matches between users:
- user1_id (first user)
- user2_id (second user)
- user1_accepted (did user1 accept?)
- user2_accepted (did user2 accept?)
- match_score (how well they match, 0-100)
- is_active (current match or past match?)

### MatchNote Table
Stores notes users write about matches:
- match_id (which match)
- user_id (which user wrote it)
- note_text (the actual note)

### Follow Table
Stores follow relationships:
- follower_id (who is following)
- followed_id (who is being followed)

**Why:**
These tables organize all our data. When we need to save or retrieve information, we use these tables.

---

## 4. app/utils.py - Helper Functions

**What it does:**
Contains functions used throughout the app.

### hash_password(password)
- Takes a plain text password
- Hashes it using bcrypt
- Returns the hashed password
- **Why:** We never store plain text passwords for security

### check_password(password, password_hash)
- Takes a plain text password and a hashed password
- Checks if they match
- Returns True or False
- **Why:** Used during login to verify passwords

### generate_token(user_id)
- Takes a user ID
- Creates a JWT token (like a temporary ID card)
- Token expires in 7 days
- **Why:** Used to verify users are logged in

### verify_token(token)
- Takes a token
- Extracts the user ID from it
- Returns the user ID
- **Why:** Used to check if a user is logged in

### @require_auth (Decorator)
- A decorator that protects routes
- Checks if user has a valid token
- If valid, adds `request.current_user` so routes can access the logged-in user
- **Why:** Makes it easy to protect routes that need login

---

## 5. app/routes/auth.py - Signup and Login

**What it does:**
Handles creating accounts and logging users in.

### POST /api/auth/signup
**What it does:**
Creates a new user account.

**How it works:**
1. Gets email, password, and name from request
2. Hashes the password
3. Creates a new User in database
4. Generates an authentication token
5. Returns user data and token

**Example request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Example response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### POST /api/auth/login
**What it does:**
Logs a user in.

**How it works:**
1. Gets email and password from request
2. Finds user by email
3. Checks if password is correct
4. Generates a token
5. Returns user data and token

**Example request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Example response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 6. app/routes/profile.py - User Profiles

**What it does:**
Handles viewing and updating user profiles.

### GET /api/profile
**What it does:**
Gets the current user's profile.

**How it works:**
1. Gets current user from token
2. Gets user's interests
3. Returns user data with interests

**Example response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "bio": "I love coding!",
  "interests": ["Software Engineering", "Product Management"]
}
```

### PUT /api/profile
**What it does:**
Updates the current user's profile.

**How it works:**
1. Gets current user
2. Gets update data from request
3. Updates name, bio, picture, or interests if provided
4. Saves changes to database
5. Returns updated user data

**Example request:**
```json
{
  "name": "John Smith",
  "bio": "Updated bio",
  "interests": ["New Interest"]
}
```

### POST /api/profile/onboarding
**What it does:**
Completes user onboarding after signup.

**How it works:**
1. Gets current user
2. Gets onboarding data (name, bio, picture, interests)
3. Updates user with this data
4. Saves to database
5. Returns updated user data

**Example request:**
```json
{
  "name": "John Doe",
  "bio": "My bio",
  "profile_picture": "url_to_picture",
  "interests": ["Interest 1", "Interest 2"]
}
```

---

## 7. app/routes/matches.py - Matching System

**What it does:**
Handles finding matches, accepting/declining, and viewing matches.

### calculate_match_score(user1, user2)
**What it does:**
Calculates how well two users match based on shared interests.

**How it works:**
1. Gets interests for both users
2. Finds shared interests
3. Calculates percentage: (shared interests / total interests) × 100
4. Returns score from 0 to 100

**Example:**
- User 1 has: ["A", "B", "C"]
- User 2 has: ["A", "B", "D"]
- Shared: ["A", "B"] = 2 interests
- Score: (2 / 3) × 100 = 66%

### POST /api/matches/find
**What it does:**
Finds a new match for the current user.

**How it works:**
1. Gets current user
2. Gets all users except current user
3. Gets all existing matches
4. Filters out users already matched with
5. Calculates match score for each available user
6. Returns the user with highest match score

**Example response:**
```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "match_score": 85
}
```

### POST /api/matches/accept
**What it does:**
Accepts a match with another user.

**How it works:**
1. Gets current user
2. Gets matched user ID and match score from request
3. Creates a new Match record in database
4. Returns match ID

**Example request:**
```json
{
  "user_id": 2,
  "match_score": 85
}
```

### POST /api/matches/decline
**What it does:**
Declines a match (doesn't create a match record).

**How it works:**
1. Just returns success message
2. Doesn't store anything (we don't track declined matches)

### GET /api/matches/current
**What it does:**
Gets all current (active) matches for the user.

**How it works:**
1. Gets current user
2. Finds all active matches where user is involved
3. For each match, gets the other user's data
4. Returns list of matches with user data

**Example response:**
```json
[
  {
    "id": 2,
    "name": "Jane Doe",
    "match_id": 1,
    "match_score": 85,
    "match_date": "2024-12-01T10:00:00"
  }
]
```

### POST /api/matches/archive
**What it does:**
Archives a match (moves it to past matches).

**How it works:**
1. Gets current user
2. Gets match ID from request
3. Finds the match
4. Sets is_active to False
5. Records when it was archived
6. Saves to database

**Example request:**
```json
{
  "match_id": 1
}
```

### GET /api/matches/past
**What it does:**
Gets all past (archived) matches for the user.

**How it works:**
1. Gets current user
2. Finds all archived matches
3. Returns list of past matches

---

## 8. app/routes/search.py - Search and Follow

**What it does:**
Handles searching for users and following/unfollowing them.

### GET /api/search/users?q=query
**What it does:**
Searches for users by name or email.

**How it works:**
1. Gets current user
2. Gets search query from URL
3. If no query, returns all users
4. If query exists, searches in name and email
5. For each user, checks if current user is following them
6. Gets follower/following counts
7. Returns list of users

**Example:**
- `/api/search/users?q=john` - searches for "john" in names and emails
- `/api/search/users` - returns all users

**Example response:**
```json
[
  {
    "id": 2,
    "name": "John Smith",
    "email": "john@example.com",
    "is_following": false,
    "followers": 10,
    "following": 5
  }
]
```

### POST /api/search/follow
**What it does:**
Follows a user.

**How it works:**
1. Gets current user
2. Gets user ID to follow from request
3. Creates a Follow record in database
4. Saves to database

**Example request:**
```json
{
  "user_id": 2
}
```

### POST /api/search/unfollow
**What it does:**
Unfollows a user.

**How it works:**
1. Gets current user
2. Gets user ID to unfollow from request
3. Finds the Follow record
4. Deletes it from database

**Example request:**
```json
{
  "user_id": 2
}
```

### GET /api/search/user/<user_id>
**What it does:**
Gets a specific user's public profile.

**How it works:**
1. Gets current user
2. Gets the user by ID
3. Gets user data with interests
4. Checks if current user is following them
5. Gets follower/following counts
6. Returns user data

**Example response:**
```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "bio": "My bio",
  "interests": ["Interest 1"],
  "is_following": true,
  "followers": 10,
  "following": 5
}
```

---

## 9. app/routes/notes.py - Match Notes

**What it does:**
Handles notes users write about their matches.

### GET /api/notes/match/<match_id>
**What it does:**
Gets notes for a specific match.

**How it works:**
1. Gets current user
2. Finds note for this match and user
3. Returns note text or empty string if no note exists

**Example response:**
```json
{
  "note": "Met at coffee shop, very interested in VC."
}
```

### POST /api/notes/match/<match_id>
**What it does:**
Creates or updates a note for a match.

**How it works:**
1. Gets current user
2. Gets note text from request
3. Checks if note already exists
4. If exists, updates it
5. If not, creates new note
6. Saves to database

**Example request:**
```json
{
  "note": "This is my note about this match"
}
```

### DELETE /api/notes/match/<match_id>
**What it does:**
Deletes a note for a match.

**How it works:**
1. Gets current user
2. Finds the note
3. Deletes it from database

---

## How Authentication Works

1. **User signs up or logs in** → Backend creates a token
2. **Frontend stores the token** → Usually in localStorage
3. **Frontend sends token with requests** → In `Authorization: Bearer <token>` header
4. **Backend verifies token** → Checks if it's valid
5. **Backend gets user ID from token** → Knows which user is making the request
6. **Route can access user** → Via `request.current_user`

**Example:**
```
Frontend sends:
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Backend receives token, verifies it, and knows:
"This is user ID 5 making the request"
```

---

## Database Flow

**Saving data:**
1. Create object (e.g., `new_user = User(...)`)
2. Add to session (`db.session.add(new_user)`)
3. Commit (`db.session.commit()`)

**Getting data:**
1. Query database (e.g., `User.query.filter_by(email=email).first()`)
2. Use the data

**Updating data:**
1. Get object from database
2. Change its attributes
3. Commit changes

**Deleting data:**
1. Get object from database
2. Delete it (`db.session.delete(object)`)
3. Commit changes

---

## How Matching Works

1. **User clicks "Find Match"**
   - Frontend calls `POST /api/matches/find`
   - Backend finds available users
   - Calculates match scores
   - Returns best match

2. **User accepts match**
   - Frontend calls `POST /api/matches/accept` with user_id
   - Backend creates Match record
   - Match is now active

3. **User views matches**
   - Frontend calls `GET /api/matches/current`
   - Backend returns all active matches

4. **User archives match**
   - Frontend calls `POST /api/matches/archive` with match_id
   - Backend sets is_active to False
   - Match moves to past matches

---

## Simple Flow Examples

### User Signup Flow
1. User fills out signup form
2. Frontend sends: `POST /api/auth/signup` with email, password, name
3. Backend creates user, hashes password, generates token
4. Backend returns user data and token
5. Frontend stores token and redirects to onboarding

### Finding a Match Flow
1. User clicks "Find Match" button
2. Frontend sends: `POST /api/matches/find`
3. Backend finds available users, calculates scores
4. Backend returns best match with score
5. Frontend shows match result page

### Accepting a Match Flow
1. User clicks "Accept Match" button
2. Frontend sends: `POST /api/matches/accept` with user_id and score
3. Backend creates Match record
4. Backend returns success
5. Frontend redirects to matches page

---

## Key Concepts

**Flask:** Web framework that makes it easy to create API endpoints

**SQLAlchemy:** Makes it easy to work with databases using Python

**JWT Token:** A secure way to verify users are logged in

**Blueprint:** Organizes routes into separate files

**Database:** Stores all our data (users, matches, notes, etc.)

**CORS:** Allows React frontend to make requests to Flask backend

---

## Summary

The backend is simple:
- **Routes** handle requests from the frontend
- **Models** define database tables
- **Utils** provide helper functions
- **Database** stores all data

Everything is straightforward - no complex logic, just simple operations:
- Get data from request
- Do something with it (save, update, delete, calculate)
- Return response

The code is easy to read and modify. Each function does one thing and does it simply.

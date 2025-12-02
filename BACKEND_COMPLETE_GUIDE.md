# Complete Backend Guide - TaMeet API

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [How It All Works Together](#how-it-all-works-together)
4. [Authentication System](#authentication-system)
5. [Database Models](#database-models)
6. [API Routes Explained](#api-routes-explained)
7. [Request/Response Flow](#requestresponse-flow)

---

## Architecture Overview

Your backend is a **Flask REST API** that serves JSON data to your React frontend. Here's the big picture:

```
Frontend (React) → HTTP Requests → Flask Backend → Database (SQLite)
                    (JSON)           (Python)        (SQLite file)
```

**Key Technologies:**
- **Flask**: Web framework that handles HTTP requests
- **SQLAlchemy**: ORM (Object-Relational Mapping) - lets you use Python objects instead of SQL
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing (security)
- **CORS**: Allows frontend to make requests from different port

---

## File Structure

```
backend/
├── run.py              # Entry point - starts the server
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
└── app/
    ├── __init__.py     # App factory - creates Flask app
    ├── models.py       # Database tables (User, Match, etc.)
    ├── utils.py        # Helper functions (auth, password hashing)
    └── routes/
        ├── auth.py     # Signup/Login endpoints
        ├── profile.py  # Profile management
        ├── matches.py  # Matching system
        ├── search.py   # User search & follow
        └── notes.py    # Match notes
```

---

## How It All Works Together

### 1. **Starting the Server** (`run.py`)

```python
from app import create_app
app = create_app()
app.run(debug=True, host='0.0.0.0', port=5000)
```

**What happens:**
1. Imports `create_app()` function from `app/__init__.py`
2. Creates Flask application instance
3. Starts server on port 5000
4. `debug=True` means auto-reload on code changes

### 2. **App Initialization** (`app/__init__.py`)

This is the **heart** of your backend. It:
- Creates Flask app
- Connects to database
- Enables CORS (so React can talk to Flask)
- Registers all route blueprints
- Creates database tables

**Key parts:**

```python
# Create database object
db = SQLAlchemy()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)  # Load settings
db.init_app(app)  # Connect database

# Enable CORS - allows React (port 3000) to make requests
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Register blueprints (routes)
app.register_blueprint(auth.bp, url_prefix='/api/auth')
app.register_blueprint(profile.bp, url_prefix='/api/profile')
# ... etc

# Create database tables
db.create_all()
```

**What are Blueprints?**
- Blueprints organize routes into separate files
- Instead of having all routes in one file, you split them by feature
- Each blueprint has a URL prefix (e.g., `/api/auth`)

---

## Authentication System

This is **critical** to understand. Your app uses **JWT (JSON Web Tokens)** for authentication.

### How Authentication Works:

#### **Step 1: User Signs Up** (`routes/auth.py` - `/signup`)

```python
# User sends: { email, password, name }
password_hash = hash_password(password)  # Hash password
new_user = User(email=email, password_hash=password_hash, name=name)
db.session.add(new_user)
db.session.commit()

token = generate_token(new_user.id)  # Create JWT token
return { 'user': user_data, 'token': token }
```

**What happens:**
1. Password is **hashed** (never stored in plain text!)
2. User saved to database
3. JWT token generated (contains user ID)
4. Token sent to frontend

#### **Step 2: User Logs In** (`routes/auth.py` - `/login`)

```python
# User sends: { email, password }
user = User.query.filter_by(email=email).first()
if check_password(password, user.password_hash):  # Verify password
    token = generate_token(user.id)
    return { 'user': user_data, 'token': token }
```

**What happens:**
1. Find user by email
2. Check if password matches (using bcrypt)
3. Generate new token
4. Return user data + token

#### **Step 3: Making Authenticated Requests**

Every protected route uses the `@require_auth` decorator:

```python
@bp.route('/profile', methods=['GET'])
@require_auth  # <-- This decorator checks authentication
def get_profile():
    user = request.current_user  # User is automatically available!
    return jsonify(user.to_dict())
```

**How `@require_auth` works** (`utils.py`):

```python
def require_auth(f):
    def decorated_function(*args, **kwargs):
        # 1. Get token from request header
        auth_header = request.headers.get('Authorization')
        # Format: "Bearer <token>"
        
        # 2. Extract token
        token = auth_header.split(' ')[1]
        
        # 3. Verify token (decode JWT)
        user_id = verify_token(token)
        
        # 4. Get user from database
        user = User.query.get(user_id)
        
        # 5. Attach user to request
        request.current_user = user
        
        # 6. Call original function
        return f(*args, **kwargs)
    return decorated_function
```

**Frontend sends token like this:**
```javascript
fetch('http://localhost:5000/api/profile', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
```

### Password Security (`utils.py`)

**Why hash passwords?**
- If database is hacked, attackers can't see real passwords
- Hashed passwords are one-way (can't reverse them)

**How it works:**

```python
# Hashing (signup)
salt = bcrypt.gensalt()  # Random salt for extra security
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
# Result: "$2b$12$..." (can't be reversed)

# Checking (login)
bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
# Returns True if match, False otherwise
```

### JWT Tokens (`utils.py`)

**What is a JWT?**
- A token that contains user information
- Signed with a secret key (can't be tampered with)
- Has expiration date

**Token Structure:**
```
Header.Payload.Signature

Payload contains:
{
  'user_id': 123,
  'exp': 1234567890  // Expiration timestamp
}
```

**How tokens work:**
1. **Generate** (`generate_token`):
   - Takes user ID
   - Adds expiration (7 days)
   - Signs with SECRET_KEY
   - Returns token string

2. **Verify** (`verify_token`):
   - Decodes token using SECRET_KEY
   - Checks if expired
   - Returns user_id if valid

---

## Database Models

Models define your database tables. SQLAlchemy converts Python classes to SQL tables.

### User Model (`models.py`)

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    interests = db.relationship('UserInterest', ...)
    matches_as_user1 = db.relationship('Match', ...)
    matches_as_user2 = db.relationship('Match', ...)
```

**What this means:**
- `db.Column` = database column
- `primary_key=True` = unique identifier
- `unique=True` = no duplicates allowed
- `nullable=False` = required field
- `db.relationship` = link to other tables

**Relationships Explained:**

```python
# One user has many interests
interests = db.relationship('UserInterest', backref='user', ...)

# One user can be user1 in many matches
matches_as_user1 = db.relationship('Match', foreign_keys='Match.user1_id', ...)

# One user can be user2 in many matches
matches_as_user2 = db.relationship('Match', foreign_keys='Match.user2_id', ...)
```

**Using relationships:**
```python
user = User.query.get(1)
user.interests  # List of UserInterest objects
user.matches_as_user1  # List of Match objects where user is user1
```

### Match Model

```python
class Match(db.Model):
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user1_accepted = db.Column(db.Boolean, default=False)
    user2_accepted = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    match_score = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    archived_at = db.Column(db.DateTime, nullable=True)
    
    # Prevent duplicate matches
    __table_args__ = (db.UniqueConstraint('user1_id', 'user2_id'),)
```

**Key points:**
- `db.ForeignKey('users.id')` = references User table
- `UniqueConstraint` = can't have same two users matched twice
- `is_active` = distinguishes current vs past matches

### Other Models

- **UserInterest**: Links users to interests (many-to-many relationship)
- **MatchNote**: Notes users write about matches
- **Follow**: Follow relationships between users

---

## API Routes Explained

### Authentication Routes (`routes/auth.py`)

#### `POST /api/auth/signup`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": { "id": 1, "email": "...", "name": "..." },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**What happens:**
1. Hash password
2. Create user in database
3. Generate JWT token
4. Return user + token

#### `POST /api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

**What happens:**
1. Find user by email
2. Check password
3. Generate token
4. Return user + token

---

### Profile Routes (`routes/profile.py`)

#### `GET /api/profile`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "...",
  "name": "...",
  "bio": "...",
  "interests": ["Product Management", "Software Engineering"]
}
```

**What happens:**
1. `@require_auth` gets user from token
2. Get user's interests
3. Return user data

#### `PUT /api/profile`
**Request:**
```json
{
  "name": "New Name",
  "bio": "New bio",
  "interests": ["New Interest"]
}
```

**What happens:**
1. Get authenticated user
2. Update fields if provided
3. Delete old interests, add new ones
4. Save to database
5. Return updated user

#### `POST /api/profile/onboarding`
Same as PUT, but specifically for initial profile setup.

---

### Match Routes (`routes/matches.py`)

#### `POST /api/matches/find`
**What happens:**
1. Get all users except current user
2. Get all existing matches
3. Filter out users already matched
4. Calculate match score for each available user
5. Return best match

**Match Score Calculation:**
```python
# Get interests for both users
user1_interests = set([...])
user2_interests = set([...])

# Find shared interests
shared = user1_interests.intersection(user2_interests)

# Calculate percentage
score = (len(shared) / min(len(user1_interests), len(user2_interests))) * 100
```

#### `POST /api/matches/accept`
**Request:**
```json
{
  "user_id": 5,
  "match_score": 85
}
```

**What happens:**
1. Create Match record
2. Set user1_id and user2_id (smaller ID first to avoid duplicates)
3. Set acceptance flags
4. Save to database

#### `GET /api/matches/current`
Returns all active matches for current user.

**What happens:**
1. Find all matches where user is user1 OR user2
2. Filter for `is_active == True`
3. Get other user's data for each match
4. Return list of matches

#### `POST /api/matches/archive`
**Request:**
```json
{
  "match_id": 10
}
```

**What happens:**
1. Find match
2. Set `is_active = False`
3. Set `archived_at = now()`
4. Save

#### `GET /api/matches/past`
Same as current, but `is_active == False`.

---

### Search Routes (`routes/search.py`)

#### `GET /api/search/users?q=john`
**Query params:** `q` (search term)

**What happens:**
1. If no query, return all users
2. If query, search in name and email (case-insensitive)
3. For each user, check if current user is following
4. Get follower/following counts
5. Return list

**SQL Query (simplified):**
```sql
SELECT * FROM users 
WHERE (name ILIKE '%john%' OR email ILIKE '%john%')
AND id != current_user_id
```

#### `POST /api/search/follow`
**Request:**
```json
{
  "user_id": 5
}
```

**What happens:**
1. Create Follow record
2. `follower_id = current_user.id`
3. `followed_id = user_id`
4. Save

#### `POST /api/search/unfollow`
Deletes Follow record.

#### `GET /api/search/user/<user_id>`
Returns specific user's public profile with follow status.

---

### Notes Routes (`routes/notes.py`)

#### `GET /api/notes/match/<match_id>`
Returns note text for a match (or empty string).

#### `POST /api/notes/match/<match_id>`
**Request:**
```json
{
  "note": "Remember to discuss product strategy"
}
```

**What happens:**
1. Check if note exists
2. If exists, update it
3. If not, create new note
4. Save

#### `DELETE /api/notes/match/<match_id>`
Deletes note.

---

## Request/Response Flow

### Example: User Gets Their Profile

1. **Frontend sends request:**
```javascript
fetch('http://localhost:5000/api/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
```

2. **Flask receives request:**
   - Route: `GET /api/profile`
   - Matches blueprint: `profile.bp`
   - Function: `get_profile()`

3. **Authentication check:**
   - `@require_auth` decorator runs
   - Extracts token from header
   - Verifies token
   - Gets user from database
   - Attaches to `request.current_user`

4. **Route function executes:**
```python
user = request.current_user  # Already authenticated!
interests = [interest.interest_name for interest in user.interests]
user_data = user.to_dict()
user_data['interests'] = interests
return jsonify(user_data)
```

5. **Response sent:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "interests": ["Product Management"]
}
```

6. **Frontend receives JSON** and displays it

---

## Key Concepts Summary

### 1. **Flask Blueprints**
- Organize routes into modules
- Each blueprint has a URL prefix
- Makes code maintainable

### 2. **SQLAlchemy ORM**
- Python classes = database tables
- Objects = rows
- Relationships = foreign keys
- No raw SQL needed!

### 3. **JWT Authentication**
- Token contains user ID
- Signed with secret key
- Expires after 7 days
- Stateless (no server-side session)

### 4. **Password Hashing**
- Never store plain passwords
- bcrypt adds salt automatically
- One-way function (can't reverse)

### 5. **CORS**
- Allows cross-origin requests
- Frontend (port 3000) → Backend (port 5000)
- Configured in `__init__.py`

### 6. **Database Relationships**
- **One-to-Many**: User → Interests (one user, many interests)
- **Many-to-Many**: User ↔ User (through Match table)
- **Foreign Keys**: Link tables together

---

## Common Patterns

### Pattern 1: Protected Route
```python
@bp.route('/endpoint', methods=['GET'])
@require_auth
def my_endpoint():
    user = request.current_user  # User is available!
    # Do something with user
    return jsonify({'data': '...'})
```

### Pattern 2: Get Data from Request
```python
data = request.get_json()  # Get JSON body
query = request.args.get('q')  # Get query parameter
user_id = request.current_user.id  # Get authenticated user
```

### Pattern 3: Database Query
```python
# Get one
user = User.query.get(user_id)

# Filter
users = User.query.filter_by(email=email).first()

# Complex filter
matches = Match.query.filter(
    and_(
        Match.user1_id == user_id,
        Match.is_active == True
    )
).all()
```

### Pattern 4: Create/Update Database
```python
# Create
new_user = User(email=email, name=name)
db.session.add(new_user)
db.session.commit()

# Update
user.name = "New Name"
db.session.commit()

# Delete
db.session.delete(user)
db.session.commit()
```

---

## Testing the API

### Using curl:

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Get Profile (with token):**
```bash
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Best Practices (Current Implementation)

✅ **Good:**
- Passwords are hashed (bcrypt)
- JWT tokens expire (7 days)
- CORS is configured
- SQL injection prevented (SQLAlchemy)

⚠️ **For Production:**
- Use environment variables for SECRET_KEY
- Use HTTPS (not HTTP)
- Add rate limiting
- Validate input data
- Add error handling
- Use stronger password requirements

---

## Debugging Tips

1. **Check if backend is running:**
   - Look for: `Running on http://0.0.0.0:5000`

2. **Check database:**
   - File: `tameet.db` in backend folder
   - Use SQLite browser to view data

3. **Check logs:**
   - Flask prints errors to terminal
   - Look for tracebacks

4. **Test endpoints:**
   - Use Postman or curl
   - Check network tab in browser

5. **Common errors:**
   - `401 Unauthorized` → Token missing/invalid
   - `404 Not Found` → Route doesn't exist
   - `500 Internal Server Error` → Check terminal for error

---

## Next Steps to Master This

1. **Read the code** - Go through each file line by line
2. **Add a new endpoint** - Try creating a simple GET route
3. **Modify existing endpoint** - Change how something works
4. **Add a new model** - Create a new database table
5. **Test everything** - Use curl/Postman to test all endpoints
6. **Read Flask docs** - Understand Flask better
7. **Read SQLAlchemy docs** - Understand database queries

---

## Quick Reference

**Start server:**
```bash
cd backend
python run.py
```

**Database file:**
```
backend/tameet.db
```

**All API endpoints:**
- `/api/auth/signup` - POST
- `/api/auth/login` - POST
- `/api/profile` - GET, PUT
- `/api/profile/onboarding` - POST
- `/api/matches/find` - POST
- `/api/matches/accept` - POST
- `/api/matches/current` - GET
- `/api/matches/past` - GET
- `/api/matches/archive` - POST
- `/api/search/users` - GET
- `/api/search/follow` - POST
- `/api/search/unfollow` - POST
- `/api/search/user/<id>` - GET
- `/api/notes/match/<id>` - GET, POST, DELETE

---

**You now understand the entire backend!** 🎉

This is a solid foundation. Practice by modifying code, adding features, and testing everything. The more you experiment, the more expert you'll become!


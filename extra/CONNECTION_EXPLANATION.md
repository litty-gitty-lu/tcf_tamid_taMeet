# Complete Frontend-Backend Connection Explanation

This document explains how the React frontend is connected to the Flask backend, and how everything works together.

## Overview

The application is split into two separate parts:
- **Frontend** (`frontend/tameet/`) - React application that users interact with
- **Backend** (`backend/`) - Flask API server that handles data and business logic

They communicate over HTTP using JSON.

---

## Project Structure

```
tcf_tamid_taMeet/
├── frontend/
│   └── tameet/
│       └── src/
│           ├── pages/          # All React pages
│           └── utils/
│               └── api.js      # API helper functions
└── backend/
    └── app/
        ├── routes/             # API endpoints
        ├── models.py           # Database models
        └── utils.py            # Helper functions
```

---

## How They Connect

### 1. API Utility Functions (`frontend/tameet/src/utils/api.js`)

This file provides helper functions to make API calls to the backend.

**What it does:**
- Sets the base URL: `http://localhost:5000/api`
- Automatically includes authentication token in headers
- Provides simple functions: `apiGet`, `apiPost`, `apiPut`, `apiDelete`

**Example:**
```javascript
import { apiGet, apiPost } from '../../utils/api';

// GET request
const data = await apiGet('/profile');

// POST request
const result = await apiPost('/auth/login', { email, password });
```

**How authentication works:**
- Token is stored in `localStorage` after login
- Every API call automatically includes: `Authorization: Bearer <token>`
- Backend verifies token and knows which user is making the request

---

## Frontend Pages and Their Backend Connections

### 1. SignIn Page (`pages/SignIn.js`)

**What it does:**
- User enters email and password
- Calls backend login API
- Stores token and user data in localStorage
- Redirects to dashboard

**Backend connection:**
```javascript
const response = await apiPost('/auth/login', {
  email: email,
  password: password
});

// Store token
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

**Backend endpoint:** `POST /api/auth/login`

---

### 2. SignUp Page (`pages/SignUp.js`)

**What it does:**
- User enters name, email, password
- Calls backend signup API
- Stores token and user data
- Redirects to onboarding

**Backend connection:**
```javascript
const response = await apiPost('/auth/signup', {
  name: name,
  email: email,
  password: password
});
```

**Backend endpoint:** `POST /api/auth/signup`

---

### 3. Onboarding Page (`pages/Onboarding/Onboarding.jsx`)

**What it does:**
- User sets up profile (name, bio, picture)
- Saves to backend
- Redirects to interests page

**Backend connection:**
```javascript
await apiPost('/profile/onboarding', {
  name: formData.name,
  bio: formData.bio,
  profile_picture: formData.profilePicturePreview,
  interests: []
});
```

**Backend endpoint:** `POST /api/profile/onboarding`

---

### 4. Interests Page (`pages/Interests/Interests.jsx`)

**What it does:**
- User selects interests
- Saves interests to backend
- Redirects to dashboard

**Backend connection:**
```javascript
await apiPut('/profile', {
  interests: selectedInterestNames
});
```

**Backend endpoint:** `PUT /api/profile`

---

### 5. Dashboard Page (`pages/Dashboard/Dashboard.jsx`)

**What it does:**
- Loads current matches from backend
- Displays matches with notes
- Allows archiving matches
- Allows adding/editing notes

**Backend connections:**

**Load matches:**
```javascript
const current = await apiGet('/matches/current');
const past = await apiGet('/matches/past');
```

**Save notes:**
```javascript
await apiPost(`/notes/match/${matchId}`, {
  note: notesText
});
```

**Archive match:**
```javascript
await apiPost('/matches/archive', {
  match_id: matchId
});
```

**Backend endpoints:**
- `GET /api/matches/current` - Get current matches
- `GET /api/matches/past` - Get past matches
- `POST /api/notes/match/<match_id>` - Save notes
- `POST /api/matches/archive` - Archive match

---

### 6. FindMatch Page (`pages/FindMatch/FindMatch.jsx`)

**What it does:**
- Calls backend to find a new match
- Stores match data temporarily
- Redirects to match result page

**Backend connection:**
```javascript
const matchData = await apiPost('/matches/find', {});
sessionStorage.setItem('currentMatch', JSON.stringify(matchData));
```

**Backend endpoint:** `POST /api/matches/find`

---

### 7. MatchResult Page (`pages/MatchResult/MatchResult.jsx`)

**What it does:**
- Displays the found match
- Allows accepting or declining
- Calls backend to save match decision

**Backend connections:**

**Accept match:**
```javascript
await apiPost('/matches/accept', {
  user_id: matchedPerson.id,
  match_score: matchedPerson.match_score
});
```

**Decline match:**
```javascript
await apiPost('/matches/decline', {
  user_id: matchedPerson.id
});
```

**Backend endpoints:**
- `POST /api/matches/accept` - Accept match
- `POST /api/matches/decline` - Decline match

---

### 8. Matches Page (`pages/Matches/Matches.jsx`)

**What it does:**
- Loads all current matches from backend
- Displays list of matches
- Links to Slack for messaging

**Backend connection:**
```javascript
const matchesData = await apiGet('/matches/current');
```

**Backend endpoint:** `GET /api/matches/current`

---

### 9. Profile Page (`pages/Profile/Profile.jsx`)

**What it does:**
- Loads user's profile from backend
- Allows editing profile
- Saves changes to backend

**Backend connections:**

**Load profile:**
```javascript
const data = await apiGet('/profile');
```

**Update profile:**
```javascript
const updatedData = await apiPut('/profile', {
  name: formData.name,
  bio: formData.bio,
  profile_picture: formData.profilePicture,
  interests: formData.interests
});
```

**Backend endpoints:**
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

---

### 10. Search Page (`pages/Search/Search.jsx`)

**What it does:**
- Searches for users by name/email
- Displays search results
- Allows following/unfollowing users

**Backend connections:**

**Search users:**
```javascript
const usersData = await apiGet(`/search/users?q=${searchQuery}`);
```

**Follow user:**
```javascript
await apiPost('/search/follow', { user_id: userId });
```

**Unfollow user:**
```javascript
await apiPost('/search/unfollow', { user_id: userId });
```

**Backend endpoints:**
- `GET /api/search/users?q=query` - Search users
- `POST /api/search/follow` - Follow user
- `POST /api/search/unfollow` - Unfollow user

---

### 11. UserProfile Page (`pages/UserProfile/UserProfile.jsx`)

**What it does:**
- Displays another user's public profile
- Allows following/unfollowing
- Shows user's interests and bio

**Backend connections:**

**Load user profile:**
```javascript
const userData = await apiGet(`/search/user/${userId}`);
```

**Follow/unfollow:**
```javascript
await apiPost('/search/follow', { user_id: userId });
// or
await apiPost('/search/unfollow', { user_id: userId });
```

**Backend endpoints:**
- `GET /api/search/user/<user_id>` - Get user profile
- `POST /api/search/follow` - Follow user
- `POST /api/search/unfollow` - Unfollow user

---

## Authentication Flow

1. **User signs up or logs in**
   - Frontend sends credentials to backend
   - Backend creates/verifies user and generates JWT token
   - Backend returns token and user data
   - Frontend stores token in `localStorage`

2. **User makes authenticated requests**
   - Frontend includes token in `Authorization: Bearer <token>` header
   - Backend verifies token using `@require_auth` decorator
   - Backend knows which user is making the request
   - Backend processes request and returns data

3. **User logs out**
   - Frontend removes token from `localStorage`
   - User is redirected to sign in page

---

## Data Flow Examples

### Example 1: Finding a Match

1. User clicks "Find Match" button
2. Frontend calls: `POST /api/matches/find`
3. Backend:
   - Gets current user from token
   - Finds available users
   - Calculates match scores
   - Returns best match
4. Frontend displays match result
5. User accepts/declines
6. Frontend calls: `POST /api/matches/accept` or `/matches/decline`
7. Backend saves match to database
8. Frontend redirects to matches page

### Example 2: Viewing Dashboard

1. User navigates to dashboard
2. Frontend calls: `GET /api/matches/current`
3. Backend:
   - Gets current user from token
   - Finds all active matches for user
   - Returns match data with user info
4. Frontend displays matches
5. User can add notes, archive matches, etc.

### Example 3: Searching Users

1. User types in search box
2. Frontend calls: `GET /api/search/users?q=query`
3. Backend:
   - Searches users by name/email
   - Checks follow status
   - Returns list of users
4. Frontend displays search results
5. User can follow/unfollow

---

## Backend Structure

### Routes (`backend/app/routes/`)

Each route file handles specific functionality:
- `auth.py` - Signup and login
- `profile.py` - Profile management
- `matches.py` - Matching system
- `search.py` - Search and follow
- `notes.py` - Match notes

### Models (`backend/app/models.py`)

Database tables:
- `User` - User accounts
- `UserInterest` - User interests
- `Match` - Matches between users
- `MatchNote` - Notes about matches
- `Follow` - Follow relationships

### Utils (`backend/app/utils.py`)

Helper functions:
- `hash_password()` - Hash passwords
- `check_password()` - Verify passwords
- `generate_token()` - Create JWT tokens
- `verify_token()` - Verify JWT tokens
- `@require_auth` - Protect routes that need login

---

## How to Run

### Start Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```
Backend runs on `http://localhost:5000`

### Start Frontend:
```bash
cd frontend/tameet
npm install
npm start
```
Frontend runs on `http://localhost:3000`

---

## Key Points

1. **Separation of Concerns:**
   - Frontend handles UI and user interaction
   - Backend handles data and business logic
   - They communicate via HTTP API

2. **Authentication:**
   - JWT tokens stored in localStorage
   - Automatically included in all API requests
   - Backend verifies token on protected routes

3. **Data Flow:**
   - Frontend makes API calls
   - Backend processes requests
   - Backend returns JSON data
   - Frontend updates UI with data

4. **Error Handling:**
   - Backend returns simple responses
   - Frontend handles responses
   - No complex error checking (as requested)

5. **State Management:**
   - React state for UI
   - localStorage for authentication
   - sessionStorage for temporary data (like current match)

---

## Complete API Endpoint List

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Log in

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/onboarding` - Complete onboarding

### Matches
- `POST /api/matches/find` - Find new match
- `POST /api/matches/accept` - Accept match
- `POST /api/matches/decline` - Decline match
- `GET /api/matches/current` - Get current matches
- `GET /api/matches/past` - Get past matches
- `POST /api/matches/archive` - Archive match

### Search
- `GET /api/search/users?q=query` - Search users
- `POST /api/search/follow` - Follow user
- `POST /api/search/unfollow` - Unfollow user
- `GET /api/search/user/<user_id>` - Get user profile

### Notes
- `GET /api/notes/match/<match_id>` - Get notes
- `POST /api/notes/match/<match_id>` - Save notes
- `DELETE /api/notes/match/<match_id>` - Delete notes

---

## Summary

The frontend and backend are completely separate but work together:

- **Frontend** = What users see and interact with
- **Backend** = Where data is stored and processed
- **API** = How they communicate

Everything is connected and working. Users can:
- Sign up and log in
- Set up their profile
- Find matches
- View and manage matches
- Search and follow users
- Add notes to matches

The system is simple, straightforward, and fully functional!


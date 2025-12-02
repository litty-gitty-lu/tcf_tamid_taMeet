# Backend File Structure

```
backend/
│
├── run.py                    # START HERE - Entry point to run server
│   └── Creates app and runs on port 5000
│
├── config.py                 # Configuration settings
│   ├── SECRET_KEY (for JWT tokens)
│   └── DATABASE_URL (SQLite database location)
│
├── requirements.txt          # Python dependencies
│   ├── Flask
│   ├── Flask-SQLAlchemy
│   ├── Flask-CORS
│   ├── PyJWT
│   ├── bcrypt
│   └── python-dotenv
│
└── app/                      # Main application folder
    │
    ├── __init__.py           # APP FACTORY - Creates Flask app
    │   ├── Creates Flask instance
    │   ├── Connects database
    │   ├── Enables CORS
    │   ├── Registers blueprints
    │   └── Creates database tables
    │
    ├── models.py             # DATABASE MODELS - Defines tables
    │   ├── User (users table)
    │   ├── Interest (interests table)
    │   ├── UserInterest (user_interests table)
    │   ├── Match (matches table)
    │   ├── MatchNote (match_notes table)
    │   └── Follow (follows table)
    │
    ├── utils.py              # UTILITY FUNCTIONS - Helper functions
    │   ├── hash_password() - Hash passwords with bcrypt
    │   ├── check_password() - Verify passwords
    │   ├── generate_token() - Create JWT tokens
    │   ├── verify_token() - Decode JWT tokens
    │   └── require_auth - Decorator for protected routes
    │
    └── routes/                # API ROUTES - All endpoints
        │
        ├── __init__.py        # (Empty - just makes it a package)
        │
        ├── auth.py           # AUTHENTICATION ROUTES
        │   ├── POST /api/auth/signup
        │   └── POST /api/auth/login
        │
        ├── profile.py        # PROFILE ROUTES
        │   ├── GET /api/profile
        │   ├── PUT /api/profile
        │   └── POST /api/profile/onboarding
        │
        ├── matches.py        # MATCHING ROUTES
        │   ├── POST /api/matches/find
        │   ├── POST /api/matches/accept
        │   ├── POST /api/matches/decline
        │   ├── GET /api/matches/current
        │   ├── GET /api/matches/past
        │   └── POST /api/matches/archive
        │
        ├── search.py         # SEARCH ROUTES
        │   ├── GET /api/search/users
        │   ├── POST /api/search/follow
        │   ├── POST /api/search/unfollow
        │   └── GET /api/search/user/<id>
        │
        └── notes.py          # NOTES ROUTES
            ├── GET /api/notes/match/<id>
            ├── POST /api/notes/match/<id>
            └── DELETE /api/notes/match/<id>
```

## How Files Connect

```
┌─────────────────────────────────────────────────────────────┐
│                    run.py                                   │
│  (Entry Point - Starts Server)                              │
│                                                              │
│  from app import create_app                                 │
│  app = create_app()  ───────────────────┐                 │
│  app.run(port=5000)                      │                 │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│              app/__init__.py                                 │
│  (App Factory - Sets Up Everything)                         │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │ 1. Create Flask app                  │                   │
│  │ 2. Load config.py settings           │                   │
│  │ 3. Connect database (SQLAlchemy)    │                   │
│  │ 4. Enable CORS                      │                   │
│  │ 5. Import models.py                 │──┐                │
│  │ 6. Register route blueprints        │  │                │
│  │    - auth.bp                        │  │                │
│  │    - profile.bp                     │  │                │
│  │    - matches.bp                     │  │                │
│  │    - search.bp                      │  │                │
│  │    - notes.bp                       │  │                │
│  │ 7. Create database tables          │  │                │
│  └──────────────────────────────────────┘  │                │
└─────────────────────────────────────────────┼───────────────┘
                                               │
        ┌──────────────────────────────────────┼──────────────┐
        │                                      │              │
        ▼                                      ▼              ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐
│  models.py    │  │  utils.py    │  │  routes/            │
│               │  │               │  │                     │
│  User         │  │  hash_pass   │  │  auth.py            │
│  Match        │  │  check_pass   │  │  profile.py        │
│  UserInterest │  │  gen_token    │  │  matches.py        │
│  MatchNote    │  │  verify_token │  │  search.py         │
│  Follow       │  │  require_auth │  │  notes.py          │
└───────────────┘  └──────────────┘  └──────────────────────┘
        │                  │                      │
        │                  │                      │
        └──────────────────┴──────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Database (SQLite)     │
              │   tameet.db              │
              └────────────────────────┘
```

## Request Flow Example

```
Frontend Request
    │
    │ POST /api/profile
    │ Headers: Authorization: Bearer <token>
    │
    ▼
┌─────────────────────────────────────┐
│  Flask receives request             │
│  Matches route: /api/profile        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  routes/profile.py                   │
│  @bp.route('/profile')               │
│  @require_auth  ◄───────────────────┼── Uses utils.py
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  utils.py - require_auth()          │
│  1. Extract token from header       │
│  2. verify_token()                  │
│  3. Get user from database          │
│  4. Attach to request.current_user  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  models.py - User.query.get()       │
│  SQLAlchemy queries database        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Database (tameet.db)               │
│  Returns user data                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  profile.py - get_profile()          │
│  Returns JSON response              │
└─────────────────────────────────────┘
    │
    ▼
Frontend receives JSON
```

## File Dependencies

```
run.py
  └── depends on ──► app/__init__.py
                      │
                      ├── depends on ──► config.py
                      │
                      ├── depends on ──► models.py
                      │
                      ├── depends on ──► utils.py
                      │
                      └── depends on ──► routes/
                                          │
                                          ├── auth.py ──► uses utils.py, models.py
                                          ├── profile.py ──► uses utils.py, models.py
                                          ├── matches.py ──► uses utils.py, models.py
                                          ├── search.py ──► uses utils.py, models.py
                                          └── notes.py ──► uses utils.py, models.py
```

## What Each File Does (Quick Reference)

| File | Purpose | Key Functions |
|------|---------|---------------|
| `run.py` | Start server | `app.run()` |
| `config.py` | Settings | `SECRET_KEY`, `DATABASE_URL` |
| `app/__init__.py` | App setup | `create_app()`, register blueprints |
| `models.py` | Database tables | `User`, `Match`, etc. |
| `utils.py` | Helper functions | `hash_password()`, `require_auth` |
| `routes/auth.py` | Login/Signup | `/signup`, `/login` |
| `routes/profile.py` | User profiles | `/profile`, `/onboarding` |
| `routes/matches.py` | Matching system | `/find`, `/accept`, `/current` |
| `routes/search.py` | User search | `/users`, `/follow` |
| `routes/notes.py` | Match notes | `/match/<id>` |

## Database File Location

```
backend/
  └── tameet.db  ◄── SQLite database file (created automatically)
```

This file stores all your data:
- Users
- Matches
- Interests
- Notes
- Follows

---

**That's the complete file structure!**


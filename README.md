# TaMeet

Simple matching app for TAMID members.

## How to Run

### 1. Start Backend (Terminal 1)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

Wait until you see: `Running on http://0.0.0.0:5000`

### 2. Start Frontend (Terminal 2 - NEW TERMINAL)

```bash
cd frontend
npm install
npm start
```

Browser will open to `http://localhost:3000`

### 3. Create Account

1. Go to `http://localhost:3000`
2. Click "Sign up"
3. Enter name, email, password
4. Click "Sign up"
5. Complete onboarding

## Project Structure

```
tcf_tamid_taMeet/
├── frontend/          # React app
│   ├── src/
│   │   ├── pages/     # All pages
│   │   ├── utils/     # API functions
│   │   ├── App.js     # Main app
│   │   └── index.js   # Entry point
│   └── public/        # Images, etc.
├── backend/           # Flask API
│   ├── app/
│   │   ├── routes/    # API endpoints
│   │   ├── models.py  # Database
│   │   └── utils.py   # Helpers
│   └── run.py         # Start server
└── extra/             # Extra docs (ignore)
```

## That's It!

Both servers must be running at the same time:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

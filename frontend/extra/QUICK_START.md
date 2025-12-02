# Quick Start Guide

## The Error You're Seeing

If you see "Failed to fetch" error, it means the **backend server is not running**. The frontend (React) needs the backend (Flask) to be running to work.

## How to Fix It

### Step 1: Start the Backend Server

Open a **new terminal window** and run:

```bash
cd /Users/alejandroradacassab/tcf_tamid_taMeet
./START_BACKEND.sh
```

Or manually:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

**Keep this terminal open!** The backend needs to keep running.

### Step 2: Make Sure Frontend is Running

In another terminal (or if it's already running, that's fine):

```bash
cd frontend/tameet
npm start
```

### Step 3: Try Signing Up Again

Now go to `http://localhost:3000/signup` and try creating an account again.

## What Should Happen

1. Backend starts on `http://localhost:5000`
2. Frontend runs on `http://localhost:3000`
3. When you sign up, frontend sends request to `http://localhost:5000/api/auth/signup`
4. Backend creates account and returns token
5. You get redirected to onboarding page

## Troubleshooting

**If backend won't start:**
- Make sure you have Python 3 installed: `python3 --version`
- Make sure you're in the backend directory
- Check if port 5000 is already in use

**If you still get errors:**
- Check the backend terminal for error messages
- Make sure both servers are running
- Try refreshing the browser page


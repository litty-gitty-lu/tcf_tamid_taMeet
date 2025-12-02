# How to Run TaMeet

## Step 1: Start Backend

Open Terminal and run:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

**Wait for:** `Running on http://0.0.0.0:5000`

**Keep this terminal open!**

## Step 2: Start Frontend

Open a **NEW Terminal** and run:

```bash
cd frontend
npm install
npm start
```

**Wait for:** Browser opens to `http://localhost:3000`

## Step 3: Create Account

1. Go to `http://localhost:3000`
2. Click "Sign up"
3. Enter name, email, password
4. Click "Sign up"
5. Complete onboarding

## That's It!

Both servers must be running:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Troubleshooting

**"Failed to fetch" error?**
→ Backend isn't running. Start it in Step 1.

**Frontend won't start?**
→ Run `npm install` first.

**Backend won't start?**
→ Make sure you activated venv: `source venv/bin/activate`

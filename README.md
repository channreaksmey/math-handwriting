# Math Handwriting Data Collection System

## Project Goal

This project is a math handwriting data collection platform for capturing how students solve problems, not just whether the final answer is correct. Students complete generated math questions on a digital canvas, and the app records detailed stroke-level behavior (timing, pressure, movement), then sends that data to a backend for storage and analysis.

## What It Does

* Runs guided practice sessions where each problem is solved by handwriting.
* Captures full drawing process from the canvas, including stroke sequences and timing.
* Generates math problems by difficulty and type.
* Stores submissions in MongoDB with analytics metadata.
* Provides review/export workflows for collected session data.

## Project Structure

This project is organized into two separate applications:

```
math-handwriting/
├── frontend/          # Next.js frontend application
├── backend/           # Python FastAPI backend
└── README.md          # This file
```

See `frontend/README.md` and `backend/README.md` for specific setup instructions.

# Tech Stack

* Frontend: Next.js, React, TypeScript, Tailwind.
* Backend: FastAPI, Motor/PyMongo, Pydantic.
* Database: MongoDB Atlas.
* Deployment: Vercel (frontend and backend as separate projects/directories).

# Frontend (Next.js)

Located in `frontend/`

* Main app entry and landing experience: `frontend/app/page.tsx`
* Session flow pages:
    * Setup: `frontend/app/setup/page.tsx`
    * Game (capture loop): `frontend/app/game/page.tsx`
    * Review: `frontend/app/review/page.tsx`
* Canvas component and stroke capture hook:
    * Canvas UI: `frontend/components/canvas/MathCanvas.tsx`
    * Stroke logic: `frontend/hooks/useStrokeCapture.ts`
* API client used by frontend: `frontend/lib/api.ts`
* Problem generation logic: `frontend/lib/problemGenerator.ts`

# Backend (FastAPI)

Located in `backend/`

* API and DB integration: `backend/app/main.py`
* Data models: `backend/app/models.py`
* Analytics calculations: `backend/app/analytics.py`
* Vercel entrypoint for serverless deployment: `backend/api/index.py`
* Vercel routing config: `backend/vercel.json`

## Quick Start

```bash
# Start the backend first
cd backend
python run.py

# In another terminal, start the frontend
cd frontend
npm install  # if needed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the frontend.

The backend API will be available at [http://localhost:8000](http://localhost:8000).

## Deployed Site

[https://math-handwriting-frontend.vercel.app/](https://math-handwriting-frontend.vercel.app/)
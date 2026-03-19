# Math Handwriting Data Collection System

## Project Goal

This project is a math handwriting data collection platform for capturing how students solve problems, not just whether the final answer is correct. Students complete generated math questions on a digital canvas, and the app records detailed stroke-level behavior (timing, pressure, movement), then sends that data to a backend for storage and analysis.

## What It Does

* Runs guided practice sessions where each problem is solved by handwriting.
* Captures full drawing process from the canvas, including stroke sequences and timing.
* Generates math problems by difficulty and type.
* Stores submissions in MongoDB with analytics metadata.
* Provides review/export workflows for collected session data.

# Tech Stack

* Frontend: Next.js, React, TypeScript, Tailwind.
* Backend: FastAPI, Motor/PyMongo, Pydantic.
* Database: MongoDB Atlas.
* Deployment: Vercel (frontend and backend as separate projects/directories).

# Frontend (Next.js)

* Main app entry and landing experience: page.tsx
* Session flow pages:
    * Setup: `app/page.tsx`
    * Game (capture loop): `app/game/page.tsx`
    * Review: `app/review/page.tsx`
* Canvas component and stroke capture hook:
    * Canvas UI: `components/canvas/MathCanvas.tsx`
    * Stroke logic: `hooks/useStrokeCapture.ts`
* API client used by frontend: `lib/api.ts`
* Problem generation logic: `lib/problemGenerator.ts`

# Backend (FastAPI)

* API and DB integration: `python-backend/app/main.py`
* Data models: `python-backend/app/models.py` *not started*
* Analytics calculations: `python-backend/app/analytics.py` *not started*
* Vercel entrypoint for serverless deployment: `python-backend/api/index.py`
* Vercel routing config: `python-backend/vercel.json`

## Quick Start

```bash
cd python-backend
python run.py
# then
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployed Site 

[https://math-handwriting-frontend.vercel.app/](https://math-handwriting-frontend.vercel.app/)
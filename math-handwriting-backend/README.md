# Backend - Math Handwriting API (FastAPI)

## Overview

This is the backend API for the Math Handwriting Data Collection System. It's built with FastAPI and provides RESTful endpoints for storing and retrieving handwriting stroke data with computed analytics.

## Tech Stack

* **Framework:** FastAPI
* **Database:** MongoDB Atlas (via Motor async driver)
* **Data Validation:** Pydantic
* **Analytics:** NumPy
* **Server:** Uvicorn (ASGI)

## Project Structure

```
backend/
├── app/                    # Main application package
│   ├── main.py            # FastAPI app and API routes
│   ├── models.py          # Pydantic data models
│   └── analytics.py       # Stroke analytics computations
├── api/                    # Vercel serverless functions
│   └── index.py           # Vercel entrypoint
├── requirements.txt       # Python dependencies
├── run.py                 # Development server runner
├── vercel.json            # Vercel deployment configuration
└── .env                   # Environment variables (if any)
```

## API Endpoints

### POST `/api/submit`
Store handwriting stroke data with computed analytics.

**Request Body:**
```json
{
  "session_id": "string",
  "problem": {
    "expression": "string",
    "expected_answer": "string",
    "problem_type": "string",
    "difficulty": 1
  },
  "strokes": [...],
  "canvas_size": {"width": 800, "height": 600},
  "submitted_answer": "string",
  "device_info": {...}
}
```

**Response:**
```json
{
  "status": "success",
  "problem_id": "string",
  "analytics": {...},
  "message": "Handwriting data stored successfully"
}
```

### GET `/api/stats/{session_id}`
Get statistics for a session.

**Response:**
```json
{
  "problems_count": 10,
  "total_strokes": 150,
  "total_duration": 300000,
  "avg_speed": 0.5
}
```

### GET `/api/export`
Export dataset for ML training.

**Query Parameters:**
- `problem_type` (optional): Filter by problem type
- `limit` (optional, default: 100): Number of records
- `has_labels` (optional, default: false): Only return labeled data

### GET `/health`
Check database connection and API health.

## Getting Started

### Prerequisites

* Python 3.9+
* MongoDB Atlas account (or local MongoDB instance)

### Installation

```bash
# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in this directory with:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
CORS_ALLOW_ORIGINS=http://localhost:3000
```

**Required:**
- `MONGODB_URL` - MongoDB connection string

**Optional:**
- `CORS_ALLOW_ORIGINS` - Comma-separated list of allowed origins (default: http://localhost:3000)
- `CORS_ALLOW_ORIGIN_REGEX` - Regex pattern for allowed origins
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `UVICORN_RELOAD` - Enable auto-reload in development (default: false)

### Development

```bash
python run.py
```

The API will be available at [http://localhost:8000](http://localhost:8000)

**API Documentation:**
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Running with Uvicorn Directly

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Data Models

### HandwritingSubmission
Main submission model containing:
- `session_id`: Unique session identifier
- `problem`: Problem details (expression, answer, type, difficulty)
- `strokes`: Array of stroke data with points and timing
- `canvas_size`: Canvas dimensions
- `submitted_answer`: Student's answer
- `device_info`: Device/browser information

### HandwritingAnalytics
Computed analytics from stroke data:
- `stroke_count`: Total number of strokes
- `total_duration_ms`: Total drawing time
- `avg_speed_pixels_per_ms`: Average drawing speed
- Other computed metrics

## Database Schema

The backend stores data in MongoDB with the following structure:

```json
{
  "session_id": "string",
  "sequence": "number",
  "problem": {...},
  "handwriting": {
    "strokes": [...],
    "analytics": {...},
    "canvas_size": {...}
  },
  "device_info": {...},
  "submitted_answer": "string",
  "labels": {
    "strategy": null,
    "process_correct": null,
    "reviewed_by": null,
    "reviewed_at": null
  },
  "created_at": "datetime"
}
```

Indexes are automatically created on:
- `session_id`
- `problem.problem_type`
- `created_at`

## Deployment

### Vercel

This backend is configured for deployment on Vercel as a serverless function.

1. Push your code to GitHub (or use the Vercel CLI)
2. Import the `backend/` directory to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URL`
   - `CORS_ALLOW_ORIGINS` (set to your frontend URL)
4. Deploy

The `vercel.json` file configures routing to the serverless function.

### Other Platforms

You can also deploy to any platform that supports ASGI applications:
- Railway
- Render
- AWS ECS/Elastic Beanstalk
- Docker containers

## CORS Configuration

The backend is configured to accept requests from `http://localhost:3000` by default. For production, update the `CORS_ALLOW_ORIGINS` environment variable to include your frontend's URL.

## Frontend Dependency

This backend is designed to work with the Next.js frontend located in `../frontend/`. The frontend sends handwriting data to the backend's `/api/submit` endpoint and retrieves stats from `/api/stats/{session_id}`.

See the frontend README for frontend setup instructions.

## Development Tips

### Testing the API

Use the auto-generated Swagger UI at `/docs` to test endpoints interactively.

### Database Indexes

The backend automatically creates indexes on startup. For production workloads, consider creating these indexes manually in MongoDB Atlas for better performance.

### Error Handling

All endpoints include proper error handling and return appropriate HTTP status codes. Check the console/logs for detailed error messages during development.

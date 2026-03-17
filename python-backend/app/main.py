# python-backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

from app.models import HandwritingSubmission, SubmissionResponse, HandwritingAnalytics
from app.analytics import compute_stroke_analytics

app = FastAPI(title="Math Handwriting API")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.math_handwriting


@app.on_event("startup")
async def startup():
    # Create indexes
    await db.problems.create_index("session_id")
    await db.problems.create_index("problem.problem_type")
    await db.problems.create_index("created_at")
    print(f"Connected to MongoDB at {MONGODB_URL}")


@app.post("/api/submit", response_model=SubmissionResponse)
async def submit_handwriting(data: HandwritingSubmission):
    """Store handwriting stroke data with computed analytics"""
    try:
        # Compute analytics
        analytics = compute_stroke_analytics(data.strokes)
        
        # Prepare document
        document = {
            "session_id": data.session_id,
            "sequence": await get_next_sequence(data.session_id),
            "problem": data.problem.dict(),
            "handwriting": {
                "strokes": [s.dict() for s in data.strokes],
                "analytics": analytics.dict(),
                "canvas_size": data.canvas_size
            },
            "device_info": data.device_info,
            "submitted_answer": data.submitted_answer,
            "labels": {
                "strategy": None,
                "process_correct": None,
                "reviewed_by": None,
                "reviewed_at": None
            },
            "created_at": datetime.utcnow()
        }
        
        # Insert to MongoDB
        result = await db.problems.insert_one(document)
        
        return SubmissionResponse(
            status="success",
            problem_id=str(result.inserted_id),
            analytics=analytics,
            message="Handwriting data stored successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_next_sequence(session_id: str) -> int:
    """Get next problem sequence number for a session"""
    last_problem = await db.problems.find_one(
        {"session_id": session_id},
        sort=[("sequence", -1)]
    )
    return (last_problem["sequence"] + 1) if last_problem else 1


@app.get("/api/stats/{session_id}")
async def get_session_stats(session_id: str):
    """Get statistics for a session"""
    pipeline = [
        {"$match": {"session_id": session_id}},
        {"$group": {
            "_id": None,
            "problems_count": {"$sum": 1},
            "total_strokes": {"$sum": "$handwriting.analytics.stroke_count"},
            "total_duration": {"$sum": "$handwriting.analytics.total_duration_ms"},
            "avg_speed": {"$avg": "$handwriting.analytics.avg_speed_pixels_per_ms"}
        }}
    ]
    
    result = await db.problems.aggregate(pipeline).to_list(1)
    return result[0] if result else {}


@app.get("/api/export")
async def export_dataset(
    problem_type: str = None,
    limit: int = 100,
    has_labels: bool = False
):
    """Export dataset for ML training"""
    query = {}
    if problem_type:
        query["problem.problem_type"] = problem_type
    if has_labels:
        query["labels.strategy"] = {"$ne": None}
    
    cursor = db.problems.find(query).limit(limit)
    
    problems = []
    async for doc in cursor:
        problems.append({
            "problem_id": str(doc["_id"]),
            "expression": doc["problem"]["expression"],
            "expected_answer": doc["problem"]["expected_answer"],
            "strokes": doc["handwriting"]["strokes"],
            "analytics": doc["handwriting"]["analytics"],
            "strategy_label": doc["labels"].get("strategy"),
            "created_at": doc["created_at"].isoformat()
        })
    
    return {
        "count": len(problems),
        "problems": problems
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
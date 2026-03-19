# python-backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
import certifi

from app.models import HandwritingSubmission, SubmissionResponse
from app.analytics import compute_stroke_analytics

# Load environment variables
load_dotenv()

app = FastAPI(title="Math Handwriting API")

def parse_cors_origins(raw: str | None) -> list[str]:
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

cors_origins = parse_cors_origins(os.getenv("CORS_ALLOW_ORIGINS"))
cors_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX")

app.add_middleware(
CORSMiddleware,
allow_origins=cors_origins,
allow_origin_regex=cors_origin_regex,
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

# MongoDB Atlas connection
MONGODB_URL = os.getenv("MONGODB_URL")

client = None
db = None
if MONGODB_URL:
    client = AsyncIOMotorClient(
        MONGODB_URL,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=3000
    )
    db = client["math"]
else:
    print("WARN: MONGODB_URL is not set")


@app.on_event("startup")
async def startup():
    if client is None:
        return
    try:
        await client.admin.command("ping")
        await db.problems.create_index("session_id")
        await db.problems.create_index("problem.problem_type")
        await db.problems.create_index("created_at")
        print("MongoDB connected and indexes ensured")
    except Exception as e:
        print(f"MongoDB startup warning: {e}")
        # Do not raise in serverless startup

def require_db():
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    return db


@app.post("/api/submit", response_model=SubmissionResponse)
async def submit_handwriting(data: HandwritingSubmission):
    """Store handwriting stroke data with computed analytics"""
    database = require_db()

    try:
        analytics = compute_stroke_analytics(data.strokes)
        
        document = {
            "session_id": data.session_id,
            "sequence": await get_next_sequence(database, data.session_id),
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
        
        result = await database.problems.insert_one(document)
        
        print(f"SAVED: Problem {result.inserted_id} | Session {data.session_id[:8]}... | Strokes: {analytics.stroke_count}")
        
        return SubmissionResponse(
            status="success",
            problem_id=str(result.inserted_id),
            analytics=analytics,
            message="Handwriting data stored successfully"
        )
        
    except Exception as e:
        print(f"FAILED: {e}")  # ADD ERROR LOG
        raise HTTPException(status_code=500, detail=str(e))


async def get_next_sequence(database, session_id: str) -> int:
    """Get next problem sequence number for a session"""
    last_problem = await database.problems.find_one(
        {"session_id": session_id},
        sort=[("sequence", -1)]
    )
    return (last_problem["sequence"] + 1) if last_problem else 1


@app.get("/api/stats/{session_id}")
async def get_session_stats(session_id: str):
    """Get statistics for a session"""
    database = require_db()

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
    
    result = await database.problems.aggregate(pipeline).to_list(1)
    return result[0] if result else {}


@app.get("/api/export")
async def export_dataset(
    problem_type: str = None,
    limit: int = 100,
    has_labels: bool = False
):
    """Export dataset for ML training"""
    database = require_db()

    query = {}
    if problem_type:
        query["problem.problem_type"] = problem_type
    if has_labels:
        query["labels.strategy"] = {"$ne": None}
    
    cursor = database.problems.find(query).limit(limit)
    
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
    """Check database connection"""
    if client is None or db is None:
        return {"status": "error", "message": "Database not configured"}
    try:
        await client.admin.command('ping')
        count = await db.problems.count_documents({})
        return {
            "status": "ok",
            "database": "connected",
            "total_problems": count
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
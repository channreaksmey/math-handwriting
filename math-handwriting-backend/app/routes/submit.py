from fastapi import APIRouter
from datetime import datetime

from app.config import db_manager
from app.models import HandwritingSubmission, SubmissionResponse
from app.analytics import compute_stroke_analytics

router = APIRouter(prefix="/api", tags=["submit"])


@router.post("/submit", response_model=SubmissionResponse)
async def submit_handwriting(data: HandwritingSubmission):
    """Store handwriting stroke data with computed analytics"""
    database = db_manager.require_db()
    
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
        
        print(
            f"SAVED: Problem {result.inserted_id} | Session {data.session_id[:8]}... | Strokes: {analytics.stroke_count}")
        
        return SubmissionResponse(
            status="success",
            problem_id=str(result.inserted_id),
            analytics=analytics,
            message="Handwriting data stored successfully"
        )
    
    except Exception as e:
        print(f"FAILED: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


async def get_next_sequence(database, session_id: str) -> int:
    """Get next problem sequence number for a session"""
    last_problem = await database.problems.find_one(
        {"session_id": session_id},
        sort=[("sequence", -1)]
    )
    return (last_problem["sequence"] + 1) if last_problem else 1

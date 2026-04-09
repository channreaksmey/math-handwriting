from fastapi import APIRouter

from app.config import db_manager

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats/{session_id}")
async def get_session_stats(session_id: str):
    """Get statistics for a session"""
    database = db_manager.require_db()
    
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

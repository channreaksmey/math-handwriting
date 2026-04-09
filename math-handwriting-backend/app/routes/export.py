from fastapi import APIRouter

from app.config import db_manager

router = APIRouter(prefix="/api", tags=["export"])


@router.get("/export")
async def export_dataset(
    problem_type: str = None,
    limit: int = 100,
    has_labels: bool = False
):
    """Export dataset for ML training"""
    database = db_manager.require_db()
    
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

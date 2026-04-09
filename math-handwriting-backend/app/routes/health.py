from fastapi import APIRouter

from app.config import db_manager

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Check database connection"""
    if db_manager.client is None or db_manager.db is None:
        return {"status": "error", "message": "Database not configured"}
    
    try:
        await db_manager.client.admin.command('ping')
        count = await db_manager.db.problems.count_documents({})
        return {
            "status": "ok",
            "database": "connected",
            "total_problems": count
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

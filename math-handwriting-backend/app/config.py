# Backend Configuration

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# Load environment variables
# Priority: .env.local → .env → system environment variables
load_dotenv()


class Settings:
    """Application settings loaded from environment variables"""
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    UVICORN_RELOAD: bool = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    
    # CORS
    CORS_ALLOW_ORIGINS: str | None = os.getenv("CORS_ALLOW_ORIGINS")
    CORS_ALLOW_ORIGIN_REGEX: str | None = os.getenv("CORS_ALLOW_ORIGIN_REGEX")
    
    # Database
    MONGODB_URL: str | None = os.getenv("MONGODB_URL")
    MONGODB_NAME: str = "math"


settings = Settings()


class DatabaseManager:
    """MongoDB connection manager"""
    
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db = None
        self._initialize()
    
    def _initialize(self):
        """Initialize MongoDB connection"""
        if not settings.MONGODB_URL:
            print("WARN: MONGODB_URL is not set")
            return
        
        try:
            # Detect if local or remote MongoDB
            is_local = "localhost" in settings.MONGODB_URL or "127.0.0.1" in settings.MONGODB_URL
            
            if is_local:
                # Local MongoDB doesn't need SSL
                self.client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    serverSelectionTimeoutMS=5000
                )
            else:
                # MongoDB Atlas requires SSL
                self.client = AsyncIOMotorClient(
                    settings.MONGODB_URL,
                    tls=True,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=5000
                )
            
            self.db = self.client[settings.MONGODB_NAME]
            print(f"MongoDB client initialized: {settings.MONGODB_NAME}")
            
        except Exception as e:
            print(f"MongoDB connection error: {e}")
    
    async def startup(self):
        """Ensure database connection and create indexes"""
        if self.client is None or self.db is None:
            return
        
        try:
            await self.client.admin.command("ping")
            await self._ensure_indexes()
            print("MongoDB connected and indexes ensured")
        except Exception as e:
            print(f"MongoDB startup warning: {e}")
    
    async def _ensure_indexes(self):
        """Create necessary database indexes"""
        await self.db.problems.create_index("session_id")
        await self.db.problems.create_index("problem.problem_type")
        await self.db.problems.create_index("created_at")
    
    def require_db(self):
        """Check if database is available"""
        if self.db is None:
            from fastapi import HTTPException
            raise HTTPException(status_code=503, detail="Database not configured")
        return self.db


# Global database manager instance
db_manager = DatabaseManager()

# python-backend/app/models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class Operation(str, Enum):
    ADD = "+"
    SUBTRACT = "-"
    MULTIPLY = "*"
    DIVIDE = "/"


class Point(BaseModel):
    x: float
    y: float
    timestamp: int
    pressure: float = Field(ge=0.0, le=1.0)


class Stroke(BaseModel):
    id: str
    points: List[Point]
    color: str
    brush_size: float
    start_time: int
    end_time: int


class ProblemData(BaseModel):
    expression: str
    operator: Operation
    operands: List[int]
    expected_answer: int
    difficulty: int
    problem_type: str


class HandwritingAnalytics(BaseModel):
    stroke_count: int
    total_points: int
    total_duration_ms: int
    avg_speed_pixels_per_ms: float
    speed_variance: float
    pause_count: int
    pauses: List[Dict[str, Any]]
    pressure_avg: float
    bounding_box: Dict[str, float]


class HandwritingSubmission(BaseModel):
    session_id: str
    problem: ProblemData
    strokes: List[Stroke]
    device_info: Dict[str, Any]
    submitted_answer: Optional[int] = None
    canvas_size: Dict[str, int]


class SubmissionResponse(BaseModel):
    status: str
    problem_id: str
    analytics: HandwritingAnalytics
    message: str
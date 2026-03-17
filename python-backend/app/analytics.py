# python-backend/app/analytics.py
import numpy as np
from typing import List, Dict, Any
from app.models import Stroke, HandwritingAnalytics


def compute_stroke_analytics(strokes: List[Stroke]) -> HandwritingAnalytics:
    """Compute rich analytics from raw stroke data"""
    
    if not strokes:
        return HandwritingAnalytics(
            stroke_count=0,
            total_points=0,
            total_duration_ms=0,
            avg_speed_pixels_per_ms=0.0,
            speed_variance=0.0,
            pause_count=0,
            pauses=[],
            pressure_avg=0.5,
            bounding_box={"min_x": 0, "max_x": 0, "min_y": 0, "max_y": 0}
        )
    
    # Basic counts
    total_points = sum(len(s.points) for s in strokes)
    
    # Speed calculations
    speeds = []
    all_points = []
    
    for stroke in strokes:
        pts = stroke.points
        all_points.extend([(p.x, p.y) for p in pts])
        
        for i in range(1, len(pts)):
            p1, p2 = pts[i-1], pts[i]
            dist = np.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
            time = p2.timestamp - p1.timestamp
            if time > 0:
                speeds.append(dist / time)
    
    # Pause detection (gaps > 1000ms between strokes)
    pauses = []
    for i in range(1, len(strokes)):
        gap = strokes[i].start_time - strokes[i-1].end_time
        if gap > 1000:
            pauses.append({
                "after_stroke": i-1,
                "duration_ms": gap,
                "location": {
                    "x": strokes[i-1].points[-1].x,
                    "y": strokes[i-1].points[-1].y
                }
            })
    
    # Bounding box
    xs = [p[0] for p in all_points] if all_points else [0]
    ys = [p[1] for p in all_points] if all_points else [0]
    
    # Pressure stats
    pressures = [p.pressure for s in strokes for p in s.points]
    
    total_duration = strokes[-1].end_time - strokes[0].start_time if strokes else 0
    
    return HandwritingAnalytics(
        stroke_count=len(strokes),
        total_points=total_points,
        total_duration_ms=total_duration,
        avg_speed_pixels_per_ms=float(np.mean(speeds)) if speeds else 0.0,
        speed_variance=float(np.var(speeds)) if speeds else 0.0,
        pause_count=len(pauses),
        pauses=pauses,
        pressure_avg=float(np.mean(pressures)) if pressures else 0.5,
        bounding_box={
            "min_x": float(min(xs)),
            "max_x": float(max(xs)),
            "min_y": float(min(ys)),
            "max_y": float(max(ys))
        }
    )
// hooks/useStrokeCapture.ts
'use client';

import { useRef, useCallback, useState } from 'react';
import { Point, Stroke, HandwritingSession } from '@/types/strokes';

export function useStrokeCapture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const sessionStartRef = useRef<number>(Date.now());

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    stroke.points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }, []);

  const redrawAll = useCallback((strokesToDraw: Stroke[]) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesToDraw.forEach((stroke) => drawStroke(ctx, stroke));
  }, [drawStroke]);

  const capturePoint = (e: PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, timestamp: Date.now(), pressure: 0.5 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: Date.now(),
      pressure: e.pressure || 0.5,
    };
  };

  const startStroke = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    (e.target as Element).setPointerCapture(e.pointerId);
    
    setIsDrawing(true);
    const point = capturePoint(e.nativeEvent);
    currentStrokeRef.current = [point];
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineWidth = 3 * point.pressure;
    ctx.strokeStyle = '#2c3e50';
  }, []);

  const continueStroke = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = capturePoint(e.nativeEvent);
    currentStrokeRef.current.push(point);

    const ctx = contextRef.current;
    if (ctx) {
      ctx.lineWidth = 3 * point.pressure;
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }, [isDrawing]);

  const endStroke = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);
    
    const points = currentStrokeRef.current;
    if (points.length < 2) {
      currentStrokeRef.current = [];
      return;
    }

    const newStroke: Stroke = {
      id: crypto.randomUUID(),
      points: [...points],
      color: '#2c3e50',
      brushSize: 3,
      startTime: points[0].timestamp,
      endTime: points[points.length - 1].timestamp,
    };

    setStrokes(prev => [...prev, newStroke]);
    currentStrokeRef.current = [];
  }, [isDrawing]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    currentStrokeRef.current = [];
  }, []);

  const undoStroke = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      redrawAll(next);
      return next;
    });
  }, [redrawAll]);

  const exportSession = useCallback((): HandwritingSession => ({
    strokes,
    canvasWidth: canvasRef.current?.width || 0,
    canvasHeight: canvasRef.current?.height || 0,
    deviceType: navigator.userAgent,
    startTime: sessionStartRef.current,
  }), [strokes]);

  const replayStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke, index) => {
      setTimeout(() => {
        drawStroke(ctx, stroke);
      }, index * 100);
    });
  }, [strokes, drawStroke]);

  return {
    canvasRef,
    contextRef,
    startStroke,
    continueStroke,
    endStroke,
    clearCanvas,
    undoStroke,
    exportSession,
    replayStrokes,
    strokes,
    isDrawing,
  };
}
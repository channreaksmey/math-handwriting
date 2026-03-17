// hooks/useStrokeCapture.ts - SIMPLIFIED VERSION
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

  const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    contextRef.current = ctx;
    
    // Simple: match canvas size to display size exactly (no DPR scaling)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2c3e50';
  }, []);

  // Simple coordinate mapping - no DPR complications
  const capturePoint = (e: PointerEvent): Point => {
    const canvas = canvasRef.current!;
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
    if (!canvas) return;

    (e.target as Element).setPointerCapture(e.pointerId);
    
    setIsDrawing(true);
    const point = capturePoint(e.nativeEvent);
    currentStrokeRef.current = [point];
    
    const ctx = contextRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineWidth = 3 * point.pressure;
    }
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
    if (points.length < 2) return;

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
  }, []);

  const exportSession = useCallback((): HandwritingSession => {
    const canvas = canvasRef.current;
    return {
      strokes,
      canvasWidth: canvas?.width || 0,
      canvasHeight: canvas?.height || 0,
      deviceType: navigator.userAgent,
      startTime: sessionStartRef.current,
    };
  }, [strokes]);

  const replayStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    strokes.forEach((stroke, index) => {
      setTimeout(() => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.brushSize;
        
        stroke.points.forEach((point: Point, i: number) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }, index * 100);
    });
  }, [strokes]);

  return {
    canvasRef,
    initCanvas,
    startStroke,
    continueStroke,
    endStroke,
    clearCanvas,
    exportSession,
    replayStrokes,
    strokes,
    isDrawing,
  };
}
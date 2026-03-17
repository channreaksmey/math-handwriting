// types/strokes.ts
export interface Point {
  x: number;
  y: number;
  timestamp: number;
  pressure: number;
  tiltX?: number;
  tiltY?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  brushSize: number;
  startTime: number;
  endTime: number;
}

export interface HandwritingSession {
  strokes: Stroke[];
  canvasWidth: number;
  canvasHeight: number;
  deviceType: string;
  startTime: number;
}
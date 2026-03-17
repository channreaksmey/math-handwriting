// components/canvas/MathCanvas.tsx
'use client';

import { useEffect, useRef, MutableRefObject } from 'react';
import { useStrokeCapture } from '@/hooks/useStrokeCapture';

interface MathCanvasProps {
  onSubmit?: (sessionData: any) => void;
  problemText?: string;
  disabled?: boolean;
  onClearRef?: MutableRefObject<() => void>;
}

export default function MathCanvas({ 
  onSubmit, 
  problemText, 
  disabled, 
  onClearRef 
}: MathCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    canvasRef,
    initCanvas,
    startStroke,
    continueStroke,
    endStroke,
    clearCanvas,
    exportSession,  // ← ADD THIS
    replayStrokes,
    strokes,
  } = useStrokeCapture();

  useEffect(() => {
    if (canvasRef.current) {
      initCanvas(canvasRef.current);
    }
  }, [initCanvas]);

  useEffect(() => {
    if (onClearRef) {
      onClearRef.current = clearCanvas;
    }
  }, [onClearRef, clearCanvas]);

  const handleSubmit = () => {
    const session = exportSession();
    onSubmit?.(session);
  };

  return (
    <div className={`flex flex-col items-center gap-4 w-full max-w-2xl ${disabled ? 'opacity-70' : ''}`}>
      {problemText && (
        <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {problemText}
        </div>
      )}

      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-white rounded-xl shadow-lg border-4 border-gray-200 overflow-hidden touch-none"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full touch-none ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
          onPointerDown={disabled ? undefined : startStroke}
          onPointerMove={disabled ? undefined : continueStroke}
          onPointerUp={disabled ? undefined : endStroke}
          onPointerLeave={disabled ? undefined : endStroke}
          style={{ touchAction: 'none' }}
        />
        
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Strokes: {strokes.length}
        </div>
        
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <span className="text-lg font-medium text-gray-600">Saving...</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={clearCanvas}
          disabled={disabled || strokes.length === 0}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg font-medium transition"
        >
          Clear
        </button>
        <button
          onClick={replayStrokes}
          disabled={disabled || strokes.length === 0}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 rounded-lg font-medium transition"
        >
          Replay
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || strokes.length === 0}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-bold transition"
        >
          {disabled ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
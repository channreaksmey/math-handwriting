// components/canvas/MathCanvas.tsx
'use client';

import { useEffect, useRef, MutableRefObject } from 'react';
import { useStrokeCapture } from '@/hooks/useStrokeCapture';

interface MathCanvasProps {
  onSubmit?: (sessionData: any) => void;
  problemText?: string;
  disabled?: boolean;
  onClearRef?: MutableRefObject<() => void>;
  fillPage?: boolean;
}

export default function MathCanvas({ 
  onSubmit, 
  problemText, 
  disabled, 
  onClearRef,
  fillPage = false
}: MathCanvasProps) {
  const initializedRef = useRef(false);
  
  const {
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
} = useStrokeCapture();

  // Setup canvas once
  useEffect(() => {
    if (initializedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2c3e50';
      contextRef.current = ctx;
      initializedRef.current = true;
      console.log('Canvas ready:', canvas.width, 'x', canvas.height);
    }
  }, [canvasRef, contextRef]);

  // Expose clear function
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
    <div className={'flex flex-col items-center w-full ' + (fillPage ? 'h-full max-w-none gap-4' : 'max-w-2xl gap-6') + (disabled ? ' opacity-70' : '')}>
      {problemText && (
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-30" />
          <div className="relative bg-white rounded-xl px-8 py-4 shadow-lg border border-gray-100">
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {problemText}
            </span>
          </div>
        </div>
      )}

      <div
  className={'relative w-full bg-white rounded-2xl shadow-2xl border-4 border-indigo-100 overflow-hidden touch-none ' + (fillPage ? 'flex-1 min-h-0' : 'aspect-[4/3]')}>
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #6366f1 1px, transparent 1px),
              linear-gradient(to bottom, #6366f1 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        <canvas
          ref={canvasRef}
          className={`w-full h-full touch-none relative z-10 ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
          onPointerDown={disabled ? undefined : startStroke}
          onPointerMove={disabled ? undefined : continueStroke}
          onPointerUp={disabled ? undefined : endStroke}
          onPointerLeave={disabled ? undefined : endStroke}
          style={{ touchAction: 'none' }}
        />
        
        <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {strokes.length} stroke{strokes.length !== 1 ? 's' : ''}
        </div>

        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-br-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-tl-3xl pointer-events-none" />
        
        {disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-30">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <span className="text-indigo-600 font-medium animate-pulse">Saving your work...</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full">
        <button
          onClick={undoStroke}
          disabled={disabled || strokes.length === 0 || isDrawing}
          className="group flex items-center gap-2 px-5 py-3 bg-white hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white text-gray-700 hover:text-amber-700 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11a4 4 0 110 8h-1m-10-8l4-4m-4 4l4 4" />
          </svg>
          Undo
        </button>

        <button
          onClick={clearCanvas}
          disabled={disabled || strokes.length === 0}
          className="group flex items-center gap-2 px-5 py-3 bg-white hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-white text-gray-700 hover:text-red-600 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>

        <button
          onClick={replayStrokes}
          disabled={disabled || strokes.length === 0}
          className="group flex items-center gap-2 px-5 py-3 bg-white hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-white text-gray-700 hover:text-blue-600 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Replay
        </button>

        <button
          onClick={handleSubmit}
          disabled={disabled || strokes.length === 0}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {disabled ? 'Saving...' : 'Submit'}
        </button>
      </div>

      <p className="text-sm text-gray-500 italic">
        💡 Tip: Show your work! Write numbers, draw lines, count dots — we want to see how you think.
      </p>
    </div>
  );
}
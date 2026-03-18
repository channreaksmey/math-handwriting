// app/play/page.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import MathCanvas from '@/components/canvas/MathCanvas';
import { generateProblem, MathProblem, Difficulty } from '@/lib/problemGenerator';
import { Stroke } from '@/types/strokes';
import { submitHandwriting } from '@/lib/api';

interface SessionStats {
  problemsAttempted: number;
  totalStrokes: number;
  totalTimeMs: number;
}

export default function PlayPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    problemsAttempted: 0,
    totalStrokes: 0,
    totalTimeMs: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<{id: string, strokes: number} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const canvasClearRef = useRef<() => void>(() => {});

  useEffect(() => {
    setSessionId(crypto.randomUUID());
    setCurrentProblem(generateProblem(1));
  }, []);

  const handleSubmit = useCallback(async (sessionData: any) => {
    if (!sessionId || !currentProblem) return;
    
    setIsSubmitting(true);
    
    try {
      const duration = sessionData.strokes.length > 0 
        ? sessionData.strokes[sessionData.strokes.length - 1].endTime - sessionData.strokes[0].startTime
        : 0;
      
      const payload = {
        session_id: sessionId,
        problem: {
          expression: currentProblem.expression,
          operator: currentProblem.operator,
          operands: currentProblem.operands,
          expected_answer: currentProblem.expectedAnswer,
          difficulty: currentProblem.difficulty,
          problem_type: currentProblem.type,
        },
        strokes: sessionData.strokes.map((s: Stroke) => ({
          id: s.id,
          points: s.points,
          color: s.color,
          brush_size: s.brushSize,
          start_time: s.startTime,
          end_time: s.endTime,
        })),
        device_info: {
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          screen_size: {
            width: window.screen.width,
            height: window.screen.height,
          },
        },
        submitted_answer: null,
        canvas_size: {
          width: sessionData.canvasWidth,
          height: sessionData.canvasHeight,
        },
      };

      const result = await submitHandwriting(payload);
      
      setLastSaved({
        id: result.problem_id,
        strokes: result.analytics.stroke_count
      });
      
      setStats(prev => ({
        problemsAttempted: prev.problemsAttempted + 1,
        totalStrokes: prev.totalStrokes + sessionData.strokes.length,
        totalTimeMs: prev.totalTimeMs + duration,
      }));

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Clear and next problem
      setTimeout(() => {
        canvasClearRef.current();
        setCurrentProblem(generateProblem(difficulty));
      }, 500);
      
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to save. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentProblem, difficulty, sessionId]);

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    canvasClearRef.current();
    setCurrentProblem(generateProblem(d));
  };

  if (!sessionId || !currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <span className="text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Math Writer
            </h1>
          </div>

          {/* Session Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-mono text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Session: {sessionId.slice(0, 8)}...
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> Your Progress
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-gray-600 text-sm">Problems</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.problemsAttempted}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-gray-600 text-sm">Total Strokes</span>
                  <span className="text-2xl font-bold text-purple-600">{stats.totalStrokes}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-gray-600 text-sm">Time</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round(stats.totalTimeMs / 1000)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Difficulty Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎯</span> Difficulty
              </h2>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDifficultyChange(d as Difficulty)}
                    disabled={isSubmitting}
                    className={`
                      relative py-3 rounded-xl font-bold text-sm transition-all duration-200
                      ${difficulty === d 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      disabled:opacity-50
                    `}
                  >
                    {d}
                    {difficulty === d && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>
              
              <p className="mt-3 text-xs text-gray-500 text-center">
                {difficulty === 1 && "Single-digit +, -, *, /"}
                {difficulty === 2 && "2-digit + and - (with/without carry or borrow)"}
                {difficulty === 3 && "Multiply/divide: single-digit and 2-digit by 1-digit"}
                {difficulty === 4 && "Multi-step addition and subtraction"}
                {difficulty === 5 && "Multi-step multiplication and division"}
              </p>
            </div>

            {/* Problem Info */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold mb-2 opacity-90">Current Problem</h3>
              <p className="text-xs font-mono opacity-75 mb-1">ID: {currentProblem.id.slice(0, 8)}...</p>
              <p className="text-xs opacity-75">Type: {currentProblem.type}</p>
              <p className="text-xs opacity-75">Expected: {currentProblem.expectedAnswer}</p>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
              <MathCanvas 
                problemText={`${currentProblem.expression} = ?`}
                onSubmit={handleSubmit}
                disabled={isSubmitting}
                onClearRef={canvasClearRef}
              />
            </div>

            {/* Instructions */}
            <div className="mt-6 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-yellow-800 text-sm">How to solve</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Write your solution on the canvas. You can draw numbers, write equations, 
                  or show your counting method. Press Submit when done!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Saved!</p>
            {lastSaved && (
              <p className="text-sm opacity-90">
                {lastSaved.strokes} strokes recorded
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
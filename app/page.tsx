// app/play/page.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import MathCanvas from '@/components/canvas/MathCanvas';
import { generateProblem, MathProblem, Difficulty } from '@/lib/problemGenerator';
import { Stroke } from '@/types/strokes';

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
  
  // Ref to access canvas clear function
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
      
      setStats(prev => ({
        problemsAttempted: prev.problemsAttempted + 1,
        totalStrokes: prev.totalStrokes + sessionData.strokes.length,
        totalTimeMs: prev.totalTimeMs + duration,
      }));

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

      console.log('Submitting:', payload);
      await new Promise(r => setTimeout(r, 500));
      
      // Clear canvas before loading next problem
      canvasClearRef.current();
      
      // Load next problem
      setCurrentProblem(generateProblem(difficulty));
      
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to save. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentProblem, difficulty, sessionId]);

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    canvasClearRef.current(); // Also clear when changing difficulty
    setCurrentProblem(generateProblem(d));
  };

  if (!sessionId || !currentProblem) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
          Math Practice
        </h1>

        <div className="text-center text-sm text-gray-500 mb-4 font-mono">
          Session: {sessionId.slice(0, 8)}...
        </div>

        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d as Difficulty)}
              disabled={isSubmitting}
              className={`px-3 py-1 rounded-full text-sm font-medium transition
                ${difficulty === d 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                } disabled:opacity-50`}
            >
              Level {d}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4 md:gap-6 mb-4 text-xs md:text-sm text-gray-600 flex-wrap">
          <span className="bg-white px-3 py-1 rounded-full">Problems: {stats.problemsAttempted}</span>
          <span className="bg-white px-3 py-1 rounded-full">Strokes: {stats.totalStrokes}</span>
          <span className="bg-white px-3 py-1 rounded-full">
            Time: {Math.round(stats.totalTimeMs / 1000)}s
          </span>
        </div>

        <MathCanvas 
          problemText={`${currentProblem.expression} = ?`}
          onSubmit={handleSubmit}
          disabled={isSubmitting}
          onClearRef={canvasClearRef}  // Pass ref to get clear function
        />

        <div className="mt-6 p-3 bg-white rounded-lg text-xs font-mono text-gray-500 text-center">
          <p>Problem ID: {currentProblem.id.slice(0, 8)}...</p>
          <p>Type: {currentProblem.type} | Expected: {currentProblem.expectedAnswer}</p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Write your solution on the canvas above</p>
          <p className="text-xs text-gray-400 mt-1">Show your work! We care about process, not just answer.</p>
        </div>
      </div>
    </main>
  );
}
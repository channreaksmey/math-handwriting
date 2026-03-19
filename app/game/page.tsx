// app/game/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MathCanvas from '@/components/canvas/MathCanvas';
import { generateProblem, MathProblem, Difficulty } from '@/lib/problemGenerator';
import { Stroke, HandwritingSession } from '@/types/strokes';
import { submitHandwriting } from '@/lib/api';

interface SessionConfig {
    id: string;
    difficulty: Difficulty;
    problemCount: number;
    studentName: string;
    notes: string;
    startTime: number;
}

interface CompletedProblem {
    problem: MathProblem;
    strokes: Stroke[];
    duration: number;
    canvasWidth: number;
    canvasHeight: number;
    submittedToBackend: boolean;
}

export default function GamePage() {
  const router = useRouter();

  const [config] = useState<SessionConfig | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('sessionConfig');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as SessionConfig;
    } catch {
      return null;
    }
  });

  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(() => config ? generateProblem(config.difficulty) : null);
  const [completed, setCompleted] = useState<CompletedProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const canvasClearRef = useRef<() => void>(() => {});

  // Load config on mount
  useEffect(() => {
    if (!config) router.push('/setup');
  }, [config, router]);

  const handleSubmit = useCallback(async (sessionData: HandwritingSession) => {
    if (!config || !currentProblem) return;
    
    setIsSubmitting(true);
    
    const duration = sessionData.strokes.length > 0 
      ? sessionData.strokes[sessionData.strokes.length - 1].endTime - sessionData.strokes[0].startTime
      : 0;

    const completedProblem: CompletedProblem = {
        problem: currentProblem,
        strokes: sessionData.strokes,
        duration,
        canvasWidth: sessionData.canvasWidth,
        canvasHeight: sessionData.canvasHeight,
        submittedToBackend: false,
    };

    // Submit to backend
    try {
      const payload = {
        session_id: config.id,
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
          screen_size: { width: window.screen.width, height: window.screen.height },
        },
        submitted_answer: null,
        canvas_size: {
          width: sessionData.canvasWidth,
          height: sessionData.canvasHeight,
        },
      };

      await submitHandwriting(payload);
      completedProblem.submittedToBackend = true;
    } catch (error) {
      console.error('Backend submission failed:', error);
      // Still continue - data is in memory
    }

    const newCompleted = [...completed, completedProblem];
    setCompleted(newCompleted);

    // Check if session complete
    if (currentIndex + 1 >= config.problemCount) {
      // Store completed data for review page
      sessionStorage.setItem('sessionResults', JSON.stringify({
        config,
        problems: newCompleted,
        endTime: Date.now(),
      }));
      router.push('/review');
      return;
    }

    // Next problem
    setCurrentIndex(currentIndex + 1);
    canvasClearRef.current();
    setCurrentProblem(generateProblem(config.difficulty));
    setIsSubmitting(false);
  }, [config, currentProblem, completed, currentIndex, router]);

  const handleEarlyFinish = () => {
    if (completed.length === 0) {
      router.push('/setup');
      return;
    }
    sessionStorage.setItem('sessionResults', JSON.stringify({
      config,
      problems: completed,
      endTime: Date.now(),
    }));
    router.push('/review');
  };

  if (!config || !currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const progress = ((currentIndex) / config.problemCount) * 100;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-bold">{currentIndex + 1}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Problem {currentIndex + 1} of {config.problemCount}</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            End Session
          </button>
        </div>
      </header>

    {/* Main Game Area */}
    <main className="flex-1 min-h-0 w-full px-4 py-4">
        <div className="h-full w-full">
        <MathCanvas
            problemText={`${currentProblem.expression} = ?`}
            onSubmit={handleSubmit}
            disabled={isSubmitting}
            onClearRef={canvasClearRef}
            fillPage
        />
        </div>

  <p className="text-center text-gray-500 mt-4 text-sm">
    {currentIndex === 0 && "Great! Show your work on the canvas above."}
    {currentIndex > 0 && currentIndex < config.problemCount - 1 && "Keep going! You're doing great."}
    {currentIndex === config.problemCount - 1 && "Last one! Finish strong."}
  </p>
</main>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">End Session Early?</h3>
            <p className="text-gray-600 mb-4">
              You have completed {completed.length} of {config.problemCount} problems. 
              {completed.length > 0 ? " You can still review what's been done." : " No data will be saved."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
              >
                Continue
              </button>
              <button
                onClick={handleEarlyFinish}
                className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
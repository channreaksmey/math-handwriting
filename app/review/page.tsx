// app/review/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Stroke } from '@/types/strokes';
import { MathProblem } from '@/lib/problemGenerator';

interface SessionConfig {
  id: string;
  difficulty: number;
  problemCount: number;
  studentName: string;
  notes: string;
  startTime: number;
}

interface CompletedProblem {
  problem: MathProblem;
  strokes: Stroke[];
  duration: number;
  submittedToBackend: boolean;
  teacherNotes?: string;
  correct?: boolean;
}

interface SessionResults {
  config: SessionConfig;
  problems: CompletedProblem[];
  endTime: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('sessionResults');
    if (!stored) {
      router.push('/setup');
      return;
    }
    setResults(JSON.parse(stored));
  }, [router]);

  const handleNoteChange = (index: number, notes: string) => {
    if (!results) return;
    const updated = { ...results };
    updated.problems[index].teacherNotes = notes;
    setResults(updated);
    sessionStorage.setItem('sessionResults', JSON.stringify(updated));
  };

  const handleCorrectness = (index: number, correct: boolean) => {
    if (!results) return;
    const updated = { ...results };
    updated.problems[index].correct = correct;
    setResults(updated);
    sessionStorage.setItem('sessionResults', JSON.stringify(updated));
  };

  const exportSession = () => {
    if (!results) return;
    
    const exportData = {
      session_id: results.config.id,
      student_name: results.config.studentName,
      teacher_notes: results.config.notes,
      difficulty: results.config.difficulty,
      start_time: new Date(results.config.startTime).toISOString(),
      end_time: new Date(results.endTime).toISOString(),
      duration_seconds: Math.round((results.endTime - results.config.startTime) / 1000),
      problems: results.problems.map((p, i) => ({
        sequence: i + 1,
        expression: p.problem.expression,
        expected_answer: p.problem.expectedAnswer,
        stroke_count: p.strokes.length,
        duration_ms: p.duration,
        teacher_evaluation: {
          notes: p.teacherNotes || '',
          marked_correct: p.correct ?? null,
        },
        type: p.problem.type,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${results.config.id.slice(0, 8)}_${results.config.studentName || 'anonymous'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startNewSession = () => {
    sessionStorage.removeItem('sessionConfig');
    sessionStorage.removeItem('sessionResults');
    router.push('/setup');
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalDuration = Math.round((results.endTime - results.config.startTime) / 1000);
  const totalStrokes = results.problems.reduce((sum, p) => sum + p.strokes.length, 0);
  const evaluatedCount = results.problems.filter(p => p.correct !== undefined).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Session Review</h1>
              <p className="text-sm text-gray-500">
                {results.config.studentName || 'Anonymous'} • {results.problems.length} problems • {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportSession}
                className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium text-sm transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export JSON
              </button>
              <button
                onClick={startNewSession}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition"
              >
                New Session
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Problems</p>
            <p className="text-2xl font-bold text-gray-800">{results.problems.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Total Strokes</p>
            <p className="text-2xl font-bold text-indigo-600">{totalStrokes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Evaluated</p>
            <p className="text-2xl font-bold text-green-600">{evaluatedCount}/{results.problems.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Difficulty</p>
            <p className="text-2xl font-bold text-purple-600">Level {results.config.difficulty}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem List */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800 mb-3">Problems</h2>
            {results.problems.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedProblem(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedProblem === i
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">{p.problem.expression}</span>
                  <span className="text-xs text-gray-500">#{i + 1}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{p.strokes.length} strokes</span>
                  <span>{Math.round(p.duration / 1000)}s</span>
                  {p.submittedToBackend && (
                    <span className="text-green-600 text-xs">✓ Saved</span>
                  )}
                </div>
                {p.correct !== undefined && (
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                    p.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.correct ? 'Correct' : 'Incorrect'}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Detail View */}
          <div>
            {selectedProblem !== null ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">
                    Problem {selectedProblem + 1}: {results.problems[selectedProblem].problem.expression}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Expected: {results.problems[selectedProblem].problem.expectedAnswer} • 
                    Type: {results.problems[selectedProblem].problem.type}
                  </p>
                </div>

                {/* Canvas Preview (Static) */}
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <StaticCanvas strokes={results.problems[selectedProblem].strokes} />
                </div>

                {/* Evaluation */}
                <div className="p-4 space-y-4">
                  {/* Correctness */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Evaluation
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCorrectness(selectedProblem, true)}
                        className={`flex-1 py-3 rounded-lg font-medium transition ${
                          results.problems[selectedProblem].correct === true
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ✓ Correct
                      </button>
                      <button
                        onClick={() => handleCorrectness(selectedProblem, false)}
                        className={`flex-1 py-3 rounded-lg font-medium transition ${
                          results.problems[selectedProblem].correct === false
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ✗ Incorrect
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observations
                    </label>
                    <textarea
                      value={results.problems[selectedProblem].teacherNotes || ''}
                      onChange={(e) => handleNoteChange(selectedProblem, e.target.value)}
                      placeholder="What strategy did you observe? Any notes about the process..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Raw Stats */}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
                      <p>Strokes: {results.problems[selectedProblem].strokes.length}</p>
                      <p>Duration: {results.problems[selectedProblem].duration}ms</p>
                      <p>Points: {results.problems[selectedProblem].strokes.reduce((s, st) => s + st.points.length, 0)}</p>
                      <p>Backend: {results.problems[selectedProblem].submittedToBackend ? 'Saved' : 'Local only'}</p>
                    </div>
                  </details>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">Select a problem to review</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Static Canvas Component for Review
function StaticCanvas({ strokes }: { strokes: Stroke[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !strokes.length) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
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
    });
  }, [strokes]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}
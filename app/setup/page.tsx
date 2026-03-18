// app/setup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/lib/problemGenerator';

export default function TeacherSetup() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [problemCount, setProblemCount] = useState(5);
  const [studentName, setStudentName] = useState('');
  const [notes, setNotes] = useState('');

  const handleStart = () => {
    const sessionConfig = {
      id: crypto.randomUUID(),
      difficulty,
      problemCount,
      studentName: studentName || 'Anonymous',
      notes,
      startTime: Date.now(),
    };
    
    // Store in sessionStorage for the game to pick up
    sessionStorage.setItem('sessionConfig', JSON.stringify(sessionConfig));
    router.push('/game');
  };

  const difficultyLabels: Record<Difficulty, { title: string; desc: string; color: string }> = {
    1: { title: 'Level 1', desc: 'Single digit: +, −, ×, ÷', color: 'bg-green-100 border-green-300 text-green-800' },
    2: { title: 'Level 2', desc: 'Two digits: +, − (with/without carry)', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    3: { title: 'Level 3', desc: '×, ÷: single & double digits', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    4: { title: 'Level 4', desc: 'Multi-step: +, − mixed', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    5: { title: 'Level 5', desc: 'Multi-step: ×, ÷ mixed', color: 'bg-red-100 border-red-300 text-red-800' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Setup</h1>
          <p className="text-gray-500 mt-1">Configure the practice session</p>
        </div>

        {/* Student Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Student Name (Optional)
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name or ID"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Difficulty Level
          </label>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d as Difficulty)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  difficulty === d
                    ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${difficultyLabels[d as Difficulty].color}`}>
                      {difficultyLabels[d as Difficulty].title}
                    </span>
                    <p className="text-sm text-gray-600">{difficultyLabels[d as Difficulty].desc}</p>
                  </div>
                  {difficulty === d && (
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Problem Count */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Number of Problems: <span className="text-indigo-600 font-bold">{problemCount}</span>
          </label>
          <input
            type="range"
            min="5"
            max="10"
            value={problemCount}
            onChange={(e) => setProblemCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Session Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations about the student..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition resize-none"
          />
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
        >
          Start Session
        </button>
      </div>
    </div>
  );
}
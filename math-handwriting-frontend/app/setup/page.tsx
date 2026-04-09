// app/setup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
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

    sessionStorage.setItem('sessionConfig', JSON.stringify(sessionConfig));
    router.push('/game');
  };

  const difficultyLabels: Record<Difficulty, { title: string; desc: string; color: string }> = {
    1: { title: 'Level 1', desc: 'Single digit: +, -, *, /', color: 'bg-green-100 border-green-300 text-green-800' },
    2: { title: 'Level 2', desc: 'Two digits: +, - (with/without carry)', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    3: { title: 'Level 3', desc: '*, /: single and double digits', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    4: { title: 'Level 4', desc: 'Multi-step: +, - mixed', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    5: { title: 'Level 5', desc: 'Multi-step: *, / mixed', color: 'bg-red-100 border-red-300 text-red-800' },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Math Writer
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Features
            </Link>
            <Link href="/#about" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              About
            </Link>
            <Link href="/#get-started" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Get Started
            </Link>
          </nav>

        </div>
      </header>

    <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition mb-6" > 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> </svg> 
                    Back Home
                </Link>
            <section className="bg-white/70 backdrop-blur-sm border border-white rounded-3xl p-8 shadow-lg">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                Session Configuration
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Prepare a New Practice Session
                </h1>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Set difficulty, number of problems, and optional student context before launching the writing session.
                    This setup keeps your data collection consistent with your lesson goals.
                </p>

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

                <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Difficulty Level
                </label>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((d) => (
                    <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d as Difficulty)}
                        className={'w-full p-4 rounded-xl border-2 text-left transition-all ' + (
                            difficulty === d
                            ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                    )}
                    >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <span className={'inline-block px-2 py-1 rounded text-xs font-bold mb-1 border ' + difficultyLabels[d as Difficulty].color}>
                                {difficultyLabels[d as Difficulty].title}
                            </span>
                        <p className="text-sm text-gray-600">{difficultyLabels[d as Difficulty].desc}</p>
                        </div>
                            {difficulty === d && (
                                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
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

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Problems: <span className="text-indigo-600 font-bold">{problemCount}</span>
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="10"
                        value={problemCount}
                        onChange={(e) => setProblemCount(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>

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

                <button type="button" onClick={handleStart} className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                    Start Session
                </button>
            </section>

          
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 px-4 py-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="font-bold text-white">Math Writer</span>
            </div>
            <p className="text-sm text-gray-400">Data-driven math learning research platform.</p>
            <p className="text-sm text-gray-500">© 2026 Math Writer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
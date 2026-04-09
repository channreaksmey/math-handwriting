// app/page.tsx
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Math Writer
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              About
            </a>
            <a href="#get-started" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Get Started
            </a>
          </nav>

          
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Capture the Process, Not Just the Answer
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Math Writer is a data collection platform that records handwriting strokes, pressure, timing, and movement patterns as students solve math problems. Perfect for research, teaching analysis, and learning strategy insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/setup"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Practice Session
            </Link>
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-bold text-lg transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Capture</h3>
              <p className="text-gray-700">
                Captures every stroke with pressure, timing, and spatial data in real-time as students work through problems.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">5 Difficulty Levels</h3>
              <p className="text-gray-700">
                From single-digit operations to multi-step problems with multiplication and division. Scales with learner progress.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Data Export</h3>
              <p className="text-gray-700">
                Export session data as JSON for analysis, research, or integration with your learning management system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-4 py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Math Writer?
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Traditional math assessments only capture the final answer. Math Writer goes deeper—we record the entire problem-solving process. This gives educators and researchers unprecedented insight into student thinking patterns, strategies, and learning behaviors.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Whether you are analyzing learning strategies, researching cognitive patterns, or helping students reflect on their work, Math Writer provides the detailed process data you need.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section id="get-started" className="px-4 py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-blue-50 mb-8">
            Launch a new practice session and start capturing handwriting data right now.
          </p>
          <Link
            href="/setup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Launch Practice Session →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="font-bold text-white">Math Writer</span>
              </div>
              <p className="text-sm">Data-driven math learning research platform.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Quick Link</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Start Practice</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Email</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition">Telegram</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">
              © 2026 Math Writer. All rights reserved.
            </p>
            
          </div>
        </div>
      </footer>
    </div>
  );
}
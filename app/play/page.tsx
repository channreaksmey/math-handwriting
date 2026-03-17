// app/play/page.tsx
'use client';

import MathCanvas from '@/components/canvas/MathCanvas';

export default function PlayPage() {
  const handleSubmit = (sessionData: any) => {
    alert(`Captured ${sessionData.strokes.length} strokes! Check console.`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Math Practice
        </h1>
        
        <MathCanvas 
          problemText="7 + 5 = ?"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
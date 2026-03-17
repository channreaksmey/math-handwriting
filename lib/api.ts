// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function submitHandwriting(data: any) {
  const response = await fetch(`${API_URL}/api/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getSessionStats(sessionId: string) {
  const response = await fetch(`${API_URL}/api/stats/${sessionId}`);
  return response.json();
}
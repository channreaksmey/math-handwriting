const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const normalizedApiUrl = rawApiUrl && rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

const API_URL = normalizedApiUrl || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

function apiPath(path: string): string {
  return API_URL ? API_URL + path : path;
}

export async function submitHandwriting(data: unknown) {
  const response = await fetch(apiPath('/api/submit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('HTTP ' + response.status + ': ' + errorText);
  }

  return response.json();
}

export async function getSessionStats(sessionId: string) {
  const response = await fetch(apiPath('/api/stats/' + sessionId));
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}
const base = (import.meta.env.VITE_API_BASE || '') as string;

export async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const url = base.replace(/\/$/, '') + path;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const message = typeof data === 'string' && data ? data : (data?.error || res.statusText);
    throw new Error(message);
  }
  return data as T;
}

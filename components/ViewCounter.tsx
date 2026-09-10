'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export const ViewCounter = ({ slug }: { slug: string }) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const key = `viewed_${slug}`;
    let method: 'GET' | 'POST' = 'POST';
    try { method = sessionStorage.getItem(key) === 'true' ? 'GET' : 'POST'; } catch { method = 'POST'; }

    const loadCount = async () => {
      try {
        const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, { method, signal: controller.signal });
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (typeof data === 'object' && data !== null && 'count' in data && typeof data.count === 'number' && Number.isFinite(data.count)) {
          setCount(data.count);
          if (method === 'POST') {
            try { sessionStorage.setItem(key, 'true'); } catch { /* Ignore unavailable session storage. */ }
          }
        }
      } catch { /* Ignore unavailable API, malformed responses, and aborted requests. */ }
    };
    void loadCount();
    return () => controller.abort();
  }, [slug]);

  if (count === null) return null;
  return (
    <>
      <span className="mx-2 hidden sm:inline">•</span>
      <span className="hidden sm:inline-flex items-center gap-1" title="閲覧数">
        <Eye className="w-3.5 h-3.5" />
        {count.toLocaleString('ja-JP')}
      </span>
    </>
  );
};

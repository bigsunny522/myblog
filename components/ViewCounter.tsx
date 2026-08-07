'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  slug: string;
}

export const ViewCounter = ({ slug }: ViewCounterProps) => {
  const [views, setViews] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndIncrementView = async () => {
      if (!slug) return;

      const viewedKey = `viewed_${slug}`;
      const hasViewed = sessionStorage.getItem(viewedKey);
      // 未読の場合のみ /api/views/:slug (Cloudflare Pages Function + D1) を POST で叩いて +1、
      // 既読ならただの GET で現在値を取るだけ。
      const method = hasViewed ? 'GET' : 'POST';

      try {
        const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, { method });

        if (!res.ok) {
          console.error(
            `[ViewCounter] /api/views/${slug} が ${res.status} を返しました。` +
              'Cloudflare Pages の D1 バインディング(DB)とマイグレーション適用状況を確認してください。詳細: docs/view-counter-setup.md'
          );
          setViews(0);
          return;
        }

        const data = (await res.json()) as { count?: number };
        if (method === 'POST') {
          sessionStorage.setItem(viewedKey, 'true');
        }
        setViews(typeof data.count === 'number' ? data.count : 0);
      } catch (e) {
        console.error('[ViewCounter] 閲覧数の取得中に予期しないエラーが発生しました:', e);
        setViews(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndIncrementView();
  }, [slug]);

  if (isLoading && !views) {
    return (
      <span className="flex items-center gap-1 min-w-[3ch] animate-pulse bg-muted rounded h-4"></span>
    );
  }

  return (
    <span className="flex items-center gap-1" title="Total Views">
      <Eye className="w-3.5 h-3.5" />
      {views ? views.toLocaleString() : '0'}
    </span>
  );
};

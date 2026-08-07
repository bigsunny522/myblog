'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  slug: string;
}

export const ViewCounter = ({ slug }: ViewCounterProps) => {
  const [views, setViews] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = !isSupabaseConfigured;

  useEffect(() => {
    // Demo Mode implementation
    if (isDemoMode) {
      // NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定のため、
      // 閲覧数は実データではなくダミー値。本番でこれが出ている場合は
      // Cloudflare Pages の環境変数(Production 環境)が未設定 = 本番バグ。
      console.warn(
        '[ViewCounter] Supabase が未設定のためデモモードで動作中(閲覧数はダミー値)。' +
          '本番環境の場合は NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください。詳細: docs/view-counter-setup.md'
      );

      // Simulate network delay
      const timer = setTimeout(() => {
        // Generate a deterministic random number based on slug for consistent demo
        const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const demoViews = 100 + (hash % 1000);
        setViews(demoViews);
        setIsLoading(false);
      }, 500);

      const incrementTimer = setTimeout(() => {
          setViews(prev => (prev ? prev + 1 : null));
      }, 1500);

      return () => {
        clearTimeout(timer);
        clearTimeout(incrementTimer);
      };
    }

    // Real implementation
    const fetchAndIncrementView = async () => {
      if (!slug) return;

      const viewedKey = `viewed_${slug}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      try {
        if (!hasViewed) {
          // increment() は upsert 後の最新カウントを返す(supabase/schema.sql 参照)ため、
          // 別途 select し直す必要がなく、views テーブルへの SELECT 権限が無くても表示できる。
          const { data, error: rpcError } = await supabase.rpc('increment', { slug_text: slug });
          if (!rpcError) {
            sessionStorage.setItem(viewedKey, 'true');
            setViews(typeof data === 'number' ? data : 0);
            setIsLoading(false);
            return;
          }
          console.error('[ViewCounter] increment RPC に失敗しました。Supabase 側の RPC 定義・RLS 設定を確認してください:', rpcError);
        }

        const { data, error } = await supabase
          .from('views')
          .select('count')
          .match({ slug })
          .single();

        if (!error || error.code === 'PGRST116') {
          setViews(data?.count ?? 0);
        } else {
          console.error('[ViewCounter] views テーブルの取得に失敗しました。SELECT ポリシーを確認してください:', error);
          setViews(0);
        }
      } catch (e) {
        console.error('[ViewCounter] 閲覧数の取得中に予期しないエラーが発生しました:', e);
        setViews(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndIncrementView();
  }, [slug, isDemoMode]);

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

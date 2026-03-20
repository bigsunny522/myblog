'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  slug: string;
}

export const ViewCounter = ({ slug }: ViewCounterProps) => {
  const [views, setViews] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set this to false when Supabase is configured
  const isDemoMode = false; 

  useEffect(() => {
    // Demo Mode implementation
    if (isDemoMode) {
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
          const { error: rpcError } = await supabase.rpc('increment', { slug_text: slug });
          
          if (rpcError) {
            console.error('Error incrementing view:', rpcError.message, rpcError.code, rpcError.details);
          } else {
            sessionStorage.setItem(viewedKey, 'true');
          }
        }

        const { data, error } = await supabase
          .from('views')
          .select('count')
          .match({ slug })
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching views:', error.message, error.code, error.details);
        }

        if (data) {
          setViews(data.count);
        } else {
             setViews(0);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
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

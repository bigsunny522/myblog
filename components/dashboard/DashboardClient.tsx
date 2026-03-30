'use client';

import { useEffect, useRef, useState } from 'react';
import { useDashboardStore } from '@/lib/dashboard/store';
import { DashboardGrid } from './DashboardGrid';
import { DashboardSettings } from './DashboardSettings';

import type { DashboardTheme } from '@/lib/dashboard/types';

function getBackground(theme: DashboardTheme): React.CSSProperties {
  switch (theme.backgroundType) {
    case 'gradient':
      return { background: `linear-gradient(${theme.gradientDirection}, ${theme.gradientFrom}, ${theme.gradientTo})` };
    case 'image': {
      const src = theme.backgroundImageBase64 || theme.backgroundImageUrl;
      return {
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
      };
    }
    default:
      return { background: theme.backgroundColor };
  }
}

// グリッド行数・マージン・パディング（gridConfig と一致させる）
const GRID_ROWS = 12;
const GRID_MARGIN = 8;
const GRID_PADDING = 12;

function calcRowHeight(containerHeight: number): number {
  return Math.max(
    40,
    Math.floor((containerHeight - GRID_PADDING * 2 - (GRID_ROWS - 1) * GRID_MARGIN) / GRID_ROWS)
  );
}

export function DashboardClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1280);
  const [rowHeight, setRowHeight] = useState(80);
  const isEditMode = useDashboardStore((s) => s.isEditMode);
  const isSettingsOpen = useDashboardStore((s) => s.isSettingsOpen);
  const toggleEditMode = useDashboardStore((s) => s.toggleEditMode);
  const setSettingsOpen = useDashboardStore((s) => s.setSettingsOpen);
  const theme = useDashboardStore((s) => s.config.theme);

  // ダッシュボード中はbodyにdata-dashboard属性を付与してヘッダー/フッターを非表示
  useEffect(() => {
    document.body.setAttribute('data-dashboard', 'true');
    return () => document.body.removeAttribute('data-dashboard');
  }, []);

  // コンテナ幅・ウィンドウ高さをリアルタイムで測定し rowHeight を算出
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setWidth(el.clientWidth);
      setRowHeight(calcRowHeight(window.innerHeight));
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const bgStyle = getBackground(theme);
  const hasImage = theme.backgroundType === 'image' && (theme.backgroundImageBase64 || theme.backgroundImageUrl);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{
        ...bgStyle,
        // CSS変数でアクセントカラーをウィジェットに伝達
        ['--dash-accent' as string]: theme.accentColor,
      }}
    >
      {/* 画像背景のオーバーレイ */}
      {hasImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(0,0,0,${theme.backgroundOverlayOpacity})` }}
        />
      )}

      {/* グリッド */}
      <div className="relative z-10 h-full">
        <DashboardGrid width={width} rowHeight={rowHeight} maxRows={GRID_ROWS} />
      </div>

      {/* コントロールバー */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={toggleEditMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isEditMode ? '' : 'opacity-70 hover:opacity-100 bg-white/10'}`}
          style={isEditMode ? { background: theme.accentColor, color: '#0f172a' } : { color: theme.textColor }}
        >
          {isEditMode ? '✏️ 編集中' : '✏️ 編集'}
        </button>
        <button
          onClick={() => { setSettingsOpen(!isSettingsOpen); if (isSettingsOpen) useDashboardStore.getState().setEditingWidget(null); }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 bg-white/10"
          style={{ color: theme.textColor }}
        >
          ⚙️ 設定
        </button>
        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 bg-white/10"
          style={{ color: theme.textColor }}
        >
          ⛶ フルスクリーン
        </button>
      </div>

      {/* 設定パネル */}
      <DashboardSettings />

      {/* 設定パネルのオーバーレイ */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        />
      )}
    </div>
  );
}

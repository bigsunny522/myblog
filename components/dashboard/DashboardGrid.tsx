'use client';

import { useCallback, useRef, useMemo, useState } from 'react';
import { GridLayout, verticalCompactor } from 'react-grid-layout';
import type { Layout, Compactor } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboardStore } from '@/lib/dashboard/store';
import { WidgetWrapper } from './WidgetWrapper';
import type { WidgetLayout } from '@/lib/dashboard/types';

type RGLLayout = readonly WidgetLayout[];

export function DashboardGrid({ width, rowHeight, maxRows }: { width: number; rowHeight: number; maxRows: number }) {
  const widgets = useDashboardStore((s) => s.config.widgets);
  const layouts = useDashboardStore((s) => s.config.layouts);
  const isEditMode = useDashboardStore((s) => s.isEditMode);
  const cols = useDashboardStore((s) => s.config.cols);
  const setLayouts = useDashboardStore((s) => s.setLayouts);

  const lastValidLayout = useRef<WidgetLayout[]>(
    (layouts as WidgetLayout[]).map((item) => ({ ...item }))
  );
  const [resetKey, setResetKey] = useState(0);
  const isReverting = useRef(false);

  // isDragging: onDragStart/onResizeStart〜onDragStop/onResizeStop の間だけ true
  // hadInteraction: ドラッグ開始後、onLayoutChange が最終処理するまで true
  const isDragging = useRef(false);
  const hadInteraction = useRef(false);

  const captureLayout = useCallback(() => {
    isDragging.current = true;
    hadInteraction.current = true;
    lastValidLayout.current = (layouts as WidgetLayout[]).map((item) => ({ ...item }));
  }, [layouts]);

  // onDragStop/onResizeStop: ドラッグ終了を記録（onLayoutChange より先に発火する）
  const releaseInteract = useCallback(() => {
    isDragging.current = false;
  }, []);

  // コンパクタ: ドラッグ中（isDragging=true）にオーバーフローしたら lastValidLayout に戻す
  // isDragging フラグはドロップまでリセットされないため、
  // onLayoutChange が複数回発火しても保護が維持される
  const boundedCompactor = useMemo((): Compactor => ({
    type: 'vertical' as const,
    allowOverlap: false,
    compact(layout: Layout, cols: number): Layout {
      const compacted = verticalCompactor.compact(layout, cols);
      if (isDragging.current) {
        const overflow = compacted.some((item) => item.y + item.h > maxRows);
        if (overflow) return lastValidLayout.current as Layout;
      }
      return compacted;
    },
  }), [maxRows]);

  const onLayoutChange = useCallback(
    (newLayout: RGLLayout) => {
      // GridLayout 再マウント直後の発火をスキップ
      if (isReverting.current) {
        isReverting.current = false;
        return;
      }
      // ドラッグ中の発火は無視（onDragStop より前に何度も呼ばれる）
      if (isDragging.current) return;
      // 初期マウント等インタラクションなしの発火は無視
      if (!hadInteraction.current) return;
      hadInteraction.current = false;

      const overflow = newLayout.some((item) => item.y + item.h > maxRows);
      if (overflow) {
        // コンパクタが弾けなかった場合の最終フェールセーフ: スナップバック
        isReverting.current = true;
        setResetKey((k) => k + 1);
        return;
      }
      const next = newLayout.map((item) => ({ ...item })) as WidgetLayout[];
      lastValidLayout.current = next;
      setLayouts(next);
    },
    [setLayouts, maxRows]
  );

  return (
    <GridLayout
      key={resetKey}
      layout={layouts as RGLLayout}
      width={width}
      gridConfig={{ cols, rowHeight, maxRows, margin: [8, 8], containerPadding: [12, 12] }}
      dragConfig={{ enabled: isEditMode, handle: '.drag-handle' }}
      resizeConfig={{ enabled: isEditMode }}
      compactor={boundedCompactor}
      onDragStart={captureLayout}
      onDragStop={releaseInteract}
      onResizeStart={captureLayout}
      onResizeStop={releaseInteract}
      onLayoutChange={onLayoutChange}
      className="layout"
    >
      {widgets.map((widget) => (
        <div key={widget.id} className="relative h-full">
          <WidgetWrapper widget={widget} />
        </div>
      ))}
    </GridLayout>
  );
}

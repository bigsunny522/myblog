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

  // 直前の有効なレイアウト（スナップバック用・常に最新の有効状態を保持）
  const lastValidLayout = useRef<WidgetLayout[]>(
    (layouts as WidgetLayout[]).map((item) => ({ ...item }))
  );
  const isInteracting = useRef(false);
  const [resetKey, setResetKey] = useState(0);
  // 再マウント直後の onLayoutChange をスキップするフラグ
  const isReverting = useRef(false);

  const captureLayout = useCallback(() => {
    isInteracting.current = true;
    lastValidLayout.current = (layouts as WidgetLayout[]).map((item) => ({ ...item }));
  }, [layouts, maxRows]);

  // isInteracting のリセットは onLayoutChange で行う（compact より後に確実に呼ばれるため）
  const releaseInteract = useCallback(() => {}, []);

  // カスタムコンパクタ: ドラッグ中にオーバーフローが発生したら即スナップバック
  const boundedCompactor = useMemo((): Compactor => ({
    type: 'vertical' as const,
    allowOverlap: false,
    compact(layout: Layout, cols: number): Layout {
      const compacted = verticalCompactor.compact(layout, cols);
      const overflow = compacted.some((item) => item.y + item.h > maxRows);
      if (isInteracting.current && overflow) {
        return lastValidLayout.current as Layout;
      }
      return compacted;
    },
  }), [maxRows]);

  // ドラッグ・リサイズ終了後の最終チェック
  // onLayoutChange はドラッグ中には呼ばれず、終了時に1回だけ呼ばれる
  const onLayoutChange = useCallback(
    (newLayout: RGLLayout) => {
      // 再マウント直後の onLayoutChange はスキップ（ストアは既に lastValidLayout）
      if (isReverting.current) {
        isReverting.current = false;
        isInteracting.current = false;
        return;
      }
      // ここで false にすることで compact（drop 直前）では必ず isInteracting=true を保証する
      isInteracting.current = false;
      const overflow = newLayout.some((item) => item.y + item.h > maxRows);
      if (overflow) {
        // ストアは既に lastValidLayout（captureLayout で保存済み）なので setLayouts は不要
        // key を変えて GridLayout を再マウントさせ、layout prop を強制的に再読み込みする
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

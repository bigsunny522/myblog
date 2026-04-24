import type { Metadata } from 'next';
import { ImageEditor } from '@/components/ImageEditor';

export const metadata: Metadata = {
  title: '画像エディター',
  description: '画像に透かし（ウォーターマーク）やフレームを追加して、ダウンロードできるブラウザベースの画像編集ツールです。',
  robots: { index: false },
};

export default function ImageEditorPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="mb-10 text-center space-y-3">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Image Editor
        </h1>
        <p className="text-muted-foreground text-sm">
          画像をアップロードして透かし・フレームを追加できます。すべてブラウザ内で処理されます。
        </p>
      </div>

      <ImageEditor />
    </div>
  );
}

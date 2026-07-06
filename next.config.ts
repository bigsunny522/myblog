import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // 'export' は本番ビルド時のみ有効(開発時は無効にして dev サーバーの利便性を保つ)
  output: isDev ? undefined : 'export',
  images: {
    loader: 'custom',
    imageSizes: [16, 32, 64, 128, 256],
    deviceSizes: [640, 750, 1080, 1200, 1920],
  },
  transpilePackages: ['next-image-export-optimizer'],
  env: {
    nextImageExportOptimizer_imageFolderPath: 'public/images',
    nextImageExportOptimizer_exportFolderPath: 'out',
    nextImageExportOptimizer_quality: '75',
    nextImageExportOptimizer_storePicturesInWEBP: 'true',
    nextImageExportOptimizer_exportFolderName: 'nextImageExportOptimizer',
    nextImageExportOptimizer_generateAndUseBlurImages: 'true',
    nextImageExportOptimizer_remoteImageCacheTTL: '0',
  },
};

export default nextConfig;

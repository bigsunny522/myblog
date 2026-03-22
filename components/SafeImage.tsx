"use client";

import React from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeImage({ fallbackSrc = '/images/main/skyblue.png', ...props }: SafeImageProps) {
  return (
    <img
      {...props}
      onError={(e) => {
        const target = e.currentTarget;
        target.onerror = null; // 無限ループ防止
        if (fallbackSrc && target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        }
      }}
    />
  );
}

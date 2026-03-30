"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageModalProps {
  src?: string;
  alt?: string;
  className?: string;
  maxWidth?: string;
  [key: string]: any;
}

export const ImageModal = ({ src, alt, className, maxWidth, ...props }: ImageModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!src) return null;

  // aspectまたは固定高さ指定がある場合はh-fullでスパンを埋め、ない場合は自然な高さ(h-auto)を使う
  const hasFixedHeight = !!(className && (className.includes("aspect-") || className.includes("h-full") || className.includes("h-[")));
  const imgFit = hasFixedHeight ? "h-full object-cover" : "h-auto";

  return (
    <>
      {/* Thumbnail wrapper */}
      <span
        className={`relative cursor-zoom-in group block overflow-hidden ${className ?? ""}${maxWidth ? " mx-auto" : ""}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={open}
        role="button"
        aria-label="画像を拡大"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && open()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          className={`w-full ${imgFit} block transition-transform duration-300 group-hover:scale-[1.04]`}
          {...props}
        />
        {/* Hover overlay */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
          <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
        </span>
      </span>

      {/* Modal – rendered in-tree with fixed positioning, no portal needed */}
      {isOpen && (
        <span
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={close}
        >
          {/* Backdrop */}
          <span
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            aria-hidden="true"
          />
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ""}
            className="relative z-10 max-w-[92vw] max-h-[92vh] object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-6 h-6" />
          </button>
        </span>
      )}
    </>
  );
};

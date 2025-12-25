"use client";

import { useState, useRef, useEffect, memo } from "react";

interface ReaderImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

// Memoized component to prevent unnecessary re-renders
export const ReaderImage = memo(function ReaderImage({
  src,
  alt,
  priority = false
}: ReaderImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset states when src changes
    setLoaded(false);
    setError(false);
  }, [src]);

  // Preload next images for smoother scrolling
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-muted/30"
      style={{
        // Prevent layout shift with min-height
        minHeight: loaded ? 'auto' : '300px',
        // Use contain for better render performance
        contain: 'layout paint'
      }}
    >
      {/* Skeleton loader - Simplified for performance */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Không thể tải hình</span>
            <button
              onClick={() => {
                setError(false);
                setLoaded(false);
                if (imgRef.current) {
                  imgRef.current.src = src;
                }
              }}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Actual image - Optimized */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`w-full h-auto will-change-opacity ${loaded ? "opacity-100" : "opacity-0"
          }`}
        style={{
          transition: 'opacity 150ms ease-out',
          // Hardware acceleration
          transform: 'translateZ(0)'
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
});

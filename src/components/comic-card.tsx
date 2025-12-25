"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Comic } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { useState } from "react";

interface ComicCardProps {
  comic: Comic;
  cdnUrl: string;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  showBookmark?: boolean;
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export function ComicCard({
  comic,
  cdnUrl,
  showBadge = false,
  badgeText = "HOT",
  badgeVariant = "destructive",
}: ComicCardProps) {
  const imageUrl = getImageUrl(cdnUrl, comic.thumb_url);
  const latestChapter = comic.chaptersLatest?.[0];
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/truyen/${comic.slug}`}
      className="group relative flex flex-col h-full"
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] w-full bg-muted/50">
        {/* Skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <Image
          src={imageUrl}
          alt={comic.name}
          fill
          sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
          quality={85}
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badge */}
        {showBadge && (
          <Badge
            variant={badgeVariant}
            className="absolute top-2 left-2 text-[10px] font-bold shadow-lg"
          >
            {badgeText}
          </Badge>
        )}

        {/* Hover Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-4">
          <span className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Đọc Ngay
          </span>
        </div>
      </div>

      {/* Info - Fixed height */}
      <div className="flex flex-col gap-1 pt-2 flex-1 min-h-[60px]">
        <h3 className="text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {comic.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-auto">
          {latestChapter && (
            <span className="text-xs text-primary font-medium">
              Ch. {latestChapter.chapter_name}
            </span>
          )}
          {comic.updatedAt && (
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(comic.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Skeleton for loading state
export function ComicCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] w-full bg-muted/50 animate-pulse" />
      <div className="flex flex-col gap-2 pt-2 min-h-[60px]">
        <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
        <div className="h-3 w-2/3 bg-muted/50 animate-pulse rounded" />
        <div className="flex justify-between mt-auto">
          <div className="h-3 w-16 bg-muted/50 animate-pulse rounded" />
          <div className="h-3 w-20 bg-muted/50 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}


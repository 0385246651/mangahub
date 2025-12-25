"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ReadingHistoryItem {
  comicSlug: string;
  comicName: string;
  thumbUrl: string;
  chapterName: string;
  chapterTitle?: string;
  readAt: number;
}

// Local storage functions
function getReadingHistory(): ReadingHistoryItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("mangahub_reading_history");
  return data ? JSON.parse(data) : [];
}

function clearReadingHistory() {
  localStorage.removeItem("mangahub_reading_history");
}

export default function ReadingHistoryPage() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHistory(getReadingHistory());
    setLoading(false);
  }, []);

  const handleClear = () => {
    clearReadingHistory();
    setHistory([]);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (loading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors cursor-pointer">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Lịch sử đọc</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Lịch sử đọc</h1>
        {history.length > 0 && (
          <Button variant="outline" onClick={handleClear} className="cursor-pointer">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Xóa tất cả
          </Button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid gap-4">
          {history.map((item, index) => (
            <Link
              key={`${item.comicSlug}-${item.chapterName}-${index}`}
              href={`/truyen/${item.comicSlug}/${item.chapterName}`}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.thumbUrl}
                  alt={item.comicName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {item.comicName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  Chapter {item.chapterName}
                  {item.chapterTitle && `: ${item.chapterTitle}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(item.readAt)}
                </p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="h-16 w-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Chưa có lịch sử đọc</h3>
          <p className="text-muted-foreground mb-6">
            Bắt đầu đọc truyện để lưu lịch sử tại đây.
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/">Khám phá truyện</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

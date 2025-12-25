"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Chapter {
  chapter_name: string;
  chapter_title?: string;
}

interface ChapterListProps {
  chapters: Chapter[];
  comicSlug: string;
}

export function ChapterList({ chapters, comicSlug }: ChapterListProps) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Deduplicate chapters by chapter_name (keep first occurrence)
  const uniqueChapters = useMemo(() => {
    const seen = new Set<string>();
    return chapters.filter((chapter) => {
      if (seen.has(chapter.chapter_name)) {
        return false;
      }
      seen.add(chapter.chapter_name);
      return true;
    });
  }, [chapters]);

  // Sort chapters by chapter number
  const sortedChapters = useMemo(() => {
    return [...uniqueChapters].sort((a, b) => {
      const numA = parseFloat(a.chapter_name) || 0;
      const numB = parseFloat(b.chapter_name) || 0;
      return sortOrder === "desc" ? numB - numA : numA - numB;
    });
  }, [uniqueChapters, sortOrder]);

  // Find the newest chapter (highest number)
  const newestChapterName = useMemo(() => {
    if (uniqueChapters.length === 0) return null;
    const maxChapter = uniqueChapters.reduce((max, ch) => {
      const numMax = parseFloat(max.chapter_name) || 0;
      const numCh = parseFloat(ch.chapter_name) || 0;
      return numCh > numMax ? ch : max;
    }, uniqueChapters[0]);
    return maxChapter.chapter_name;
  }, [uniqueChapters]);

  const toggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Header with Sort Button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Danh sách chương ({uniqueChapters.length})
        </h2>

        {/* Sort Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSort}
          className="flex items-center gap-2 cursor-pointer"
        >
          {sortOrder === "desc" ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 4h13M3 8h9M3 12h5m8 0l4 4m0-4l-4 4m4-4H12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Mới → Cũ</span>
              <span className="sm:hidden">DESC</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 4h13M3 8h9M3 12h5m4 0l4-4m0 4l-4-4m4 4H12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Cũ → Mới</span>
              <span className="sm:hidden">ASC</span>
            </>
          )}
        </Button>
      </div>

      {/* Chapter List */}
      <div className="max-h-[600px] overflow-y-auto">
        {/* List Header */}
        <div className="grid grid-cols-12 px-6 py-3 bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10 border-b border-border">
          <div className="col-span-8">Tên chương</div>
          <div className="col-span-4 text-right">Cập nhật</div>
        </div>

        {/* Chapter Items */}
        <div className="divide-y divide-border">
          {sortedChapters.map((chapter) => (
            <Link
              key={chapter.chapter_name}
              href={`/truyen/${comicSlug}/${chapter.chapter_name}`}
              className="grid grid-cols-12 px-6 py-4 hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div className="col-span-8 flex items-center gap-3">
                <span className="font-medium group-hover:text-primary transition-colors">
                  Chapter {chapter.chapter_name}
                  {chapter.chapter_title && `: ${chapter.chapter_title}`}
                </span>
                {/* NEW badge only on the newest chapter (highest number) */}
                {chapter.chapter_name === newestChapterName && (
                  <Badge
                    variant="default"
                    className="text-[10px] font-bold animate-pulse"
                  >
                    NEW
                  </Badge>
                )}
              </div>
              <div className="col-span-4 flex items-center justify-end text-muted-foreground text-sm">
                --
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

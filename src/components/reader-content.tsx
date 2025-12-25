"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { ReaderImage } from "./reader-image";
import { ReaderBookmark } from "./reader-bookmark";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { addToReadingHistory } from "@/lib/reading-history";
import { Input } from "@/components/ui/input";

interface ChapterItem {
  chapter_name: string;
  chapter_title: string;
}

interface ChapterImage {
  image_page: number;
  image_file: string;
}

interface ReaderContentProps {
  comic: {
    name: string;
    slug: string;
    thumb_url: string;
  };
  cdnUrl: string;
  chapterId: string;
  chapterTitle?: string;
  chapters: ChapterItem[];
  chapterImages: ChapterImage[];
  imageBaseUrl: string;
  prevChapter: ChapterItem | null;
  nextChapter: ChapterItem | null;
}

export function ReaderContent({
  comic,
  cdnUrl,
  chapterId,
  chapterTitle,
  chapters,
  chapterImages,
  imageBaseUrl,
  prevChapter,
  nextChapter,
}: ReaderContentProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter chapters for selector
  const filteredChapters = useMemo(() => {
    if (!searchQuery) return uniqueChapters;
    return uniqueChapters.filter(
      (ch) =>
        ch.chapter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ch.chapter_title &&
          ch.chapter_title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [uniqueChapters, searchQuery]);

  // Prefetch next/prev chapters for instant navigation
  useEffect(() => {
    if (nextChapter) {
      router.prefetch(`/truyen/${comic.slug}/${nextChapter.chapter_name}`);
    }
    if (prevChapter) {
      router.prefetch(`/truyen/${comic.slug}/${prevChapter.chapter_name}`);
    }
  }, [router, comic.slug, nextChapter, prevChapter]);

  // Reset loading state when chapterId changes (navigation complete)
  useEffect(() => {
    setIsNavigating(false);
    setIsSelectorOpen(false); // Close selector on route change
  }, [chapterId]);

  // Save to reading history on mount
  useEffect(() => {
    addToReadingHistory({
      comicSlug: comic.slug,
      comicName: comic.name,
      thumbUrl: `${cdnUrl}/uploads/comics/${comic.thumb_url}`,
      chapterName: chapterId,
      chapterTitle: chapterTitle,
    });
  }, [comic.slug, comic.name, comic.thumb_url, cdnUrl, chapterId, chapterTitle]);

  const navigateToChapter = useCallback((targetChapterId: string) => {
    if (targetChapterId === chapterId) {
      setIsSelectorOpen(false);
      return;
    }
    setIsNavigating(true);
    setIsSelectorOpen(false);
    router.push(`/truyen/${comic.slug}/${targetChapterId}`);
  }, [router, comic.slug, chapterId]);

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="font-medium text-primary animate-pulse">Đang chuyển chương...</span>
          </div>
        </div>
      )}

      {/* Chapter Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsSelectorOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[80vh] sm:max-h-[600px] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Danh sách chương</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSelectorOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border bg-muted/30">
              <Input
                placeholder="Tìm số chương..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-1 gap-1">
                {filteredChapters.map((ch) => (
                  <button
                    key={ch.chapter_name}
                    ref={ch.chapter_name === chapterId ? (node) => {
                      if (node && isSelectorOpen) {
                        setTimeout(() => {
                          node.scrollIntoView({ block: "center", behavior: "smooth" });
                        }, 100);
                      }
                    } : null}
                    onClick={() => navigateToChapter(ch.chapter_name)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors text-left ${ch.chapter_name === chapterId
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted"
                      }`}
                  >
                    <span>Chapter {ch.chapter_name}</span>
                    {ch.chapter_title && (
                      <span className={`text-sm truncate max-w-[150px] ${ch.chapter_name === chapterId ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}>
                        {ch.chapter_title}
                      </span>
                    )}
                  </button>
                ))}
                {filteredChapters.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Không tìm thấy chương nào
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container max-w-screen-xl mx-auto px-4 md:px-10 py-2 flex items-center justify-between">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4 overflow-hidden">
            <Link
              href={`/truyen/${comic.slug}`}
              className="flex items-center justify-center size-9 rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10 19l-7-7 7-7m-7 7h18"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <div className="flex flex-col min-w-0">
              <h2 className="text-base md:text-lg font-bold leading-tight tracking-tight truncate">
                {comic.name}
              </h2>
              <span className="text-muted-foreground text-xs font-medium truncate">
                Chapter {chapterId}
                {chapterTitle && `: ${chapterTitle}`}
              </span>
            </div>
          </div>

          {/* Right: Bookmark */}
          <ReaderBookmark
            comic={{
              slug: comic.slug,
              name: comic.name,
              thumbUrl: `${cdnUrl}/uploads/comics/${comic.thumb_url}`,
            }}
          />
        </div>
      </header>

      {/* Main Reading Area - Optimized spacing */}
      <main className="flex-1 flex flex-col items-center pt-[50px] pb-32 min-h-screen w-full">
        <div className="w-full max-w-[900px] flex flex-col items-center">
          {/* Breadcrumbs - Compact spacing */}
          <div className="w-full px-4 mb-2 mt-2">
            <div className="flex flex-wrap items-center gap-2 text-base font-medium">
              <Link
                href="/"
                className="text-muted-foreground/80 hover:text-primary transition-colors"
              >
                Home
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <Link
                href={`/truyen/${comic.slug}`}
                className="text-muted-foreground/80 hover:text-primary transition-colors"
              >
                {comic.name}
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-bold text-foreground">Chapter {chapterId}</span>
            </div>
          </div>

          {/* Comic Images with Optimized Loading */}
          {chapterImages.length > 0 && imageBaseUrl ? (
            <div className="w-full">
              {chapterImages.map((img, index) => (
                <ReaderImage
                  key={img.image_page}
                  src={`${imageBaseUrl}/${img.image_file}`}
                  alt={`Page ${img.image_page}`}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="w-full max-w-[600px] p-12 text-center">
              <p className="text-muted-foreground">
                Không thể tải hình ảnh chương này. Vui lòng thử lại sau.
              </p>
            </div>
          )}

          {/* End of Chapter Actions */}
          <div className="w-full max-w-[600px] mt-12 px-4">
            <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-card border border-border">
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-4">
                Hết Chapter {chapterId}
              </p>

              {/* Navigation Big Buttons */}
              <div className="flex flex-col sm:flex-row w-full gap-3">
                {prevChapter ? (
                  <button
                    onClick={() => navigateToChapter(prevChapter.chapter_name)}
                    className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 19l-7-7 7-7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Chap Trước
                  </button>
                ) : (
                  <Button variant="outline" className="flex-1" disabled>
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 19l-7-7 7-7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Chap Trước
                  </Button>
                )}
                {nextChapter ? (
                  <button
                    onClick={() => navigateToChapter(nextChapter.chapter_name)}
                    className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Chap Sau
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <Button className="flex-1" disabled>
                    Chap Sau
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Control Bar - Fixed Bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full md:w-[96%] max-w-[700px] md:bottom-4">
        <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gradient-to-r from-card/98 via-card to-card/98 backdrop-blur-xl border-t md:border border-border/50 md:rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/5 pb-safe">
          {/* Prev Button */}
          {prevChapter ? (
            <button
              onClick={() => navigateToChapter(prevChapter.chapter_name)}
              className="flex items-center justify-center size-12 sm:size-14 rounded-xl sm:rounded-2xl bg-muted/80 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer group active:scale-95"
              title="Chap Trước"
              disabled={isNavigating}
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center justify-center size-12 sm:size-14 rounded-xl sm:rounded-2xl bg-muted/30 opacity-40 cursor-not-allowed">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Chapter Selector Trigger - Enhanced */}
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="w-full h-12 sm:h-14 bg-muted/50 hover:bg-muted/80 border-0 rounded-xl sm:rounded-2xl flex items-center justify-between px-4 transition-colors cursor-pointer group"
            >
              <span className="text-sm sm:text-base font-medium truncate">
                Chapter {chapterId}
                <span className="opacity-70 font-normal ml-1">
                  {uniqueChapters.length > 0 && ` / ${uniqueChapters.length}`}
                </span>
              </span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Next Button */}
          {nextChapter ? (
            <button
              onClick={() => navigateToChapter(nextChapter.chapter_name)}
              className="flex items-center justify-center size-12 sm:size-14 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer group active:scale-95 shadow-lg shadow-primary/25"
              title="Chap Sau"
              disabled={isNavigating}
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center justify-center size-12 sm:size-14 rounded-xl sm:rounded-2xl bg-muted/30 opacity-40 cursor-not-allowed">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

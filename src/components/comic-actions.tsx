"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/bookmark-button";

interface ComicActionsProps {
  comic: {
    slug: string;
    name: string;
    thumbUrl: string;
  };
  firstChapterName?: string;
  latestChapter?: string;
}

export function ComicActions({ comic, firstChapterName, latestChapter }: ComicActionsProps) {
  const bookmarkData = {
    slug: comic.slug,
    name: comic.name,
    thumbUrl: comic.thumbUrl,
    latestChapter,
  };

  return (
    <div className="flex flex-wrap gap-3 mt-auto">
      {firstChapterName && (
        <Button asChild size="lg" className="shadow-lg shadow-primary/25">
          <Link href={`/truyen/${comic.slug}/${firstChapterName}`}>
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Đọc Ngay
          </Link>
        </Button>
      )}

      <BookmarkButton comic={bookmarkData} size="lg" />

      <Button variant="ghost" size="icon" className="size-12">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/types";

interface GenresSidebarProps {
  genres: Category[];
}

export function GenresSidebar({ genres }: GenresSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Default genres if API not available
  const defaultGenres: Category[] = [
    { id: "1", name: "Action", slug: "action" },
    { id: "2", name: "Adventure", slug: "adventure" },
    { id: "3", name: "Comedy", slug: "comedy" },
    { id: "4", name: "Drama", slug: "drama" },
    { id: "5", name: "Fantasy", slug: "fantasy" },
    { id: "6", name: "Shounen", slug: "shounen" },
    { id: "7", name: "Horror", slug: "horror" },
    { id: "8", name: "Isekai", slug: "isekai" },
    { id: "9", name: "Romance", slug: "romance" },
    { id: "10", name: "School Life", slug: "school-life" },
  ];

  const allGenres = genres.length > 0 ? genres : defaultGenres;

  // On mobile: show 15 initially, expandable to all
  // On tablet/desktop: show all
  const mobileInitialCount = 15;
  const displayGenres = isExpanded ? allGenres : allGenres.slice(0, mobileInitialCount);
  const hasMore = allGenres.length > mobileInitialCount;

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Thể Loại
        <span className="text-xs font-normal text-muted-foreground">
          ({allGenres.length})
        </span>
      </h3>

      {/* Desktop/Tablet: Show all genres */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {allGenres.map((genre) => (
          <Link key={genre.id || genre.slug} href={`/the-loai/${genre.slug}`}>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
            >
              {genre.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Mobile: Show limited with expand button */}
      <div className="sm:hidden">
        <div className="flex flex-wrap gap-2">
          {displayGenres.map((genre) => (
            <Link key={genre.id || genre.slug} href={`/the-loai/${genre.slug}`}>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
              >
                {genre.name}
              </Badge>
            </Link>
          ))}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-primary cursor-pointer"
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 15l7-7 7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Thu gọn
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Xem thêm ({allGenres.length - mobileInitialCount})
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

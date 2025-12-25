"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { addBookmark, removeBookmark, isBookmarked } from "@/lib/bookmarks";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  comic: {
    slug: string;
    name: string;
    thumbUrl: string;
    latestChapter?: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function BookmarkButton({
  comic,
  variant = "outline",
  size = "default",
  className = "",
  showText = true,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBookmark = async () => {
      if (user) {
        try {
          const result = await isBookmarked(user.uid, comic.slug);
          setBookmarked(result);
        } catch (error) {
          console.error("Error checking bookmark:", error);
        }
      }
      setChecking(false);
    };

    checkBookmark();
  }, [user, comic.slug]);

  const handleToggleBookmark = async () => {
    if (!user) {
      router.push("/dang-nhap");
      return;
    }

    setLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(user.uid, comic.slug);
        setBookmarked(false);
      } else {
        await addBookmark(user.uid, comic);
        setBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <svg
          className="animate-spin h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </Button>
    );
  }

  return (
    <Button
      variant={bookmarked ? "default" : variant}
      size={size}
      className={`cursor-pointer ${className}`}
      onClick={handleToggleBookmark}
      disabled={loading}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : bookmarked ? (
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {showText && (
        <span className="ml-2">{bookmarked ? "Đang theo dõi" : "Theo dõi"}</span>
      )}
    </Button>
  );
}

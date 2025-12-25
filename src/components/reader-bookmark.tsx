"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isBookmarked, addBookmark, removeBookmark } from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";

interface ReaderBookmarkProps {
  comic: {
    slug: string;
    name: string;
    thumbUrl: string;
    latestChapter?: string;
  };
  className?: string;
}

export function ReaderBookmark({ comic, className = "" }: ReaderBookmarkProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

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
    };

    checkBookmark();
  }, [user, comic.slug]);

  const handleToggle = async () => {
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={`gap-2 ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : bookmarked ? (
        <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="hidden md:inline">
        {bookmarked ? "Đang theo dõi" : "Theo dõi"}
      </span>
    </Button>
  );
}

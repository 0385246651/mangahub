"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { getBookmarks, removeBookmark, BookmarkedComic } from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedComic[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/dang-nhap");
      return;
    }

    const fetchBookmarks = async () => {
      if (user) {
        try {
          const data = await getBookmarks(user.uid);
          setBookmarks(data);
        } catch (error) {
          console.error("Error fetching bookmarks:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchBookmarks();
    }
  }, [user, authLoading, router]);

  const handleRemoveBookmark = async (slug: string) => {
    if (!user) return;

    setRemoving(slug);
    try {
      await removeBookmark(user.uid, slug);
      setBookmarks((prev) => prev.filter((b) => b.slug !== slug));
    } catch (error) {
      console.error("Error removing bookmark:", error);
    } finally {
      setRemoving(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Truyện theo dõi</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[2/3] w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Truyện theo dõi</h1>
          <p className="text-muted-foreground mt-1">
            {bookmarks.length} bộ truyện đang theo dõi
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            className="h-20 w-20 text-muted-foreground mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">Chưa có truyện theo dõi</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Bắt đầu theo dõi các bộ truyện yêu thích để nhận thông báo khi có chương mới.
          </p>
          <Button asChild>
            <Link href="/">Khám phá truyện</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {bookmarks.map((bookmark) => (
            <Card
              key={bookmark.slug}
              className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all"
            >
              <Link href={`/truyen/${bookmark.slug}`}>
                <div className="relative aspect-[2/3] overflow-hidden">
                  <Image
                    src={bookmark.thumbUrl}
                    alt={bookmark.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>

              <div className="p-3">
                <Link href={`/truyen/${bookmark.slug}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {bookmark.name}
                  </h3>
                </Link>
                {bookmark.latestChapter && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookmark.latestChapter}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Thêm: {bookmark.addedAt.toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveBookmark(bookmark.slug)}
                disabled={removing === bookmark.slug}
                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-all"
                title="Bỏ theo dõi"
              >
                {removing === bookmark.slug ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                ) : (
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

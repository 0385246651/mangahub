"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Comic } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isBookmarked, addBookmark, removeBookmark } from "@/lib/bookmarks";

interface HeroSectionProps {
  comic: Comic;
  cdnUrl: string;
}

export function HeroSection({ comic, cdnUrl }: HeroSectionProps) {
  const imageUrl = getImageUrl(cdnUrl, comic.thumb_url);
  const categories = comic.category?.slice(0, 3) || [];
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

  const handleBookmark = async () => {
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
        await addBookmark(user.uid, {
          slug: comic.slug,
          name: comic.name,
          thumbUrl: imageUrl,
          latestChapter: comic.chaptersLatest?.[0]?.chapter_name,
        });
        setBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
      {/* Blurred Background Layer - for vertical source images */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center scale-110 blur-xl opacity-60"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent z-10" />

      {/* Hero Image - Main display */}
      <div className="relative w-full h-[380px] md:h-[480px] z-5">
        <Image
          src={imageUrl}
          alt={comic.name}
          fill
          priority
          quality={100}
          sizes="100vw"
          unoptimized
          className="object-contain object-center"
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 z-20 p-6 md:p-10 w-full md:w-2/3 flex flex-col gap-4">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="destructive" className="uppercase text-xs font-bold">
            Hot Trend
          </Badge>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/the-loai/${cat.slug}`}>
              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-foreground drop-shadow-lg">
          {comic.name}
        </h1>

        {/* Description */}
        {comic.content && (
          <p
            className="text-muted-foreground text-sm md:text-base font-medium line-clamp-2 max-w-lg drop-shadow-md"
            dangerouslySetInnerHTML={{
              __html: comic.content.substring(0, 150) + "...",
            }}
          />
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Button asChild size="lg" className="shadow-lg shadow-primary/30 cursor-pointer">
            <Link href={`/truyen/${comic.slug}`}>
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
          <Button
            variant="outline"
            size="lg"
            onClick={handleBookmark}
            disabled={loading}
            className="bg-background/20 backdrop-blur-sm cursor-pointer hover:bg-primary/20"
          >
            {loading ? (
              <div className="mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : bookmarked ? (
              <svg className="mr-2 h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {bookmarked ? "Đang Theo Dõi" : "Theo Dõi"}
          </Button>
        </div>
      </div>
    </div>
  );
}


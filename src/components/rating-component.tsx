"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  getUserRating,
  getComicRating,
  submitRating,
  ComicRating,
} from "@/lib/ratings";
import Link from "next/link";

interface RatingComponentProps {
  comicSlug: string;
  comicName: string;
}

export function RatingComponent({ comicSlug, comicName }: RatingComponentProps) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comicRating, setComicRating] = useState<ComicRating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [comicSlug, user]);

  const loadRatings = async () => {
    // Load comic rating summary
    const summary = await getComicRating(comicSlug);
    setComicRating(summary);

    // Load user's rating if logged in
    if (user) {
      const rating = await getUserRating(comicSlug, user.uid);
      if (rating) {
        setUserRating(rating.rating);
      }
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) return;

    setIsSubmitting(true);
    const success = await submitRating(
      comicSlug,
      comicName,
      user.uid,
      user.email || "",
      user.displayName || "Anonymous"
      , rating);

    if (success) {
      setUserRating(rating);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      // Reload ratings
      const summary = await getComicRating(comicSlug);
      setComicRating(summary);
    }
    setIsSubmitting(false);
  };

  const renderStars = (rating: number, size: string = "w-5 h-5") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${size} ${star <= rating ? "text-yellow-400" : "text-gray-600"
              }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        ))}
      </div>
    );
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        Đánh giá truyện
      </h3>

      {/* Comic Rating Summary */}
      {comicRating && comicRating.totalRatings > 0 ? (
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-3xl font-bold text-yellow-400">
            {comicRating.averageRating.toFixed(1)}
          </div>
          <div>
            {renderStars(Math.round(comicRating.averageRating))}
            <p className="text-xs text-muted-foreground mt-1">
              {comicRating.totalRatings} đánh giá
            </p>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
          Chưa có đánh giá nào
        </div>
      )}

      {/* User Rating */}
      {user ? (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {userRating ? "Đánh giá của bạn:" : "Đánh giá ngay:"}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={isSubmitting}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <svg
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${star <= displayRating ? "text-yellow-400" : "text-gray-600"
                      }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
              ))}
            </div>
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            {showSuccess && (
              <span className="text-sm text-green-500 font-medium">
                ✓ Đã lưu!
              </span>
            )}
          </div>
          {userRating && (
            <p className="text-xs text-muted-foreground mt-2">
              Nhấn vào sao khác để thay đổi đánh giá
            </p>
          )}
        </div>
      ) : (
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Đăng nhập để đánh giá truyện
          </p>
          <Button asChild size="sm" className="cursor-pointer">
            <Link href="/dang-nhap">Đăng nhập</Link>
          </Button>
        </div>
      )}

      {/* Rating Distribution */}
      {comicRating && comicRating.totalRatings > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Phân bố đánh giá:</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = comicRating.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = comicRating.totalRatings > 0
                ? (count / comicRating.totalRatings) * 100
                : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{star}</span>
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

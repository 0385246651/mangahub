"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAllRatings,
  getAllComicRatings,
  getTotalRatingsCount,
  deleteRating,
  Rating,
  ComicRating,
} from "@/lib/ratings";
import Link from "next/link";

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comicRatings, setComicRatings] = useState<ComicRating[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ratings" | "comics">("ratings");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ratingsData, comicsData, count] = await Promise.all([
      getAllRatings(100),
      getAllComicRatings(),
      getTotalRatingsCount(),
    ]);
    setRatings(ratingsData);
    setComicRatings(comicsData.sort((a, b) => b.averageRating - a.averageRating));
    setTotalCount(count);
    setLoading(false);
  };

  const handleDeleteRating = async (rating: Rating) => {
    setDeletingId(rating.id);
    const success = await deleteRating(rating.comicSlug, rating.userId);
    if (success) {
      await loadData();
    }
    setDeletingId(null);
  };

  const filteredRatings = ratings.filter(
    (r) =>
      r.comicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredComicRatings = comicRatings.filter((r) =>
    r.comicSlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-600"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
          <p className="text-muted-foreground">
            Tổng cộng {totalCount} đánh giá
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="cursor-pointer">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-500"
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
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Truyện được đánh giá</p>
              <p className="text-2xl font-bold">{comicRatings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
              <p className="text-2xl font-bold">
                {comicRatings.length > 0
                  ? (
                    comicRatings.reduce((a, b) => a + b.averageRating, 0) /
                    comicRatings.length
                  ).toFixed(1)
                  : "0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("ratings")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors cursor-pointer ${activeTab === "ratings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Đánh giá gần đây
        </button>
        <button
          onClick={() => setActiveTab("comics")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors cursor-pointer ${activeTab === "comics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Xếp hạng theo truyện
        </button>
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : activeTab === "ratings" ? (
        /* Ratings Table */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Truyện
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Đánh giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRatings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Không có đánh giá nào
                    </td>
                  </tr>
                ) : (
                  filteredRatings.map((rating) => (
                    <tr key={rating.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/truyen/${rating.comicSlug}`}
                          className="font-medium hover:text-primary cursor-pointer"
                        >
                          {rating.comicName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{rating.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {rating.userEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{renderStars(rating.rating)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {rating.updatedAt.toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === rating.id}
                          onClick={() => handleDeleteRating(rating)}
                          className="cursor-pointer"
                        >
                          {deletingId === rating.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Xóa"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Comic Ratings Table */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Truyện
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Điểm TB
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Số đánh giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">
                    Phân bố
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredComicRatings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Chưa có truyện nào được đánh giá
                    </td>
                  </tr>
                ) : (
                  filteredComicRatings.map((comic, index) => (
                    <tr key={comic.comicSlug} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-bold text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/truyen/${comic.comicSlug}`}
                          className="font-medium hover:text-primary cursor-pointer"
                        >
                          {comic.comicSlug}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-yellow-400">
                            {comic.averageRating.toFixed(1)}
                          </span>
                          {renderStars(Math.round(comic.averageRating))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{comic.totalRatings}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 text-xs">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <span
                              key={star}
                              className="px-1.5 py-0.5 bg-muted rounded"
                              title={`${star} sao`}
                            >
                              {comic.ratingDistribution[star as 1 | 2 | 3 | 4 | 5]}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

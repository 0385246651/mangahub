"use client";

import { useEffect, useState } from "react";
import { getRecentStats, AdminComment } from "@/lib/admin";
import { getTotalRatingsCount } from "@/lib/ratings";
import { fetchHome } from "@/lib/api";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

interface RecentUser {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: string;
}

interface DashboardStats {
  totalComics: number;
  dailyUpdates: number;
  totalComments: number;
  totalBookmarks: number;
  totalRatings: number;
  totalUsers: number;
  totalAdmins: number;
  recentComments: AdminComment[];
  recentUsers: RecentUser[];
}

function formatTime(timestamp: Timestamp | null): string {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [firebaseStats, homeData, ratingsCount] = await Promise.all([
        getRecentStats(),
        fetchHome(),
        getTotalRatingsCount(),
      ]);

      setStats({
        totalComics: homeData.data.params?.pagination?.totalItems || 0,
        dailyUpdates: homeData.data.params?.itemsUpdateInDay || 0,
        totalComments: firebaseStats.totalComments,
        totalBookmarks: firebaseStats.totalBookmarks,
        totalRatings: ratingsCount,
        totalUsers: firebaseStats.totalUsers,
        totalAdmins: firebaseStats.totalAdmins,
        recentComments: firebaseStats.recentComments,
        recentUsers: firebaseStats.recentUsers as RecentUser[],
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng truyện</p>
              <p className="text-2xl font-bold">{stats?.totalComics.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cập nhật hôm nay</p>
              <p className="text-2xl font-bold">{stats?.dailyUpdates}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng Users</p>
              <p className="text-2xl font-bold">
                {stats?.totalUsers}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({stats?.totalAdmins} admin)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng Comments</p>
              <p className="text-2xl font-bold">{stats?.totalComments}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng Bookmarks</p>
              <p className="text-2xl font-bold">{stats?.totalBookmarks}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng Đánh giá</p>
              <p className="text-2xl font-bold">{stats?.totalRatings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Comments */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Comments gần đây</h2>
            <Link href="/admin/comments" className="text-sm text-primary hover:underline cursor-pointer">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-auto">
            {stats?.recentComments.map((comment) => (
              <div key={comment.id} className="p-4 flex items-start gap-4">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      trên <Link href={`/truyen/${comment.comicSlug}`} className="text-primary hover:underline">{comment.comicSlug}</Link>
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1 line-clamp-2">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(comment.createdAt)}</p>
                </div>
              </div>
            ))}
            {stats?.recentComments.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có comment nào
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Users gần đây</h2>
            <Link href="/admin/users" className="text-sm text-primary hover:underline cursor-pointer">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-auto">
            {stats?.recentUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="size-10 rounded-full object-cover" />
                ) : (
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.displayName || "No name"}</p>
                  <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${user.role?.trim() === "admin"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
                  }`}>
                  {user.role?.trim() || "user"}
                </span>
              </div>
            ))}
            {stats?.recentUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có user nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

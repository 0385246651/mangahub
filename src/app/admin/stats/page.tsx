"use client";

import { useEffect, useState } from "react";
import { getCommentCount, getBookmarkCount, getUserCount, getAdminCount } from "@/lib/admin";
import { fetchHome } from "@/lib/api";
import Link from "next/link";

interface Stats {
  totalComics: number;
  dailyUpdates: number;
  totalComments: number;
  totalBookmarks: number;
  totalUsers: number;
  totalAdmins: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [homeData, commentCount, bookmarkCount, userCount, adminCount] = await Promise.all([
        fetchHome(),
        getCommentCount(),
        getBookmarkCount(),
        getUserCount(),
        getAdminCount(),
      ]);

      setStats({
        totalComics: homeData.data.params?.pagination?.totalItems || 0,
        dailyUpdates: homeData.data.params?.itemsUpdateInDay || 0,
        totalComments: commentCount,
        totalBookmarks: bookmarkCount,
        totalUsers: userCount,
        totalAdmins: adminCount,
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
      <h1 className="text-3xl font-bold mb-8">Thống kê chi tiết</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Comics Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Truyện
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Tổng số truyện</span>
              <span className="text-2xl font-bold">{stats?.totalComics.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Cập nhật hôm nay</span>
              <span className="text-2xl font-bold text-blue-500">{stats?.dailyUpdates}</span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Users
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Tổng users</span>
              <span className="text-2xl font-bold text-purple-500">{stats?.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Admins</span>
              <span className="text-2xl font-bold text-primary">{stats?.totalAdmins}</span>
            </div>
            <Link
              href="/admin/users"
              className="block text-center text-sm text-primary hover:underline cursor-pointer mt-2"
            >
              Quản lý users →
            </Link>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Hoạt động
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Tổng comments</span>
              <span className="text-2xl font-bold text-green-500">{stats?.totalComments}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Tổng bookmarks</span>
              <span className="text-2xl font-bold text-yellow-500">{stats?.totalBookmarks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-500 mb-1">Thông tin</h3>
            <p className="text-sm text-muted-foreground">
              Dữ liệu truyện được lấy từ API otruyenapi.com. Dữ liệu users, comments và bookmarks được lưu trữ trên Firebase Firestore.
              Số liệu users chỉ tính những users đã đăng nhập và có document trong Firestore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

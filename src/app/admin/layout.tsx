"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Check if user is admin from Firestore
async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role?.trim() === "admin";
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!loading) {
        if (!user) {
          router.push("/dang-nhap");
          return;
        }

        const isAdmin = await checkIsAdmin(user.uid);
        if (!isAdmin) {
          router.push("/");
          return;
        }

        setAuthorized(true);
        setChecking(false);
      }
    };

    verifyAdmin();
  }, [user, loading, router]);

  if (loading || checking || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Admin Panel
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Quản lý Users
          </Link>
          <Link
            href="/admin/comments"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Quản lý Comments
          </Link>
          <Link
            href="/admin/stats"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Thống kê
          </Link>
          <Link
            href="/admin/ratings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Quản lý Đánh giá
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11 17l-5-5m0 0l5-5m-5 5h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

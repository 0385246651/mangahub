"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/dang-nhap");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Hồ sơ</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{user.displayName || "User"}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày tham gia</span>
              <span>{new Date(user.metadata.creationTime || "").toLocaleDateString("vi-VN")}</span>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Đăng xuất
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">Truy cập nhanh</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/theo-doi">
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Truyện theo dõi</h3>
                    <p className="text-sm text-muted-foreground">Danh sách truyện đã bookmark</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/lich-su">
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Lịch sử đọc</h3>
                    <p className="text-sm text-muted-foreground">Các chương đã đọc gần đây</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tim-kiem">
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Tìm kiếm</h3>
                    <p className="text-sm text-muted-foreground">Khám phá truyện mới</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/">
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Trang chủ</h3>
                    <p className="text-sm text-muted-foreground">Quay về trang chủ</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { Category } from "@/lib/types";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface HeaderProps {
  genres?: Category[];
}

export function Header({ genres = [] }: HeaderProps) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allGenres, setAllGenres] = useState<Category[]>(genres);
  const [genresFetched, setGenresFetched] = useState(genres.length > 0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is admin from Firestore
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role?.trim() === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  // Fetch genres only once if not provided
  useEffect(() => {
    if (!genresFetched && allGenres.length === 0) {
      setGenresFetched(true);
      fetch("https://otruyenapi.com/v1/api/the-loai")
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.items) {
            setAllGenres(data.data.items);
          }
        })
        .catch(() => { });
    }
  }, [genresFetched, allGenres.length]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

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

  const navLinks = [
    { href: "/", label: "Trang Chủ" },
    { href: "/danh-sach/truyen-moi", label: "Mới Cập Nhật" },
    { href: "/danh-sach/dang-phat-hanh", label: "Đang Cập Nhật" },
    { href: "/danh-sach/hoan-thanh", label: "Hoàn Thành" },
    { href: "/danh-sach/sap-ra-mat", label: "Sắp Ra Mắt" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl mx-auto items-center justify-between px-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="size-8 text-primary">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-xl font-bold group-hover:text-primary transition-colors">
              MangaHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                Thể Loại
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="grid grid-cols-3 gap-1 w-[360px] max-h-[400px] overflow-y-auto p-2">
                {allGenres.map((genre) => (
                  <DropdownMenuItem key={genre.slug} asChild>
                    <Link href={`/the-loai/${genre.slug}`} className="cursor-pointer">
                      {genre.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {allGenres.length === 0 && (
                  <DropdownMenuItem disabled className="col-span-3">
                    Đang tải...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center"
            >
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <Input
                  type="text"
                  placeholder="Tìm truyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[180px] lg:w-[260px] bg-muted/50 h-9"
                />
              </div>
            </form>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden cursor-pointer"
              onClick={() => router.push("/tim-kiem")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Button>

            {/* Auth Section */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.displayName && (
                        <p className="font-medium">{user.displayName}</p>
                      )}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/ho-so" className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/theo-doi" className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Truyện theo dõi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/lich-su" className="cursor-pointer">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Lịch sử đọc
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary">
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="cursor-pointer text-sm px-3 h-9">
                <Link href="/dang-nhap">Đăng nhập</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 bg-background border-b border-border lg:hidden transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="p-4 space-y-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Input
              type="text"
              placeholder="Tìm truyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-11 text-base"
            />
          </form>

          {/* Mobile Nav Links - Horizontal with responsive sizing */}
          <nav className="flex flex-wrap gap-2 sm:gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Genres Section with Icon */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm sm:text-base font-semibold">Thể Loại</p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-40 sm:max-h-48 overflow-y-auto">
              {allGenres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/the-loai/${genre.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer whitespace-nowrap"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Auth */}
          {!user && (
            <div className="border-t border-border pt-4">
              <Button asChild className="w-full cursor-pointer">
                <Link href="/dang-nhap" onClick={() => setMobileMenuOpen(false)}>
                  Đăng nhập
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

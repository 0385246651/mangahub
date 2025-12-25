import { fetchComicsList } from "@/lib/api";
import { notFound } from "next/navigation";
import { ComicCard } from "@/components/comic-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

const typeNames: Record<string, string> = {
  "truyen-moi": "Truyện Mới Cập Nhật",
  "dang-phat-hanh": "Truyện Đang Phát Hành",
  "hoan-thanh": "Truyện Hoàn Thành",
  "sap-ra-mat": "Sắp Ra Mắt",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const name = typeNames[type] || type;
  return {
    title: `${name} | MangaHub`,
    description: `Đọc ${name} online miễn phí tại MangaHub`,
  };
}

export default async function ComicsListPage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);

  let data;
  try {
    data = await fetchComicsList(type, currentPage);
  } catch {
    notFound();
  }

  if (!data?.data?.items) {
    notFound();
  }

  const comics = data.data.items;
  const cdnUrl = data.data.APP_DOMAIN_CDN_IMAGE;
  const pagination = data.data.params?.pagination;
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) : 1;
  const typeName = typeNames[type] || data.data.titlePage || type;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{typeName}</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">{typeName}</h1>
          {pagination && (
            <Badge variant="secondary" className="text-sm">
              {pagination.totalItems.toLocaleString()} truyện
            </Badge>
          )}
        </div>
      </div>

      {/* Comics Grid */}
      {comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {comics.map((comic, index) => (
            <ComicCard
              key={comic._id}
              comic={comic}
              cdnUrl={cdnUrl}
              showBadge={index < 3}
              badgeText={index === 0 ? "HOT" : index === 1 ? "TOP" : "NEW"}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy truyện.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-8">
          {currentPage > 1 ? (
            <Link href={`/danh-sach/${type}?page=${currentPage - 1}`}>
              <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="icon" disabled className="w-8 h-8 sm:w-10 sm:h-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              const maxPages = 5;
              const half = Math.floor(maxPages / 2);
              if (totalPages <= maxPages) {
                pageNum = i + 1;
              } else if (currentPage <= half + 1) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - half) {
                pageNum = totalPages - maxPages + 1 + i;
              } else {
                pageNum = currentPage - half + i;
              }

              return (
                <Link key={pageNum} href={`/danh-sach/${type}?page=${pageNum}`}>
                  <Button
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm cursor-pointer"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>

          <span className="text-xs sm:text-sm text-muted-foreground mx-1 sm:mx-2">
            {currentPage}/{totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link href={`/danh-sach/${type}?page=${currentPage + 1}`}>
              <Button variant="outline" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="icon" disabled className="w-8 h-8 sm:w-10 sm:h-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

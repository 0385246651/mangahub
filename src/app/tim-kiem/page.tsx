import { searchComics, fetchGenres } from "@/lib/api";
import { ComicCard } from "@/components/comic-card";
import { GenresSidebar } from "@/components/home/genres-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { keyword = "", page = "1" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  let searchResults = null;
  let genresData = null;

  try {
    [searchResults, genresData] = await Promise.all([
      keyword ? searchComics(keyword, currentPage) : null,
      fetchGenres().catch(() => null),
    ]);
  } catch {
    // Handle error gracefully
  }

  const comics = searchResults?.data?.items || [];
  const cdnUrl = searchResults?.data?.APP_DOMAIN_CDN_IMAGE || "";
  const genres = genresData?.data?.items || [];
  const totalItems = searchResults?.data?.params?.pagination?.totalItems || 0;

  return (
    <div className="flex flex-col w-full">
      <div className="container max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-6">
        {/* Hero Search Section */}
        <section className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2">
              Tìm kiếm nâng cao
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Khám phá hàng ngàn bộ truyện tranh với bộ lọc chi tiết.
            </p>
          </div>

          <form action="/tim-kiem" method="GET" className="w-full">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path
                      d="m21 21-4.35-4.35"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Input
                  type="text"
                  name="keyword"
                  defaultValue={keyword}
                  placeholder="Tìm truyện..."
                  className="w-full h-12 sm:h-14 pl-12 pr-4 sm:pr-28 text-base sm:text-lg shadow-lg"
                />
              </div>
              <Button
                type="submit"
                className="h-12 sm:h-auto sm:absolute sm:inset-y-2 sm:right-2 px-6 cursor-pointer"
              >
                Tìm kiếm
              </Button>
            </div>
          </form>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          {/* Left Sidebar: Filters */}
          <aside className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
            {/* Selected Filters */}
            {keyword && (
              <div className="bg-card p-5 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Đang tìm
                  </h3>
                  <Link
                    href="/tim-kiem"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Xóa
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="gap-1">
                    {keyword}
                    <Link href="/tim-kiem">
                      <svg
                        className="h-3 w-3 hover:text-destructive"
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
                    </Link>
                  </Badge>
                </div>
              </div>
            )}

            {/* Genre Cloud */}
            <GenresSidebar genres={genres} />
          </aside>

          {/* Right Content: Results */}
          <main className="lg:col-span-9 flex flex-col order-1 lg:order-2">
            {/* Result Count Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-bold">Kết quả</h2>
                <span className="text-sm font-medium text-muted-foreground">
                  ({totalItems} bộ truyện)
                </span>
              </div>
            </div>

            {/* Results Grid */}
            {comics.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {comics.map((comic, index) => (
                    <ComicCard
                      key={comic._id}
                      comic={comic}
                      cdnUrl={cdnUrl}
                      showBadge={index === 0}
                      badgeText="HOT"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {(() => {
                  const itemsPerPage = searchResults?.data?.params?.pagination?.totalItemsPerPage || 24;
                  const totalPages = Math.ceil(totalItems / itemsPerPage);

                  if (totalPages <= 1) return null;

                  return (
                    <div className="flex flex-col items-center gap-4 mt-12 mb-6">
                      {/* Stats */}
                      <p className="text-sm text-muted-foreground">
                        Trang <span className="font-semibold text-foreground">{currentPage}</span> / {totalPages}
                        {" "}({totalItems.toLocaleString()} kết quả)
                      </p>

                      {/* Page Numbers */}
                      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                        {/* Previous */}
                        {currentPage > 1 ? (
                          <Link href={`/tim-kiem?keyword=${keyword}&page=${currentPage - 1}`}>
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

                        {/* Page Numbers - show max 5 on mobile, 10 on desktop */}
                        <div className="flex items-center gap-1">
                          {(() => {
                            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                            const maxPages = 5;
                            return Array.from({ length: Math.min(maxPages, totalPages) }, (_, i) => {
                              let pageNum;
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
                                <Link key={pageNum} href={`/tim-kiem?keyword=${keyword}&page=${pageNum}`}>
                                  <Button
                                    variant={pageNum === currentPage ? "default" : "outline"}
                                    size="icon"
                                    className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm cursor-pointer"
                                  >
                                    {pageNum}
                                  </Button>
                                </Link>
                              );
                            });
                          })()}
                        </div>

                        {/* Next */}
                        {currentPage < totalPages ? (
                          <Link href={`/tim-kiem?keyword=${keyword}&page=${currentPage + 1}`}>
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
                    </div>
                  );
                })()}
              </>
            ) : keyword ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg
                  className="h-16 w-16 text-muted-foreground mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted-foreground">
                  Thử tìm với từ khóa khác hoặc duyệt thể loại bên dưới.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg
                  className="h-16 w-16 text-muted-foreground mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path
                    d="m21 21-4.35-4.35"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">Nhập từ khóa để tìm kiếm</h3>
                <p className="text-muted-foreground">
                  Tìm truyện theo tên, tác giả hoặc thể loại.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "Tìm kiếm - MangaHub",
    description: "Tìm kiếm truyện tranh theo tên, tác giả hoặc thể loại tại MangaHub",
  };
}

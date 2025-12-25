import { fetchGenres } from "@/lib/api";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tất cả thể loại | MangaHub",
  description: "Khám phá tất cả thể loại truyện tranh tại MangaHub",
};

export default async function GenresPage() {
  let genres: { slug: string; name: string }[] = [];

  try {
    const genresData = await fetchGenres();
    genres = genresData?.data?.items || [];
  } catch {
    // Handle error
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors cursor-pointer">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Thể loại</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">Tất cả thể loại</h1>
        <p className="text-muted-foreground">
          Khám phá {genres.length} thể loại truyện tranh
        </p>
      </div>

      {/* Genres Grid */}
      {genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {genres.map((genre: { slug: string; name: string }) => (
            <Link
              key={genre.slug}
              href={`/the-loai/${genre.slug}`}
              className="group p-4 bg-card border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                  {genre.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải thể loại...</p>
        </div>
      )}
    </div>
  );
}

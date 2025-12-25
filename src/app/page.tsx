import { fetchHome, fetchGenres } from "@/lib/api";
import { HeroSection } from "@/components/home/hero-section";
import { ComicCard } from "@/components/comic-card";
import { RankingSidebar } from "@/components/home/ranking-sidebar";
import { GenresSidebar } from "@/components/home/genres-sidebar";
import { StatsDisplay } from "@/components/home/stats-display";
import Link from "next/link";

export default async function HomePage() {
  const [homeData, genresData] = await Promise.all([
    fetchHome(),
    fetchGenres().catch(() => ({ data: { items: [] } })),
  ]);

  const comics = homeData.data.items || [];
  const cdnUrl = homeData.data.APP_DOMAIN_CDN_IMAGE;
  const genres = genresData.data?.items || [];
  const totalItems = homeData.data.params?.pagination?.totalItems || 0;
  const itemsUpdateInDay = homeData.data.params?.itemsUpdateInDay || 0;

  // Split comics for different sections
  const featuredComic = comics[0];
  const recommendedComics = comics.slice(1, 9);
  const latestComics = comics.slice(0, 16);

  return (
    <div className="flex flex-col w-full">
      {/* Container */}
      <div className="container max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-6 pb-4">
          {featuredComic && (
            <HeroSection comic={featuredComic} cdnUrl={cdnUrl} />
          )}
        </section>

        {/* Stats Display */}
        <section className="pb-8">
          <StatsDisplay totalItems={totalItems} itemsUpdateInDay={itemsUpdateInDay} />
        </section>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          {/* Left Column: Content (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Recommended Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Truyện Đề Cử
                </h2>
                <Link
                  href="/danh-sach/truyen-moi"
                  className="text-primary text-sm font-bold hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recommendedComics.map((comic, index) => (
                  <ComicCard
                    key={comic._id}
                    comic={comic}
                    cdnUrl={cdnUrl}
                    showBadge={index === 0}
                    badgeText="HOT"
                    badgeVariant="destructive"
                  />
                ))}
              </div>
            </section>

            {/* Latest Updates Section */}
            <section>
              <div className="flex items-center justify-between mb-4 mt-4">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <span className="w-1 h-6 bg-green-500 rounded-full" />
                  Mới Cập Nhật
                </h2>
                <div className="flex gap-2">
                  <button className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded transition-colors">
                    <svg
                      className="h-4 w-4"
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
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
                {latestComics.map((comic, index) => (
                  <ComicCard
                    key={`latest-${comic._id}`}
                    comic={comic}
                    cdnUrl={cdnUrl}
                    showBadge={index < 2}
                    badgeText={index === 0 ? "NEW" : "UPD"}
                    badgeVariant={index === 0 ? "default" : "secondary"}
                  />
                ))}
              </div>

              {/* Load More Button */}
              <div className="flex justify-center mt-10">
                <Link
                  href="/danh-sach/truyen-moi"
                  className="px-8 py-3 bg-muted border border-border hover:bg-muted/80 hover:border-primary text-foreground rounded-lg text-sm font-bold transition-all w-full md:w-auto text-center"
                >
                  Xem Thêm
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar (4/12) */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Ranking Widget */}
            <RankingSidebar comics={comics} cdnUrl={cdnUrl} />

            {/* Genre Cloud */}
            <GenresSidebar genres={genres} />
          </aside>
        </div>
      </div>
    </div>
  );
}

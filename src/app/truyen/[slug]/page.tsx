import { fetchComic } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/api";
import { ComicActions } from "@/components/comic-actions";
import { CommentSection } from "@/components/comment-section";
import { RatingComponent } from "@/components/rating-component";
import { ChapterList } from "@/components/chapter-list";

// Helper to display comic status properly
function getStatusDisplay(status: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  switch (status) {
    case "ongoing":
      return { text: "Đang cập nhật", variant: "default" };
    case "completed":
      return { text: "Hoàn thành", variant: "secondary" };
    case "coming_soon":
      return { text: "Sắp ra mắt", variant: "outline" };
    default:
      // If status is not recognized, capitalize and show as-is
      return { text: status || "Không rõ", variant: "secondary" };
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComicDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let comicData;
  try {
    comicData = await fetchComic(slug);
  } catch {
    notFound();
  }

  if (!comicData?.data?.item) {
    notFound();
  }

  const comic = comicData.data.item;
  const cdnUrl = comicData.data.APP_DOMAIN_CDN_IMAGE;
  const imageUrl = getImageUrl(cdnUrl, comic.thumb_url);
  const chapters = comic.chapters?.[0]?.server_data || [];

  // Find the chapter with the smallest number (first chapter to read)
  // API may return chapters in any order, so we need to sort by chapter number
  let firstChapterName: string | undefined;
  let latestChapter: string | undefined;

  if (chapters.length > 0) {
    // Sort by chapter_name as number to find first and latest
    const sortedChapters = [...chapters].sort((a: { chapter_name: string }, b: { chapter_name: string }) => {
      const numA = parseFloat(a.chapter_name) || 0;
      const numB = parseFloat(b.chapter_name) || 0;
      return numA - numB;
    });

    firstChapterName = sortedChapters[0]?.chapter_name; // Smallest = first to read (e.g. Chapter 1)
    latestChapter = `Chapter ${sortedChapters[sortedChapters.length - 1]?.chapter_name}`; // Largest = latest
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section with Blur Background */}
      <div className="relative w-full">
        {/* Background Blur Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden h-[500px]">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat blur-[60px] opacity-40 scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover Image */}
            <div className="shrink-0 mx-auto md:mx-0 w-[240px] md:w-[280px] lg:w-[320px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group">
              <Image
                src={imageUrl}
                alt={comic.name}
                width={320}
                height={480}
                priority
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 pt-2 w-full">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-2 tracking-tight drop-shadow-lg">
                {comic.name}
              </h1>

              <p className="text-lg text-muted-foreground font-medium mb-4 flex items-center gap-2">
                <span>{comic.author?.join(", ") || "Unknown"}</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span className="text-primary">
                  {getStatusDisplay(comic.status).text}
                </span>
              </p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-8">
                {comic.category?.map((cat) => (
                  <Link key={cat.slug} href={`/the-loai/${cat.slug}`}>
                    <Badge
                      variant="secondary"
                      className="hover:bg-primary/20 hover:text-primary transition-all cursor-pointer"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Actions - Client Component */}
              <ComicActions
                comic={{
                  slug: comic.slug,
                  name: comic.name,
                  thumbUrl: imageUrl,
                }}
                firstChapterName={firstChapterName}
                latestChapter={latestChapter}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Main Info) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Synopsis */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-xl font-bold">Sơ lược</h3>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <div
                  className="text-muted-foreground leading-relaxed text-sm md:text-base"
                  dangerouslySetInnerHTML={{
                    __html: comic.content || "Chưa có nội dung mô tả.",
                  }}
                />
              </div>
            </section>

            {/* Chapter List - Client Component with Sort */}
            <section>
              <ChapterList chapters={chapters} comicSlug={slug} />
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Rating Section */}
            <RatingComponent comicSlug={slug} comicName={comic.name} />

            {/* Info Card */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-lg font-bold mb-4">Thông tin</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tác giả</span>
                  <span className="font-medium">
                    {comic.author?.join(", ") || "Unknown"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <Badge variant={getStatusDisplay(comic.status).variant}>
                    {getStatusDisplay(comic.status).text}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số chương</span>
                  <span className="font-medium">{chapters.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên khác</span>
                  <span className="font-medium text-right max-w-[180px] truncate">
                    {comic.origin_name?.join(", ") || "--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-card rounded-xl border border-border p-5">
              <CommentSection comicSlug={slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const data = await fetchComic(slug);
    return {
      title: `${data.data.item.name} - MangaHub`,
      description: data.data.item.content?.substring(0, 160),
    };
  } catch {
    return {
      title: "Truyện - MangaHub",
    };
  }
}

import { fetchComic, fetchChapterData } from "@/lib/api";
import { notFound } from "next/navigation";
import { ReaderContent } from "@/components/reader-content";

interface PageProps {
  params: Promise<{ slug: string; chapterId: string }>;
}

export default async function ReaderPage({ params }: PageProps) {
  const { slug, chapterId } = await params;

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
  const chapters = comic.chapters?.[0]?.server_data || [];

  // Find current chapter
  const currentChapter = chapters.find(
    (ch) => ch.chapter_name === chapterId
  );

  if (!currentChapter) {
    notFound();
  }

  // Fetch chapter images
  let chapterImages: { image_page: number; image_file: string }[] = [];
  let imageBaseUrl = "";

  try {
    const chapterData = await fetchChapterData(currentChapter.chapter_api_data);
    chapterImages = chapterData.data.item.chapter_image || [];
    const cdnDomain = (chapterData.data as unknown as { domain_cdn?: string }).domain_cdn ||
      chapterData.data.APP_DOMAIN_CDN_IMAGE || "";
    const chapterPath = chapterData.data.item.chapter_path || "";
    imageBaseUrl = cdnDomain && chapterPath ? `${cdnDomain}/${chapterPath}` : "";
  } catch (error) {
    console.error("Failed to fetch chapter data:", error);
  }

  // Find prev/next chapters by comparing chapter numbers
  // prevChapter = the chapter with the next smaller number
  // nextChapter = the chapter with the next higher number
  const currentChapterNum = parseFloat(chapterId) || 0;

  // Find all chapters with their numeric values
  const chaptersWithNums = chapters.map(ch => ({
    ...ch,
    num: parseFloat(ch.chapter_name) || 0
  }));

  // Sort by chapter number ascending
  const sortedChapters = [...chaptersWithNums].sort((a, b) => a.num - b.num);

  // Find current chapter's position in sorted array
  const sortedIndex = sortedChapters.findIndex(ch => ch.num === currentChapterNum);

  // prevChapter = one before in sorted order (lower number)
  const prevChapter = sortedIndex > 0 ? sortedChapters[sortedIndex - 1] : null;
  // nextChapter = one after in sorted order (higher number)
  const nextChapter = sortedIndex < sortedChapters.length - 1 ? sortedChapters[sortedIndex + 1] : null;

  return (
    <ReaderContent
      comic={{
        name: comic.name,
        slug: comic.slug,
        thumb_url: comic.thumb_url,
      }}
      cdnUrl={cdnUrl}
      chapterId={chapterId}
      chapterTitle={currentChapter.chapter_title}
      chapters={chapters}
      chapterImages={chapterImages}
      imageBaseUrl={imageBaseUrl}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, chapterId } = await params;
  try {
    const data = await fetchComic(slug);
    return {
      title: `${data.data.item.name} - Chapter ${chapterId} | MangaHub`,
      description: `Đọc ${data.data.item.name} Chapter ${chapterId} online miễn phí tại MangaHub`,
    };
  } catch {
    return {
      title: "Đọc Truyện - MangaHub",
    };
  }
}


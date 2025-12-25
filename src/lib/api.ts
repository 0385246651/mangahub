import {
  HomeData,
  ComicDetailResponse,
  GenresResponse,
  SearchResponse,
  ChapterDataResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://otruyenapi.com/v1/api";

export async function fetchHome(): Promise<HomeData> {
  const res = await fetch(`${API_BASE}/home`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  if (!res.ok) throw new Error("Failed to fetch home data");
  return res.json();
}

export async function fetchComic(slug: string): Promise<ComicDetailResponse> {
  const res = await fetch(`${API_BASE}/truyen-tranh/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch comic");
  return res.json();
}

export async function fetchGenres(): Promise<GenresResponse> {
  const res = await fetch(`${API_BASE}/the-loai`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) throw new Error("Failed to fetch genres");
  return res.json();
}

export async function fetchComicsByGenre(
  slug: string,
  page: number = 1
): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/the-loai/${slug}?page=${page}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch comics by genre");
  return res.json();
}

export async function fetchComicsList(
  type: string,
  page: number = 1
): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/danh-sach/${type}?page=${page}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch comics list");
  return res.json();
}

export async function searchComics(
  keyword: string,
  page: number = 1
): Promise<SearchResponse> {
  const res = await fetch(
    `${API_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
    {
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) throw new Error("Failed to search comics");
  return res.json();
}

export async function fetchChapterData(
  apiUrl: string
): Promise<ChapterDataResponse> {
  const res = await fetch(apiUrl, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch chapter data");
  return res.json();
}

// Helper to construct full image URL
export function getImageUrl(cdnUrl: string, thumbPath: string): string {
  if (thumbPath.startsWith("http")) return thumbPath;
  return `${cdnUrl}/uploads/comics/${thumbPath}`;
}

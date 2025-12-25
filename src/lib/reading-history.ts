// Reading history utility functions

export interface ReadingHistoryItem {
  comicSlug: string;
  comicName: string;
  thumbUrl: string;
  chapterName: string;
  chapterTitle?: string;
  readAt: number;
}

const STORAGE_KEY = "mangahub_reading_history";
const MAX_HISTORY_ITEMS = 50;

export function getReadingHistory(): ReadingHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToReadingHistory(item: Omit<ReadingHistoryItem, "readAt">) {
  if (typeof window === "undefined") return;

  const history = getReadingHistory();

  // Remove existing entry for same comic+chapter
  const filtered = history.filter(
    (h) =>
      !(h.comicSlug === item.comicSlug && h.chapterName === item.chapterName)
  );

  // Add new entry at the beginning
  const newHistory = [{ ...item, readAt: Date.now() }, ...filtered].slice(
    0,
    MAX_HISTORY_ITEMS
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function clearReadingHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

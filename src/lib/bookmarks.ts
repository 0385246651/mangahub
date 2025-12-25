import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface BookmarkedComic {
  slug: string;
  name: string;
  thumbUrl: string;
  latestChapter?: string;
  addedAt: Date;
}

// Add a comic to user's bookmarks
export async function addBookmark(
  userId: string,
  comic: {
    slug: string;
    name: string;
    thumbUrl: string;
    latestChapter?: string;
  }
): Promise<void> {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", comic.slug);

  // Build data object, excluding undefined values (Firestore doesn't accept undefined)
  const data: Record<string, unknown> = {
    slug: comic.slug,
    name: comic.name,
    thumbUrl: comic.thumbUrl,
    addedAt: serverTimestamp(),
  };

  // Only add latestChapter if it's defined
  if (comic.latestChapter) {
    data.latestChapter = comic.latestChapter;
  }

  await setDoc(bookmarkRef, data);
}

// Remove a comic from user's bookmarks
export async function removeBookmark(
  userId: string,
  comicSlug: string
): Promise<void> {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", comicSlug);
  await deleteDoc(bookmarkRef);
}

// Check if a comic is bookmarked by user
export async function isBookmarked(
  userId: string,
  comicSlug: string
): Promise<boolean> {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", comicSlug);
  const docSnap = await getDoc(bookmarkRef);
  return docSnap.exists();
}

// Get all bookmarked comics for a user
export async function getBookmarks(userId: string): Promise<BookmarkedComic[]> {
  const bookmarksRef = collection(db, "users", userId, "bookmarks");
  const querySnapshot = await getDocs(bookmarksRef);

  const bookmarks: BookmarkedComic[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    bookmarks.push({
      slug: doc.id,
      name: data.name,
      thumbUrl: data.thumbUrl,
      latestChapter: data.latestChapter,
      addedAt: data.addedAt?.toDate() || new Date(),
    });
  });

  // Sort by addedAt descending (newest first)
  return bookmarks.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
}

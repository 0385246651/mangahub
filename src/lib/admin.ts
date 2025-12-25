// Admin utilities for Firebase
import { db } from "./firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface AdminComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  comicSlug: string;
  chapterName?: string;
  createdAt: Timestamp;
}

// Get all comments for admin
export async function getAllComments(
  limitCount: number = 100
): Promise<AdminComment[]> {
  const q = query(
    collection(db, "comments"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AdminComment[];
}

// Get comment count
export async function getCommentCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, "comments"));
  return snapshot.size;
}

// Delete comment by admin
export async function adminDeleteComment(commentId: string): Promise<void> {
  await deleteDoc(doc(db, "comments", commentId));
}

// Get all bookmarks count (correctly counting from users subcollections)
export async function getBookmarkCount(): Promise<number> {
  const usersSnapshot = await getDocs(collection(db, "users"));
  let totalBookmarks = 0;

  for (const userDoc of usersSnapshot.docs) {
    const bookmarksSnapshot = await getDocs(
      collection(db, "users", userDoc.id, "bookmarks")
    );
    totalBookmarks += bookmarksSnapshot.size;
  }

  return totalBookmarks;
}

// Get user count
export async function getUserCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.size;
}

// Get admin count
export async function getAdminCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, "users"));
  let count = 0;
  snapshot.docs.forEach((doc) => {
    if (doc.data().role?.trim() === "admin") {
      count++;
    }
  });
  return count;
}

// Get recent users
export async function getRecentUsers(limitCount: number = 5) {
  const q = query(collection(db, "users"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get recent activity stats
export async function getRecentStats() {
  const comments = await getAllComments(10);
  const commentCount = await getCommentCount();
  const bookmarkCount = await getBookmarkCount();
  const userCount = await getUserCount();
  const adminCount = await getAdminCount();
  const recentUsers = await getRecentUsers(5);

  return {
    totalComments: commentCount,
    totalBookmarks: bookmarkCount,
    totalUsers: userCount,
    totalAdmins: adminCount,
    recentComments: comments,
    recentUsers: recentUsers,
  };
}

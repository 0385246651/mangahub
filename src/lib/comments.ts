// Firebase comments utility functions
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  comicSlug: string;
  chapterName?: string; // If commenting on a chapter
  createdAt: Timestamp;
  parentId?: string; // For reply
}

export interface CommentInput {
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  comicSlug: string;
  chapterName?: string;
  parentId?: string;
}

const COMMENTS_COLLECTION = "comments";

// Add a comment
export async function addComment(input: CommentInput): Promise<string> {
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get comments for a comic
export async function getComicComments(comicSlug: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("comicSlug", "==", comicSlug),
    where("chapterName", "==", null),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];
}

// Get comments for a chapter
export async function getChapterComments(
  comicSlug: string,
  chapterName: string
): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("comicSlug", "==", comicSlug),
    where("chapterName", "==", chapterName),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];
}

// Get all comments (comic + chapters) for a comic
export async function getAllComicComments(
  comicSlug: string
): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("comicSlug", "==", comicSlug),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];
}

// Delete a comment (only owner can delete)
export async function deleteComment(commentId: string): Promise<void> {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
}

// Get user's comments
export async function getUserComments(userId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];
}

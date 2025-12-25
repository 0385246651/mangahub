import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

export interface Rating {
  id: string;
  comicSlug: string;
  comicName: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface ComicRating {
  comicSlug: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  lastUpdated: Date;
}

// Get user's rating for a specific comic
export async function getUserRating(
  comicSlug: string,
  userId: string
): Promise<Rating | null> {
  try {
    const ratingId = `${comicSlug}_${userId}`;
    const ratingDoc = await getDoc(doc(db, "ratings", ratingId));

    if (ratingDoc.exists()) {
      const data = ratingDoc.data();
      return {
        id: ratingDoc.id,
        comicSlug: data.comicSlug,
        comicName: data.comicName,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        rating: data.rating,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user rating:", error);
    return null;
  }
}

// Get comic rating summary
export async function getComicRating(
  comicSlug: string
): Promise<ComicRating | null> {
  try {
    const summaryDoc = await getDoc(doc(db, "comic_ratings", comicSlug));

    if (summaryDoc.exists()) {
      const data = summaryDoc.data();
      return {
        comicSlug: data.comicSlug,
        totalRatings: data.totalRatings || 0,
        averageRating: data.averageRating || 0,
        ratingDistribution: data.ratingDistribution || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting comic rating:", error);
    return null;
  }
}

// Submit or update rating
export async function submitRating(
  comicSlug: string,
  comicName: string,
  userId: string,
  userEmail: string,
  userName: string,
  rating: number
): Promise<boolean> {
  try {
    const ratingId = `${comicSlug}_${userId}`;
    const ratingRef = doc(db, "ratings", ratingId);
    const existingRating = await getDoc(ratingRef);
    const oldRating = existingRating.exists()
      ? existingRating.data().rating
      : null;

    // Save/update rating
    await setDoc(ratingRef, {
      comicSlug,
      comicName,
      userId,
      userEmail,
      userName,
      rating,
      createdAt: existingRating.exists()
        ? existingRating.data().createdAt
        : Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update comic rating summary
    await updateComicRatingSummary(comicSlug, rating, oldRating);

    return true;
  } catch (error) {
    console.error("Error submitting rating:", error);
    return false;
  }
}

// Update comic rating summary
async function updateComicRatingSummary(
  comicSlug: string,
  newRating: number,
  oldRating: number | null
): Promise<void> {
  const summaryRef = doc(db, "comic_ratings", comicSlug);
  const summaryDoc = await getDoc(summaryRef);

  let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatings = 0;

  if (summaryDoc.exists()) {
    const data = summaryDoc.data();
    distribution = data.ratingDistribution || distribution;
    totalRatings = data.totalRatings || 0;
  }

  // Remove old rating from distribution if updating
  if (oldRating !== null) {
    distribution[oldRating as 1 | 2 | 3 | 4 | 5]--;
  } else {
    totalRatings++;
  }

  // Add new rating to distribution
  distribution[newRating as 1 | 2 | 3 | 4 | 5]++;

  // Calculate average
  const totalScore =
    distribution[1] * 1 +
    distribution[2] * 2 +
    distribution[3] * 3 +
    distribution[4] * 4 +
    distribution[5] * 5;
  const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

  await setDoc(summaryRef, {
    comicSlug,
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution: distribution,
    lastUpdated: Timestamp.now(),
  });
}

// Delete rating
export async function deleteRating(
  comicSlug: string,
  userId: string
): Promise<boolean> {
  try {
    const ratingId = `${comicSlug}_${userId}`;
    const ratingRef = doc(db, "ratings", ratingId);
    const ratingDoc = await getDoc(ratingRef);

    if (!ratingDoc.exists()) return false;

    const oldRating = ratingDoc.data().rating;
    await deleteDoc(ratingRef);

    // Update summary
    const summaryRef = doc(db, "comic_ratings", comicSlug);
    const summaryDoc = await getDoc(summaryRef);

    if (summaryDoc.exists()) {
      const data = summaryDoc.data();
      const distribution = data.ratingDistribution;
      let totalRatings = data.totalRatings - 1;

      distribution[oldRating as 1 | 2 | 3 | 4 | 5]--;

      const totalScore =
        distribution[1] * 1 +
        distribution[2] * 2 +
        distribution[3] * 3 +
        distribution[4] * 4 +
        distribution[5] * 5;
      const averageRating = totalRatings > 0 ? totalScore / totalRatings : 0;

      await setDoc(summaryRef, {
        comicSlug,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: distribution,
        lastUpdated: Timestamp.now(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting rating:", error);
    return false;
  }
}

// Get all ratings for admin
export async function getAllRatings(
  limitCount: number = 50
): Promise<Rating[]> {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(ratingsQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        comicSlug: data.comicSlug,
        comicName: data.comicName,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        rating: data.rating,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting all ratings:", error);
    return [];
  }
}

// Get ratings for a specific comic (admin)
export async function getComicRatings(comicSlug: string): Promise<Rating[]> {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("comicSlug", "==", comicSlug),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(ratingsQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        comicSlug: data.comicSlug,
        comicName: data.comicName,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        rating: data.rating,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting comic ratings:", error);
    return [];
  }
}

// Get all comic ratings summary (for admin stats)
export async function getAllComicRatings(): Promise<ComicRating[]> {
  try {
    const snapshot = await getDocs(collection(db, "comic_ratings"));
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        comicSlug: data.comicSlug,
        totalRatings: data.totalRatings || 0,
        averageRating: data.averageRating || 0,
        ratingDistribution: data.ratingDistribution || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting all comic ratings:", error);
    return [];
  }
}

// Get total ratings count
export async function getTotalRatingsCount(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, "ratings"));
    return snapshot.size;
  } catch (error) {
    console.error("Error getting total ratings count:", error);
    return 0;
  }
}

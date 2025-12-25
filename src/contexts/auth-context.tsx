"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Save or update user data in Firestore
async function saveUserToFirestore(user: User) {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  const userData = {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastLoginAt: new Date().toISOString(),
  };

  if (userDoc.exists()) {
    // Update existing user, preserve role
    await setDoc(userRef, userData, { merge: true });
  } else {
    // New user, set default role
    await setDoc(userRef, {
      ...userData,
      role: "user",
      createdAt: new Date().toISOString(),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result for mobile Google sign-in
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await saveUserToFirestore(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Save user data to Firestore when logged in
      if (user) {
        try {
          await saveUserToFirestore(user);
        } catch (error) {
          console.error("Failed to save user to Firestore:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    // Save to Firestore after profile is updated
    await saveUserToFirestore(result.user);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Use redirect for mobile (popup is often blocked)
      await signInWithRedirect(auth, provider);
    } else {
      // Use popup for desktop with fallback to redirect
      try {
        await signInWithPopup(auth, provider);
      } catch (error: unknown) {
        // Fallback to redirect if popup is blocked
        if (error instanceof Error && error.message.includes("popup")) {
          await signInWithRedirect(auth, provider);
        } else {
          throw error;
        }
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

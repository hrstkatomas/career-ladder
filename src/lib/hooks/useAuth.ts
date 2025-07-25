"use client";

import { useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { User } from "@/lib/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get or create user document in Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          let userData: User;

          if (userDoc.exists()) {
            userData = { id: userDoc.id, ...userDoc.data() } as User;
          } else {
            // Create new user document
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "",
              teamId: "", // Will be assigned by admin
              currentLevel: 1,
              role: "employee",
              domain: "", // Will be assigned by admin
              createdAt: new Date() as any,
              updatedAt: new Date() as any,
            };

            await setDoc(doc(db, "users", firebaseUser.uid), userData);
          }

          setAuthState({
            firebaseUser,
            user: userData,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthState({
            firebaseUser,
            user: null,
            loading: false,
            error: "Failed to load user data",
          });
        }
      } else {
        setAuthState({
          firebaseUser: null,
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, error: null }));
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Failed to sign in with Google",
      }));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error("Error signing out:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Failed to sign out",
      }));
    }
  };

  const refreshUser = async () => {
    if (authState.firebaseUser) {
      try {
        const userDoc = await getDoc(
          doc(db, "users", authState.firebaseUser.uid)
        );
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setAuthState((prev) => ({ ...prev, user: userData }));
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  return {
    firebaseUser: authState.firebaseUser,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    signOut,
    refreshUser,
    isAuthenticated: !!authState.firebaseUser,
    isAdmin: authState.user?.role === "admin",
    isTeamLeader: authState.user?.role === "team_leader",
    isEmployee: authState.user?.role === "employee",
  };
}

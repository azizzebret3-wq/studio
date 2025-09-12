// src/hooks/useAuth.tsx
'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserData {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  competitionType?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
  createdAt: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    reloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc: DocumentSnapshot = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: user.uid,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          competitionType: data.competitionType,
          photoURL: user.photoURL,
          role: data.role,
          subscription_type: data.subscription_type,
          createdAt: data.createdAt,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const data = await fetchUserData(user);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const reloadUserData = useCallback(async () => {
    if (user) {
      setLoading(true);
      const data = await fetchUserData(user);
      setUserData(data);
      setLoading(false);
    }
  }, [user, fetchUserData]);
  
  const value = { user, userData, loading, reloadUserData };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

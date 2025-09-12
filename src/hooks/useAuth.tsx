// src/hooks/useAuth.tsx
'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserData {
  fullName?: string;
  email?: string;
  phone?: string;
  competitionType?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
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
        return userDoc.data() as UserData;
      } else {
        return { email: user.email || '', role: 'user', subscription_type: 'gratuit' };
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
      {!loading && children}
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

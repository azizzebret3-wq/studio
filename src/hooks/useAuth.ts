// src/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface UserData {
  fullName?: string;
  email?: string;
  phone?: string;
  competitionType?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
}

export function useAuth() {
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
        // Fallback for user record without a firestore doc
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

  return { user, userData, loading, reloadUserData };
}

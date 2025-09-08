
// src/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User | null) => {
    if (!user) {
        setUserData(null);
        setLoading(false);
        return;
    }
    
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
            // Fallback for user record without a firestore doc
            setUserData({ email: user.email || '', role: 'user', subscription_type: 'gratuit' });
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
    } finally {
        setLoading(false);
    }
  }, []);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setUser(user);
      fetchUserData(user);
    });

    return () => unsubscribe();
  }, [fetchUserData]);
  
  const reloadUserData = useCallback(() => {
    if(user) {
        setLoading(true);
        fetchUserData(user);
    }
  }, [user, fetchUserData]);

  return { user, userData, loading, reloadUserData };
}

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

  const fetchUserData = useCallback(async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setUserData(userDoc.data() as UserData);
    }
  }, []);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user);
      } else {
        // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
        // et qu'il n'est pas déjà sur une page publique
        if (window.location.pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, fetchUserData]);
  
  const reloadUserData = useCallback(() => {
    if(user) {
        setLoading(true);
        fetchUserData(user).finally(() => setLoading(false));
    }
  }, [user, fetchUserData]);

  return { user, userData, loading, reloadUserData };
}

    

// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, doc, updateDoc } from 'firebase/firestore';

// Define the structure of a Quiz document
export interface Quiz {
  id?: string;
  title: string;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswers: string[];
    explanation?: string;
  }>;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  access_type: 'gratuit' | 'premium';
  duration_minutes: number;
  total_questions: number;
  createdAt: Date;
}

// Define the structure of a User document from Firestore
export interface AppUser {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  competitionType?: string;
  createdAt: Date;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
}


export const saveQuizToFirestore = async (quizData: Omit<Quiz, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), quizData);
    console.log("Quiz document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not save quiz");
  }
};

export const getQuizzesFromFirestore = async (): Promise<Quiz[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const quizzes = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            
            let createdAt: Date;
            // This handles both Firestore Timestamps and JS Date objects
            if (data.createdAt instanceof Timestamp) {
                createdAt = data.createdAt.toDate();
            } else if (data.createdAt && typeof data.createdAt.seconds === 'number') {
                createdAt = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate();
            } else if (data.createdAt) {
                // Assuming it might be a string or a plain JS Date from generation
                createdAt = new Date(data.createdAt);
            } else {
                createdAt = new Date(); // Fallback
            }

            return {
                id: doc.id,
                ...data,
                createdAt,
            } as Quiz;
        });
        return quizzes;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw new Error("Could not fetch quizzes");
    }
}

export const getUsersFromFirestore = async (): Promise<AppUser[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
             let createdAt: Date;
            if (data.createdAt instanceof Timestamp) {
                createdAt = data.createdAt.toDate();
            } else {
                createdAt = new Date();
            }
            return {
                ...data,
                uid: doc.id,
                createdAt,
            } as AppUser;
        });
    } catch (e) {
        console.error("Error getting users: ", e);
        throw new Error("Could not fetch users");
    }
};

export const updateUserRoleInFirestore = async (uid: string, role: 'admin' | 'user') => {
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { role });
    } catch (e) {
        console.error("Error updating user role: ", e);
        throw new Error("Could not update user role");
    }
};
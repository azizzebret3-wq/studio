// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, doc, updateDoc, query, where, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';

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
  isMockExam?: boolean;
  scheduledFor?: Date;
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
  photoURL?: string;
}

// Define the structure of an Attempt document
export interface Attempt {
    id?: string;
    userId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    correctAnswers: number;
    createdAt: Date;
}

// Define the structure of a Library Document
export interface LibraryDocument {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  access_type: 'gratuit' | 'premium';
  category: string;
  url: string; // URL to the file in Firebase Storage
  createdAt: Date;
}

export type LibraryDocumentFormData = Omit<LibraryDocument, 'id' | 'createdAt'>;

export const deleteQuizFromFirestore = async (quizId: string) => {
    try {
        await deleteDoc(doc(db, "quizzes", quizId));
    } catch (e) {
        console.error("Error deleting quiz: ", e);
        throw new Error("Could not delete quiz");
    }
};

export const updateQuizInFirestore = async (quizId: string, quizData: Partial<Quiz>) => {
    try {
        const quizDocRef = doc(db, 'quizzes', quizId);
        // Ensure createdAt is not overwritten
        const { createdAt, ...restOfData } = quizData;
        await updateDoc(quizDocRef, { ...restOfData });
    } catch (e) {
        console.error("Error updating quiz: ", e);
        throw new Error("Could not update quiz");
    }
}


export const saveQuizToFirestore = async (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizData,
        createdAt: serverTimestamp()
    });
    console.log("Quiz document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not save quiz");
  }
};

const parseFirestoreDate = (dateField: any): Date => {
  if (!dateField) return new Date(); // Fallback to now if null/undefined
  if (dateField instanceof Timestamp) {
    return dateField.toDate();
  }
  // This handles the case where the data is serialized from server components
  if (dateField.seconds) {
    return new Timestamp(dateField.seconds, dateField.nanoseconds).toDate();
  }
  // This handles cases where it might already be a Date object or a string
  return new Date(dateField);
}


export const getQuizzesFromFirestore = async (): Promise<Quiz[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const quizzes = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: parseFirestoreDate(data.createdAt),
                scheduledFor: data.scheduledFor ? parseFirestoreDate(data.scheduledFor) : undefined,
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
            return {
                ...data,
                uid: doc.id,
                createdAt: parseFirestoreDate(data.createdAt),
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

export const updateUserSubscriptionInFirestore = async (uid: string, subscription_type: 'premium' | 'gratuit') => {
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { subscription_type });
    } catch (e) {
        console.error("Error updating user subscription: ", e);
        throw new Error("Could not update user subscription");
    }
}

export const saveAttemptToFirestore = async (attemptData: Omit<Attempt, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, "attempts"), attemptData);
        return docRef.id;
    } catch (e) {
        console.error("Error saving attempt: ", e);
        throw new Error("Could not save attempt");
    }
};

export const getAttemptsFromFirestore = async (userId: string): Promise<Attempt[]> => {
    try {
        const attemptsRef = collection(db, "attempts");
        const q = query(attemptsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: parseFirestoreDate(data.createdAt),
            } as Attempt;
        });
    } catch (e) {
        console.error("Error getting attempts: ", e);
        // Don't throw, just return empty array if index is building
        return [];
    }
};

export const getDocumentsFromFirestore = async (): Promise<LibraryDocument[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "documents"));
        return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: parseFirestoreDate(data.createdAt),
            } as LibraryDocument;
        });
    } catch (e) {
        console.error("Error getting library documents: ", e);
        throw new Error("Could not fetch library documents");
    }
};

export const addDocumentToFirestore = async (documentData: LibraryDocumentFormData) => {
  try {
    await addDoc(collection(db, "documents"), {
      ...documentData,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add document");
  }
};

export const updateDocumentInFirestore = async (id: string, documentData: LibraryDocumentFormData) => {
  try {
    const docRef = doc(db, "documents", id);
    await updateDoc(docRef, documentData as any);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw new Error("Could not update document");
  }
};


export const deleteDocumentFromFirestore = async (id: string) => {
    try {
        await deleteDoc(doc(db, "documents", id));
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("Could not delete document");
    }
};

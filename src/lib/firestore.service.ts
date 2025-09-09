// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, doc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';

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
            if (data.createdAt instanceof Timestamp) {
                createdAt = data.createdAt.toDate();
            } else if (data.createdAt && typeof data.createdAt.seconds === 'number') {
                createdAt = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate();
            } else if (data.createdAt) {
                createdAt = new Date(data.createdAt);
            } else {
                createdAt = new Date();
            }
            
            let scheduledFor: Date | undefined;
             if (data.scheduledFor instanceof Timestamp) {
                scheduledFor = data.scheduledFor.toDate();
            } else if (data.scheduledFor && typeof data.scheduledFor.seconds === 'number') {
                scheduledFor = new Timestamp(data.scheduledFor.seconds, data.scheduledFor.nanoseconds).toDate();
            } else if (data.scheduledFor) {
                scheduledFor = new Date(data.scheduledFor);
            }


            return {
                id: doc.id,
                ...data,
                createdAt,
                scheduledFor,
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
                createdAt: data.createdAt.toDate(),
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
             let createdAt: Date;
            if (data.createdAt instanceof Timestamp) {
                createdAt = data.createdAt.toDate();
            } else if(data.createdAt?.seconds) {
                createdAt = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate();
            }
             else {
                createdAt = new Date();
            }
            return {
                id: doc.id,
                ...data,
                createdAt,
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
      createdAt: new Date(),
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

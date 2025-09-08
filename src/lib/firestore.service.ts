// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

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
            // Ensure createdAt is a Date object
            const createdAt = data.createdAt instanceof Timestamp 
                ? data.createdAt.toDate() 
                : new Date();

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

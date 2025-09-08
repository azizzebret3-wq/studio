// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Define the structure of a Quiz document
interface Quiz {
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


export const saveQuizToFirestore = async (quizData: Quiz) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), quizData);
    console.log("Quiz document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not save quiz");
  }
};

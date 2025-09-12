// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Loader } from 'lucide-react';

const QuizAdminPanel = dynamic(
  () => import('@/components/admin/QuizAdminPanel'),
  { 
    ssr: false,
    loading: () => (
       <div className="p-4 sm:p-6 md:p-8 space-y-6 flex justify-center items-center h-[70vh]">
          <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 animate-spin text-purple-500" />
              <p className="font-medium text-muted-foreground">Chargement de l'éditeur de quiz...</p>
          </div>
      </div>
    )
  }
);

export default function AdminQuizzesPage() {
  return <QuizAdminPanel />;
}

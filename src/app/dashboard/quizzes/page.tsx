// src/app/dashboard/quizzes/page.tsx
'use client';

import { ClipboardList } from "lucide-react";

export default function QuizzesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-full flex items-center justify-center mb-6">
        <ClipboardList className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-4xl font-black text-gray-800">Quiz</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
        Cette section affichera tous les quiz disponibles, avec des options de filtrage et de recherche.
      </p>
    </div>
  );
}

// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import React from 'react';
import { ClipboardList, PlusCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function AdminQuizzesPage() {
  // Add logic to fetch and manage quizzes
  return (
     <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Gérer les Quiz
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Ajoutez, modifiez ou supprimez des quiz.
              </p>
            </div>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2" />
          Ajouter un Quiz
        </Button>
      </div>
       <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4 bg-white/50 rounded-2xl shadow-inner">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
          <ClipboardList className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Bientôt disponible</h2>
        <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
          La gestion des quiz sera bientôt implémentée ici. Vous pourrez ajouter et voir les quiz existants.
        </p>
      </div>
    </div>
  );
}

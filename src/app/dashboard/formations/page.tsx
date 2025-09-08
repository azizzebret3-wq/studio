// src/app/dashboard/formations/page.tsx
'use client';

import React from 'react';
import { Trophy, BookCheck } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FormationsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Parcours de Formation
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Maîtrisez les programmes, étape par étape.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4 bg-white/50 rounded-2xl shadow-inner relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200/50 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Bientôt Disponible</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-lg mx-auto">
            Nos parcours de formation structurés arrivent très prochainement pour vous guider vers la réussite de votre concours.
          </p>
           <Button asChild size="lg" className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg rounded-xl">
             <Link href="/dashboard/quizzes">
                <BookCheck className="mr-2 h-5 w-5" />
                S'entraîner sur les quiz en attendant
             </Link>
           </Button>
        </div>
      </div>
    </div>
  );
}

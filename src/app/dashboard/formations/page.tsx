// src/app/dashboard/formations/page.tsx
'use client';

import React from 'react';
import { Trophy } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4 bg-white/50 rounded-2xl shadow-inner">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Bientôt disponible</h2>
        <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
          Nos parcours de formation structurés pour maîtriser les programmes seront bientôt disponibles.
        </p>
      </div>
    </div>
  );
}

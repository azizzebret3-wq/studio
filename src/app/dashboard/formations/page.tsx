// src/app/dashboard/formations/page.tsx
'use client';

import React from 'react';
import { Trophy } from "lucide-react";

export default function FormationsPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg floating">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text">
                Parcours de Formation
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Maîtrisez les programmes, étape par étape.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 bg-white/50 rounded-2xl shadow-inner">
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Section en cours de construction</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          Nos parcours de formation structurés pour maîtriser les programmes seront bientôt disponibles.
        </p>
      </div>
    </div>
  );
}

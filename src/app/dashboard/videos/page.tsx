// src/app/dashboard/videos/page.tsx
'use client';

import React from 'react';
import { Video } from "lucide-react";

export default function VideosPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg floating">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text">
                Vidéos Pédagogiques
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Apprenez avec nos experts en vidéo.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 bg-white/50 rounded-2xl shadow-inner">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-200 rounded-full flex items-center justify-center mb-6">
          <Video className="w-12 h-12 text-pink-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Section en cours de construction</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
          Notre collection de vidéos explicatives et pédagogiques sera bientôt disponible ici.
        </p>
      </div>
    </div>
  );
}

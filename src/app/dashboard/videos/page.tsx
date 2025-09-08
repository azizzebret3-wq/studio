// src/app/dashboard/videos/page.tsx
'use client';

import { Video } from "lucide-react";

export default function VideosPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-200 rounded-full flex items-center justify-center mb-6">
        <Video className="w-12 h-12 text-pink-600" />
      </div>
      <h1 className="text-4xl font-black text-gray-800">Vidéos</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
        Cette section contiendra la collection de vidéos explicatives et pédagogiques.
      </p>
    </div>
  );
}

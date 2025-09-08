// src/app/dashboard/formations/page.tsx
'use client';

import { GraduationCap } from "lucide-react";

export default function FormationsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6">
        <GraduationCap className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-4xl font-black text-gray-800">Formations</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
        Cette section contiendra les parcours de formation structurés pour maîtriser les programmes.
      </p>
    </div>
  );
}

// src/app/dashboard/documents/page.tsx
'use client';

import { BookOpen } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-indigo-600" />
      </div>
      <h1 className="text-4xl font-black text-gray-800">Documents</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
        Cette section contiendra tous les documents PDF, les cours et les fiches de révision.
      </p>
    </div>
  );
}

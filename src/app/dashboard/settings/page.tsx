// src/app/dashboard/settings/page.tsx
'use client';

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
        <Settings className="w-12 h-12 text-gray-600" />
      </div>
      <h1 className="text-4xl font-black text-gray-800">Paramètres</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
        Cette page permettra aux utilisateurs de gérer les paramètres de leur compte et les notifications.
      </p>
    </div>
  );
}

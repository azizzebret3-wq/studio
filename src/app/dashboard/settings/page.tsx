// src/app/dashboard/settings/page.tsx
'use client';

import React from 'react';
import { Settings, Shield, Lock } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Paramètres
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                Gérez votre compte et vos préférences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md">
          <Card className="glassmorphism shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-5 h-5 text-green-600"/>
                Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full h-11 rounded-lg font-semibold text-sm">
                <Lock className="w-4 h-4 mr-2"/>Changer le mot de passe
              </Button>
               <Button variant="destructive" className="w-full h-11 rounded-lg font-semibold text-sm">
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

// src/app/dashboard/settings/page.tsx
'use client';

import React from 'react';
import { Settings, Bell, Shield, Palette, Lock } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg floating">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text">
                Paramètres
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Personnalisez votre expérience sur la plateforme.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glassmorphism shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Bell className="w-6 h-6 text-purple-600"/>
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez comment vous recevez les communications de notre part.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50">
              <div>
                <Label htmlFor="new-quiz-notif" className="font-semibold">Nouveaux quiz disponibles</Label>
                <p className="text-sm text-gray-500">Soyez notifié quand un quiz de votre catégorie est ajouté.</p>
              </div>
              <Switch id="new-quiz-notif" />
            </div>
             <div className="flex items-center justify-between p-4 rounded-xl bg-white/50">
              <div>
                <Label htmlFor="results-notif" className="font-semibold">Résultats et corrections</Label>
                <p className="text-sm text-gray-500">Recevoir une notification après avoir terminé un quiz.</p>
              </div>
              <Switch id="results-notif" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-4 rounded-xl bg-white/50">
              <div>
                <Label htmlFor="newsletter-notif" className="font-semibold">Newsletter hebdomadaire</Label>
                <p className="text-sm text-gray-500">Conseils et actualités sur les concours.</p>
              </div>
              <Switch id="newsletter-notif" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glassmorphism shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Shield className="w-6 h-6 text-green-600"/>
                Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full h-12 rounded-xl font-semibold">
                <Lock className="w-4 h-4 mr-2"/>Changer le mot de passe
              </Button>
               <Button variant="destructive" className="w-full h-12 rounded-xl font-semibold">
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
          
           <Card className="glassmorphism shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Palette className="w-6 h-6 text-blue-600"/>
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between p-4 rounded-xl bg-white/50">
                <div>
                  <Label htmlFor="dark-mode" className="font-semibold">Mode Sombre</Label>
                  <p className="text-sm text-gray-500">Activez le thème sombre.</p>
                </div>
                <Switch id="dark-mode" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

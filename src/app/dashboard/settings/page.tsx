// src/app/dashboard/settings/page.tsx
'use client';

import React from 'react';
import { Settings, Bell, Shield, Palette, Lock, Moon, Sun } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

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
                Personnalisez votre expérience.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glassmorphism shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Bell className="w-5 h-5 text-purple-600"/>
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez comment vous recevez les communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <Label htmlFor="new-quiz-notif" className="font-semibold text-sm">Nouveaux quiz</Label>
                <p className="text-xs text-muted-foreground">Quand un quiz de votre catégorie est ajouté.</p>
              </div>
              <Switch id="new-quiz-notif" />
            </div>
             <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <Label htmlFor="results-notif" className="font-semibold text-sm">Résultats & corrections</Label>
                <p className="text-xs text-muted-foreground">Recevoir une notification après un quiz.</p>
              </div>
              <Switch id="results-notif" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <div>
                <Label htmlFor="newsletter-notif" className="font-semibold text-sm">Newsletter</Label>
                <p className="text-xs text-muted-foreground">Conseils et actualités sur les concours.</p>
              </div>
              <Switch id="newsletter-notif" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
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
          
           <Card className="glassmorphism shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Palette className="w-5 h-5 text-blue-600"/>
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <Label htmlFor="dark-mode" className="font-semibold text-sm flex items-center gap-2">
                    {theme === 'dark' ? <Moon/> : <Sun/>}
                    Mode Sombre
                  </Label>
                </div>
                <Switch 
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

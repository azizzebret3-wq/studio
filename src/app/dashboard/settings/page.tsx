// src/app/dashboard/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { Settings, Shield, Lock, Loader } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import { getAuth, updatePassword } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Erreur", description: "Utilisateur non trouvé.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      await updatePassword(user, newPassword);
      toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
      setNewPassword('');
      setConfirmPassword('');
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Password change error:", error);
      toast({ title: "Erreur", description: "Impossible de changer le mot de passe. Vous devez peut-être vous reconnecter.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }


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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-11 rounded-lg font-semibold text-sm">
                    <Lock className="w-4 h-4 mr-2"/>Changer le mot de passe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleChangePassword}>
                    <DialogHeader>
                      <DialogTitle>Changer le mot de passe</DialogTitle>
                      <DialogDescription>
                        Entrez votre nouveau mot de passe ci-dessous.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Annuler</Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Enregistrement...</> : 'Enregistrer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

               <Button variant="destructive" className="w-full h-11 rounded-lg font-semibold text-sm">
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

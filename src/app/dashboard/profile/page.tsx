// src/app/dashboard/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, UserCircle, Edit, Save, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, userData, loading, reloadUserData } = useAuth(); // Assuming reloadUserData exists
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setPhone(userData.phone || '');
    }
  }, [userData]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName,
        phone,
      });

      const auth = getAuth();
      if(auth.currentUser){
         await updateProfile(auth.currentUser, {
            displayName: fullName,
         });
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      setIsEditing(false);
      // reloadUserData(); // You might need to implement this in useAuth
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const isPremium = userData?.subscription_type === 'premium';

  if (loading) {
    return <div>Chargement du profil...</div>
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg floating">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text">
                Mon Profil
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Gérez vos informations personnelles et votre compte.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Card className="glassmorphism shadow-xl max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 ring-4 ring-white/50 shadow-lg">
                <AvatarImage src={userData?.photoURL} />
                <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-3xl">
                   {getInitials(userData?.fullName)}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white group-hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
                <span className="sr-only">Changer la photo</span>
              </Button>
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">{userData?.fullName}</CardTitle>
              <CardDescription className="text-gray-600 font-medium">{userData?.email}</CardDescription>
               {isPremium && (
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold shadow-lg px-3 py-1">
                    <Crown className="w-4 h-4 mr-2" />
                    Membre Premium
                  </Badge>
                )}
            </div>
             <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Save className="w-6 h-6 text-gray-600" /> : <Edit className="w-6 h-6 text-gray-600" />}
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label htmlFor="fullName" className="font-semibold text-gray-700">Nom & Prénom(s)</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold text-gray-700">Téléphone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} className="h-12 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
              <Input id="email" value={userData?.email || ''} disabled className="h-12 rounded-xl bg-gray-100" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="competitionType" className="font-semibold text-gray-700">Type de Concours</Label>
              <Input id="competitionType" value={userData?.competitionType || ''} disabled className="h-12 rounded-xl bg-gray-100 capitalize" />
            </div>
            {isEditing && (
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl h-12">Annuler</Button>
                <Button type="submit" className="rounded-xl h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg" disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

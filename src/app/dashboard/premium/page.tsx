// src/app/dashboard/premium/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, Rocket, BrainCircuit, BookOpen, Video, Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { updateUserSubscriptionInFirestore } from '@/lib/firestore.service';
import { useRouter } from 'next/navigation';


const premiumFeatures = [
    { icon: BrainCircuit, text: "Génération de quiz intelligente et illimitée" },
    { icon: BookOpen, text: 'Accès à toute la bibliothèque de documents' },
    { icon: Video, text: 'Accès à toutes les formations vidéo' },
    { icon: Sparkles, text: 'Corrections intelligentes et détaillées' },
    { icon: CheckCircle, text: 'Suivi de performance avancé' },
    { icon: CheckCircle, text: 'Support prioritaire' },
];

const OrangeMoneyLogo = () => (
  <svg width="60" height="24" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0H10C4.47715 0 0 4.47715 0 10V30C0 35.5228 4.47715 40 10 40H90C95.5228 40 100 35.5228 100 30V10C100 4.47715 95.5228 0 90 0H50Z" fill="#212121"/>
    <path d="M23.32 15.16C23.32 12.32 21.04 10 18.2 10C15.36 10 13.08 12.32 13.08 15.16C13.08 18 15.36 20.32 18.2 20.32C21.04 20.32 23.32 18 23.32 15.16ZM34.96 15C34.96 11.8 32.48 9.28 29.32 9.28C26.16 9.28 23.68 11.8 23.68 15C23.68 18.2 26.16 20.72 29.32 20.72C32.48 20.72 34.96 18.2 34.96 15ZM29.32 18.96C27.28 18.96 25.6 17.28 25.6 15.24C25.6 13.2 27.28 11.52 29.32 11.52C31.36 11.52 33.04 13.2 33.04 15.24C33.04 17.28 31.36 18.96 29.32 18.96ZM18.2 18.56C16.48 18.56 15.08 17.08 15.08 15.16C15.08 13.24 16.48 11.76 18.2 11.76C19.92 11.76 21.32 13.24 21.32 15.16C21.32 17.08 19.92 18.56 18.2 18.56Z" fill="#FF7900"/>
    <text x="40" y="26" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#FF7900">money</text>
  </svg>
)

const MoovMoneyLogo = () => (
 <svg width="60" height="24" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="40" rx="8" fill="#00AEEF"/>
    <text x="10" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white">Moov</text>
    <text x="68" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#2E3192">Money</text>
  </svg>
)


export default function PremiumPage() {
  const { user, userData, reloadUserData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
        toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
        return;
    }

    setIsUpgrading(true);

    try {
        await updateUserSubscriptionInFirestore(user.uid, 'premium');
        await reloadUserData();
        toast({
            title: "Félicitations ! 🎉",
            description: "Vous êtes maintenant un membre Premium.",
        });
        router.push('/dashboard');
    } catch (error) {
        console.error("Error upgrading to premium:", error);
        toast({ title: "Erreur", description: "La mise à niveau a échoué. Veuillez réessayer.", variant: "destructive" });
    } finally {
        setIsUpgrading(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Passez à Premium
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Débloquez votre plein potentiel et maximisez vos chances de succès.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Card className="glassmorphism shadow-xl max-w-2xl w-full mt-6 border-2 border-yellow-400/50">
            <CardHeader className="text-center p-8 bg-gradient-to-br from-yellow-400/10 to-orange-400/10">
                <Crown className="w-12 h-12 mx-auto text-yellow-500" />
                <CardTitle className="text-3xl font-bold mt-2">Gagne Ton Concours - Premium</CardTitle>
                <CardDescription className="text-lg font-medium text-muted-foreground mt-2">
                    L'accès complet à tous nos outils de pointe.
                </CardDescription>
                <p className="text-5xl font-black gradient-text mt-4">
                    5000 <span className="text-xl text-gray-500 font-medium">FCFA/an</span>
                </p>
            </CardHeader>
            <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-center mb-6">Inclus dans votre abonnement Premium :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                    {premiumFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <feature.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>
                <Button 
                  onClick={handleUpgrade}
                  disabled={isUpgrading || userData?.subscription_type === 'premium'}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg"
                >
                    {isUpgrading ? <><Loader className="w-5 h-5 mr-3 animate-spin"/> Mise à niveau...</> : (userData?.subscription_type === 'premium' ? 'Vous êtes déjà Premium' : <><Rocket className="w-5 h-5 mr-3" />Je deviens Premium</>)}
                </Button>
                 <div className="text-center mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Paiement sécurisé via Mobile Money :</p>
                    <div className="flex justify-center items-center gap-4">
                        <div className="p-2 rounded-lg bg-white shadow-md">
                          <OrangeMoneyLogo />
                        </div>
                        <div className="p-2 rounded-lg bg-white shadow-md">
                           <MoovMoneyLogo />
                        </div>
                    </div>
                 </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

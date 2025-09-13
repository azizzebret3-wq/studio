// src/app/dashboard/premium/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, Rocket, BrainCircuit, BookOpen, Video, Loader, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import { updateUserSubscriptionInFirestore } from '@/lib/firestore.service';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import QRCode from "react-qr-code";


const premiumFeatures = [
    { icon: BrainCircuit, text: "Génération de quiz intelligente et illimitée" },
    { icon: BookOpen, text: 'Accès à toute la bibliothèque de documents' },
    { icon: Video, text: 'Accès à toutes les formations vidéo' },
    { icon: Sparkles, text: 'Corrections intelligentes et détaillées' },
    { icon: CheckCircle, text: 'Suivi de performance avancé' },
    { icon: CheckCircle, text: 'Support prioritaire' },
];

const MoneroLogo = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48ZM20.175 11.25V24H14.25V36.75H20.175V24H27.825V36.75H33.75V11.25H27.825V23.85H20.175V11.25Z" fill="#FF6600"/>
  </svg>
)

export default function PremiumPage() {
  const { user, userData, reloadUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isMoneroDialogOpen, setIsMoneroDialogOpen] = useState(false);

  // SIMULATION DATA
  const moneroAmount = 0.05;
  const moneroAddress = "44AFFq5kSiGcd6lFFxVPyMvXoT8kDeJoSj42iV3HA1iTZcOCZ2q6yci8VKe9pFPF2Y9Wj7oBvB4Y2Nzz1DE2YKcsgSbrv0g";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(moneroAddress);
    toast({ title: "Copié !", description: "L'adresse Monero a été copiée dans le presse-papiers." });
  };
  
  const handleConfirmPayment = async () => {
    if (!user) return;
    
    setIsUpgrading(true);
    try {
        await updateUserSubscriptionInFirestore(user.uid, 'premium');
        await reloadUserData();
        toast({
            title: 'Félicitations ! 🎉',
            description: 'Votre compte a été mis à niveau vers Premium. Toutes les fonctionnalités ont été débloquées.',
        });
        setIsMoneroDialogOpen(false);
        router.push('/dashboard');
    } catch(error) {
        toast({
            title: 'Erreur',
            description: 'La mise à niveau n\'a pas pu être effectuée.',
            variant: 'destructive',
        });
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

                {userData?.subscription_type === 'premium' ? (
                   <Button disabled className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                      Vous êtes déjà Premium
                   </Button>
                ) : (
                  <Dialog open={isMoneroDialogOpen} onOpenChange={setIsMoneroDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg">
                        <Rocket className="w-5 h-5 mr-3" />Mettre à niveau
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                          <MoneroLogo/>Paiement Monero
                        </DialogTitle>
                        <DialogDescription>
                          Pour finaliser votre abonnement, veuillez envoyer le montant exact à l'adresse ci-dessous.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4 text-center">
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">MONTANT À ENVOYER</p>
                          <p className="text-2xl font-bold tracking-wider">{moneroAmount} XMR</p>
                        </div>
                        <div className="flex justify-center p-4 bg-white rounded-lg">
                           <QRCode value={moneroAddress} size={160} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="monero-address" className="text-sm font-medium text-muted-foreground">ADRESSE DE PAIEMENT</Label>
                           <div className="relative">
                            <input
                              id="monero-address"
                              readOnly
                              value={moneroAddress}
                              className="w-full text-center text-sm font-mono bg-muted rounded-md p-2 pr-10 border"
                            />
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={copyToClipboard}>
                              <Copy className="w-4 h-4"/>
                            </Button>
                           </div>
                        </div>
                         <p className="text-xs text-muted-foreground pt-2">
                          Une fois le paiement effectué, cliquez sur le bouton ci-dessous. La confirmation peut prendre quelques minutes.
                         </p>
                      </div>
                      <DialogFooter>
                         <Button type="button" variant="outline" onClick={() => setIsMoneroDialogOpen(false)} disabled={isUpgrading}>Annuler</Button>
                         <Button onClick={handleConfirmPayment} disabled={isUpgrading}>
                          {isUpgrading ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Confirmation...</> : <>J'ai effectué le paiement</>}
                         </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                 
                 <div className="text-center mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Paiement alternatif via Mobile Money :</p>
                     <p className="text-sm text-muted-foreground">Contactez-nous sur WhatsApp pour un paiement manuel.</p>
                 </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

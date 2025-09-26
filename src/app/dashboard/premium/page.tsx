// src/app/dashboard/premium/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, BrainCircuit, BookOpen, Video, ArrowRight, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const premiumFeatures = [
    { icon: BrainCircuit, text: "Génération de quiz intelligente et illimitée" },
    { icon: BookOpen, text: 'Accès à toute la bibliothèque de documents' },
    { icon: Video, text: 'Accès à toutes les formations vidéo' },
    { icon: Sparkles, text: 'Corrections intelligentes et détaillées' },
    { icon: CheckCircle, text: 'Suivi de performance avancé' },
    { icon: CheckCircle, text: 'Support prioritaire' },
];

const paymentMethods = [
    { name: "Orange Money", instruction: "*144*2*1*75204647*5000#", logo: "/orangelogo.png" },
    { name: "Moov Money", instruction: "*555*2*1*50586160*5000#", logo: "/moovlogo.png" },
    { name: "Wave", instruction: "22654808048", logo: "/wavelogo.png" }
];

const adminContacts = [
    { name: "Admin 1", number: "22675204647" },
    { name: "Admin 2", number: "22654808048" },
    { name: "Admin 3", number: "22654776805" }
];


export default function PremiumPage() {
  const { userData } = useAuth();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast({ title: 'Copié !', description: 'La syntaxe a été copiée dans le presse-papiers.' });
    });
  };

  const whatsAppMessage = "Bonjour, je viens d'effectuer le paiement pour l'abonnement Premium. Voici ma preuve de paiement.";
  const encodedMessage = encodeURIComponent(whatsAppMessage);

  return (
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glassmorphism shadow-xl border-2 border-yellow-400/50">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {premiumFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                              <feature.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="font-medium">{feature.text}</span>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>

           <Card className="glassmorphism shadow-xl">
              <CardHeader>
                  <CardTitle className="text-2xl">Comment s'abonner ?</CardTitle>
                  <CardDescription>Suivez ces étapes simples pour activer votre compte Premium.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                    <h3 className="font-bold text-lg mb-2">Étape 1 : Effectuez le paiement</h3>
                    <p className="text-muted-foreground mb-4">Choisissez l'un des moyens de paiement ci-dessous et effectuez un dépôt de 5000 FCFA.</p>
                    <div className="space-y-3">
                        {paymentMethods.map(method => (
                            <div key={method.name} className="flex items-center justify-between p-3 rounded-lg bg-background/60 border">
                                <span className="font-semibold">{method.name}</span>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{method.instruction}</code>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(method.instruction)}>
                                        <Copy className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="font-bold text-lg mb-2">Étape 2 : Envoyez la preuve</h3>
                    <p className="text-muted-foreground mb-4">Après le paiement, faites une capture d'écran et envoyez-la à l'un de nos administrateurs via WhatsApp.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {adminContacts.map(admin => (
                            <Button key={admin.number} asChild className="w-full h-11 bg-green-500 hover:bg-green-600 text-white">
                                <Link href={`https://wa.me/${admin.number}?text=${encodedMessage}`} target="_blank">
                                    {admin.name} <ArrowRight className="w-4 h-4 ml-2"/>
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">Étape 3 : Activation</h3>
                    <p className="text-muted-foreground">Un administrateur vérifiera votre paiement et activera votre compte Premium dans les plus brefs délais.</p>
                </div>
                
                {userData?.subscription_type === 'premium' && (
                     <div className="p-4 text-center rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold">
                        Votre compte est déjà Premium !
                     </div>
                )}
              </CardContent>
           </Card>
        </div>
      </div>
  );
}

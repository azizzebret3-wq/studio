// src/app/dashboard/premium/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, Rocket, BrainCircuit, BookOpen, Video } from 'lucide-react';
import Link from 'next/link';

const premiumFeatures = [
    { icon: BrainCircuit, text: "Génération de quiz intelligente et illimitée" },
    { icon: BookOpen, text: 'Accès à toute la bibliothèque de documents' },
    { icon: Video, text: 'Accès à toutes les formations vidéo' },
    { icon: Sparkles, text: 'Corrections intelligentes et détaillées' },
    { icon: CheckCircle, text: 'Suivi de performance avancé' },
    { icon: CheckCircle, text: 'Support prioritaire' },
];

export default function PremiumPage() {
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
                <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg">
                    <Rocket className="w-5 h-5 mr-3" />
                    Je deviens Premium
                </Button>
                 <p className="text-xs text-center text-muted-foreground mt-4">
                    Paiement sécurisé. Annulation possible à tout moment.
                </p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

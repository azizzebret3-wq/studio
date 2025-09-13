// src/app/dashboard/premium/page.tsx
'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Sparkles, CheckCircle, Rocket, BrainCircuit, BookOpen, Video, Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
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

const CinetPayButton = () => {
    const { user, userData } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = () => {
        if (!user || !userData) {
            toast({ title: 'Erreur', description: 'Vous devez être connecté pour effectuer un paiement.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);

        const transactionId = `GTC-${user.uid}-${Date.now()}`;
        
        window.CinetPay.getCheckout({
            transaction_id: transactionId,
            amount: 5000,
            currency: 'XOF',
            channels: 'ALL',
            description: 'Abonnement Premium - Gagne Ton Concours (1 an)',
            customer_name: userData.fullName || 'Utilisateur',
            customer_surname: '',
            customer_email: userData.email || `${userData.phone}@gagnetonconcours.app`,
            customer_phone_number: userData.phone,
            metadata: user.uid, // Pass user UID here
            notify_url: `${window.location.origin}/api/cinetpay-notify`,
        });

        window.CinetPay.on('payment-pending', () => {
             toast({ title: 'Paiement en attente', description: 'Veuillez suivre les instructions pour finaliser.'});
             setIsLoading(false);
        });

        window.CinetPay.on('payment-error', (data) => {
            toast({ title: 'Échec du paiement', description: `Erreur: ${data.message}`, variant: 'destructive'});
            setIsLoading(false);
        });

        window.CinetPay.on('payment-success', async (data) => {
            toast({ title: 'Paiement réussi !', description: 'Vérification de votre abonnement...'});
            
            // Although we use a webhook, we can optimistically update the UI
            try {
                await updateUserSubscriptionInFirestore(user.uid, 'premium');
                toast({ title: 'Félicitations ! 🎉', description: 'Votre compte a été mis à niveau vers Premium.'});
                router.push('/dashboard');
            } catch(e) {
                toast({ title: 'Erreur de mise à jour', description: 'Veuillez recharger la page pour voir votre statut.', variant: 'destructive'});
            } finally {
                setIsLoading(false);
            }
        });
    };

    return (
        <Button 
            onClick={handlePayment} 
            disabled={isLoading}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg"
        >
            {isLoading ? <Loader className="w-5 h-5 mr-3 animate-spin"/> : <Rocket className="w-5 h-5 mr-3" />}
            Mettre à niveau
        </Button>
    )
}

export default function PremiumPage() {
  const { userData } = useAuth();
  
  return (
    <>
      <Script 
        src="https://cdn.cinetpay.com/seamless/main.js"
        strategy="afterInteractive"
        onLoad={() => {
            window.CinetPay.setConfig({
                apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY!,
                site_id: parseInt(process.env.NEXT_PUBLIC_CINETPAY_SITE_ID!, 10),
                mode: 'PRODUCTION', // Use 'PRODUCTION' for real payments
                notify_url: `${window.location.origin}/api/cinetpay-notify`
            });
        }}
      />
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
                    <CinetPayButton />
                  )}
                   
                   <div className="text-center mt-6">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Paiement sécurisé via Orange Money, Moov, Visa, etc.</p>
                       <p className="text-sm text-muted-foreground">Contactez-nous sur WhatsApp pour un paiement manuel.</p>
                   </div>
              </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// CinetPay window interface
declare global {
    interface Window {
        CinetPay: any;
    }
}

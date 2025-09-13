// src/app/dashboard/premium/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
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

const CinetPayButton: React.FC<{ onSuccess: (transactionId: string) => void; user: any; userData: any }> = ({ onSuccess, user, userData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  const handlePayment = () => {
    if (!user || !userData) {
        toast({ title: 'Erreur', description: 'Vous devez être connecté pour payer.', variant: 'destructive'});
        return;
    }
    if ((window as any).CinetPay) {
      setIsLoading(true);
      const transaction_id = Math.floor(Math.random() * 100000000).toString();

      (window as any).CinetPay.setConfig({
        apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
        site_id: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
        notify_url: `${window.location.origin}/api/cinetpay-notify`,
        mode: 'PRODUCTION', // Use 'PRODUCTION' for real payments
      });

      (window as any).CinetPay.getCheckout({
        transaction_id: transaction_id,
        amount: 5000,
        currency: 'XOF',
        channels: 'ALL',
        description: 'Abonnement Premium - Gagne Ton Concours',
        metadata: user.uid, // CRITICAL: Pass Firebase User ID in metadata
        customer_name: userData?.fullName || 'Utilisateur',
        customer_surname: '',
        customer_email: userData?.email || '',
        customer_phone_number: userData?.phone || '',
        customer_address: 'N/A',
        customer_city: 'N/A',
        customer_country: 'BF',
        customer_state: 'N/A',
        customer_zip_code: '00226'
      });

      (window as any).CinetPay.on('payment', (e: any) => {
        // This callback is for the client-side result.
        // The definitive "success" is handled by the webhook.
        if (e.status === 'ACCEPTED') {
          onSuccess(transaction_id);
        } else {
          toast({ title: 'Paiement Annulé ou Échoué', description: 'Votre paiement n\'a pas été complété.', variant: 'destructive'});
          setIsLoading(false);
        }
      });
       (window as any).CinetPay.on('error', (e:any) => {
            console.error('CinetPay Error:', e);
            toast({ title: 'Erreur de paiement', description: 'Une erreur technique est survenue.', variant: 'destructive'});
            setIsLoading(false);
      });
      (window as any).CinetPay.on('close', () => {
        // This is called when the user closes the payment window without paying.
        if (!isLoading) return; // Avoid setting loading to false if payment is already processing
        console.log('CinetPay window closed by user.');
        setIsLoading(false);
      });
    } else {
         toast({ title: 'Erreur', description: 'Le service de paiement n\'est pas disponible. Veuillez rafraîchir la page.', variant: 'destructive'});
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg"
    >
        {isLoading ? <><Loader className="w-5 h-5 mr-3 animate-spin"/> Traitement...</> : <><Rocket className="w-5 h-5 mr-3" />Je deviens Premium</>}
    </Button>
  );
};


export default function PremiumPage() {
  const { user, userData, reloadUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const handleUpgradeSuccess = useCallback(async (transactionId: string) => {
    if (!user) return;
    
    // Don't set loading state here, as the webhook will handle the update.
    // Just give feedback to the user.
    toast({
        title: "Paiement en cours de validation... ⏳",
        description: "Votre paiement a été reçu. Votre compte sera mis à niveau dans quelques instants.",
        duration: 10000, // Keep the toast longer
    });

    // Optionally, you can redirect the user or show a pending state on the UI.
    // The webhook is the source of truth, so we don't grant premium access here.
    // A good UX is to poll for the user's new status or redirect them after a delay.
    setTimeout(() => {
        reloadUserData(); // Check for the updated status
        router.push('/dashboard');
        toast({
            title: "Vérification terminée",
            description: "Votre statut a été mis à jour. Bienvenue parmi les membres Premium ! 🎉",
        });
    }, 8000); // 8 seconds delay to allow webhook to process

  }, [user, reloadUserData, router, toast]);


  return (
    <>
    <Script src="https://cdn.cinetpay.com/seamless/main.js" strategy="afterInteractive" />
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
                  <CinetPayButton onSuccess={handleUpgradeSuccess} user={user} userData={userData} />
                )}
                 
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
    </>
  );
}

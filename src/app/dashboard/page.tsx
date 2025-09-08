// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">
        Bienvenue, {userData?.fullName || 'cher(e) candidat(e)'} !
      </h1>
      <p className="mt-2 text-muted-foreground">
        Nous sommes ravis de vous voir. Prêt(e) à commencer votre préparation ?
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Commencer un Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Testez vos connaissances et préparez-vous efficacement.
            </p>
            <Button>
              Choisir un quiz <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explorer les documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Accédez à des centaines de cours, annales et fiches de révision.
            </p>
            <Button>
              Voir les documents <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1 bg-primary text-primary-foreground">
           <CardHeader>
            <CardTitle>Passez Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary-foreground/80 mb-4">
              Débloquez l'accès illimité à toutes les fonctionnalités et maximisez vos chances de réussite.
            </p>
            <Button variant="secondary">
              Mettre à niveau <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
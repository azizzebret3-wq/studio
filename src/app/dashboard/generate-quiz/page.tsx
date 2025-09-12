// src/app/dashboard/generate-quiz/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Loader, Sparkles, Wand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';

export default function GenerateQuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        title: 'Sujet manquant',
        description: 'Veuillez entrer un sujet pour générer le quiz.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result: GenerateQuizOutput = await generateQuiz({ topic });
      
      // Stocker le quiz généré dans la session storage pour le passer à la page suivante
      sessionStorage.setItem('generatedQuiz', JSON.stringify(result));
      
      toast({
        title: 'Quiz généré avec succès !',
        description: 'Vous allez être redirigé pour commencer le quiz.',
      });

      // Rediriger vers la page pour passer le quiz avec un paramètre spécial
      router.push('/dashboard/take-quiz?source=generated');

    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({
        title: 'Erreur de génération',
        description: "L'IA n'a pas pu générer le quiz. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-150px)]">
      <Card className="w-full max-w-2xl glassmorphism shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black gradient-text">Générateur de Quiz IA</CardTitle>
          <CardDescription className="text-lg font-medium text-muted-foreground">
            Entraînez-vous sur n'importe quel sujet, à la demande.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateAndStart} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base font-semibold">
                Quel sujet souhaitez-vous aborder ?
              </Label>
              <Input
                id="topic"
                placeholder="Ex: La révolution de 1983 au Burkina Faso, le droit constitutionnel..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                className="h-12 text-base rounded-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 mr-3 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand className="w-5 h-5 mr-3" />
                  Générer et commencer le quiz
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// src/app/dashboard/generate-quiz/page.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BrainCircuit, Loader, Wand2, Copy, Crown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Store generated quiz in memory (a more robust solution would use state management like Zustand or Redux)
let quizStore: GenerateQuizOutput | null = null;


export default function GenerateQuizPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [topic, setTopic] = useState('');
  const [competitionType, setCompetitionType] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);

  const canGenerate = userData?.role === 'admin' || userData?.subscription_type === 'premium';

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !competitionType) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez renseigner un sujet et un type de concours.',
      });
      return;
    }
    
    setIsLoading(true);
    setGeneratedQuiz(null);

    try {
      const result = await generateQuiz({ topic, competitionType, numberOfQuestions });
      setGeneratedQuiz(result);
      quizStore = result; // Store the quiz
      toast({
        title: 'Quiz généré !',
        description: 'Votre quiz a été créé avec succès par l\'IA.',
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: 'Impossible de générer le quiz. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copié !',
      description: 'Le contenu a été copié dans le presse-papiers.',
    });
  };

  const startGeneratedQuiz = () => {
    if (generatedQuiz) {
      router.push('/dashboard/take-quiz?source=generated');
    }
  };

  if (authLoading || !userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
      </div>
    );
  }

  if (!canGenerate) {
    return (
       <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-white/50 dark:bg-black/20 rounded-2xl shadow-inner">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Fonctionnalité Premium</h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Le générateur de quiz par IA est réservé à nos membres Premium. Passez au niveau supérieur pour créer des quiz illimités et sur-mesure !
          </p>
           <Button size="lg" className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold shadow-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Devenir Premium
            </Button>
        </div>
      </div>
    )
  }


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">Générateur de Quiz IA</h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Créez des quiz personnalisés en quelques secondes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card className="glassmorphism shadow-xl sticky top-24">
                <CardHeader>
                    <CardTitle>Paramètres du Quiz</CardTitle>
                    <CardDescription>Définissez les options pour générer votre quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGenerateQuiz} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="topic">Sujet</Label>
                            <Input
                                id="topic"
                                placeholder="Ex: Histoire du Burkina Faso"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="competitionType">Type de concours</Label>
                            <Select onValueChange={setCompetitionType} value={competitionType} disabled={isLoading}>
                                <SelectTrigger id="competitionType">
                                <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="direct">Concours Direct</SelectItem>
                                <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="numberOfQuestions">Nombre de questions</Label>
                            <Input
                                id="numberOfQuestions"
                                type="number"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
                                min="1"
                                max="50"
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Génération en cours...
                                </>
                            ) : (
                                <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Générer le Quiz
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="glassmorphism shadow-xl min-h-[60vh]">
                <CardHeader>
                    <CardTitle>Résultat</CardTitle>
                    <CardDescription>Le quiz généré par l'IA apparaîtra ici.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center">
                            <BrainCircuit className="w-16 h-16 text-purple-400 animate-pulse" />
                            <p className="mt-4 text-lg font-semibold text-gray-600">L'IA est en pleine réflexion...</p>
                            <p className="text-sm text-gray-500">Création des questions en cours.</p>
                        </div>
                    )}
                    {generatedQuiz?.quiz && (
                        <div className="space-y-6">
                            <div className="p-4 border rounded-lg bg-white/50 dark:bg-black/20">
                                <h2 className="text-xl font-bold">{generatedQuiz.quiz.title}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{generatedQuiz.quiz.description}</p>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {generatedQuiz.quiz.questions.map((q, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="font-semibold text-left hover:no-underline">
                                        Question {index + 1}: {q.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-2 pl-4">
                                            {q.options.map((opt, i) => (
                                            <p
                                                key={i}
                                                className={`p-2 rounded-md text-sm ${
                                                q.correctAnswers.includes(opt)
                                                    ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 font-bold'
                                                    : 'bg-gray-100 dark:bg-gray-800/50'
                                                }`}
                                            >
                                                {opt}
                                            </p>
                                            ))}
                                            {q.explanation && (
                                                <div className="mt-2 p-2 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                                                    <strong>Explication :</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>

                             <div className="flex gap-4">
                               <Button onClick={startGeneratedQuiz} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold">
                                  <Wand2 className="mr-2 h-4 w-4" /> Commencer ce quiz
                               </Button>
                               <Button onClick={() => copyToClipboard(JSON.stringify(generatedQuiz.quiz, null, 2))} variant="outline" className="w-full">
                                  <Copy className="mr-2 h-4 w-4" /> Copier le JSON du quiz
                               </Button>
                            </div>
                        </div>
                    )}
                     {!isLoading && !generatedQuiz && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center">
                            <Wand2 className="w-16 h-16 text-gray-300" />
                            <p className="mt-4 text-lg font-semibold text-gray-600">En attente de génération</p>
                            <p className="text-sm text-gray-500">Utilisez le formulaire pour créer un nouveau quiz.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Function to retrieve the stored quiz
export function getGeneratedQuiz() {
  return quizStore;
}

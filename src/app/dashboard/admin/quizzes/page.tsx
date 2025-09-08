// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import React, { useState } from 'react';
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
import { BrainCircuit, Loader, Wand2, Copy, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AdminQuizzesPage() {
  const { toast } = useToast();

  const [topic, setTopic] = useState('');
  const [competitionType, setCompetitionType] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);

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
  
  const handleSaveQuiz = () => {
    // Logic to save the quiz to Firestore
    toast({
        title: 'Fonctionnalité à venir',
        description: 'La sauvegarde des quiz sera bientôt disponible.',
    });
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copié !',
      description: 'Le contenu a été copié dans le presse-papiers.',
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Générateur de Quiz IA
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Générez, validez et sauvegardez des quiz pour la communauté.
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
                        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold" disabled={isLoading}>
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
                    <CardDescription>Le quiz généré par l'IA apparaîtra ici pour validation.</CardDescription>
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
                               <Button onClick={handleSaveQuiz} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold">
                                  <Save className="mr-2 h-4 w-4" /> Enregistrer ce quiz
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

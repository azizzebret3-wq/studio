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
import { BrainCircuit, Loader, Wand2, Copy, Save, PlusCircle, Trash2, CalendarClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { saveQuizToFirestore, Quiz } from '@/lib/firestore.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';


type ManualQuestion = {
  id: number;
  question: string;
  options: { id: number, text: string }[];
  correctAnswers: string[];
  explanation: string;
}

export default function AdminQuizzesPage() {
  const { toast } = useToast();

  // AI Generator State
  const [topic, setTopic] = useState('');
  const [competitionType, setCompetitionType] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen');
  const [quizAccess, setQuizAccess] = useState<'gratuit' | 'premium'>('gratuit');
  const [isMockExam, setIsMockExam] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');


  // Manual Creator State
  const [manualQuizTitle, setManualQuizTitle] = useState('');
  const [manualQuizDescription, setManualQuizDescription] = useState('');
  const [manualQuizCategory, setManualQuizCategory] = useState('');
  const [manualQuizDuration, setManualQuizDuration] = useState(15);
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);
  const [isManualMockExam, setIsManualMockExam] = useState(false);
  const [manualScheduledFor, setManualScheduledFor] = useState('');

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
      const result = await generateQuiz({ topic, competitionType, numberOfQuestions, difficulty: 'moyen' });
      setGeneratedQuiz(result);
      setManualQuizCategory(topic); // Pre-fill category
      toast({
        title: 'Quiz généré !',
        description: 'Votre quiz a été créé avec succès pour validation.',
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
  
  const handleSaveQuiz = async () => {
    if (!generatedQuiz) return;
     if (isMockExam && !scheduledFor) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez définir une date pour le concours blanc.' });
      return;
    }
    setIsSaving(true);
    try {
      const quizDataToSave: Omit<Quiz, 'id'> = {
        ...generatedQuiz.quiz,
        category: manualQuizCategory || topic,
        difficulty: quizDifficulty,
        access_type: quizAccess,
        duration_minutes: numberOfQuestions * 1,
        total_questions: generatedQuiz.quiz.questions.length,
        createdAt: new Date(),
        isMockExam,
        scheduledFor: isMockExam ? new Date(scheduledFor) : undefined,
      };
      
      await saveQuizToFirestore(quizDataToSave);

      toast({
          title: 'Quiz Sauvegardé !',
          description: 'Le quiz est maintenant disponible pour les utilisateurs.',
      });
      setGeneratedQuiz(null);
    } catch (error) {
      console.error("Error saving quiz: ", error);
      toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: 'Le quiz n\'a pas pu être sauvegardé.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copié !',
      description: 'Le contenu a été copié dans le presse-papiers.',
    });
  };

  const addManualQuestion = () => {
    const newQuestion: ManualQuestion = {
        id: Date.now(),
        question: '',
        options: [{id: 1, text: ''}, {id: 2, text: ''}],
        correctAnswers: [],
        explanation: '',
    };
    setManualQuestions([...manualQuestions, newQuestion]);
  };

  const removeManualQuestion = (id: number) => {
    setManualQuestions(manualQuestions.filter(q => q.id !== id));
  };
  
  const handleManualQuestionChange = (id: number, field: keyof ManualQuestion, value: any) => {
      setManualQuestions(manualQuestions.map(q => q.id === id ? {...q, [field]: value} : q));
  }

  const handleOptionChange = (qId: number, optId: number, text: string) => {
      setManualQuestions(manualQuestions.map(q => q.id === qId ? {
          ...q,
          options: q.options.map(opt => opt.id === optId ? {...opt, text} : opt)
      } : q));
  }
  
  const addOption = (qId: number) => {
    setManualQuestions(manualQuestions.map(q => q.id === qId ? {
      ...q,
      options: [...q.options, { id: Date.now(), text: '' }]
    } : q));
  }

  const handleCorrectAnswerChange = (qId: number, optionText: string, isChecked: boolean) => {
    setManualQuestions(manualQuestions.map(q => {
      if (q.id === qId) {
        const newCorrectAnswers = isChecked
          ? [...q.correctAnswers, optionText]
          : q.correctAnswers.filter(ans => ans !== optionText);
        return { ...q, correctAnswers: newCorrectAnswers };
      }
      return q;
    }));
  };

  const handleSaveManualQuiz = async () => {
     if (isManualMockExam && !manualScheduledFor) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez définir une date pour le concours blanc.' });
      return;
    }
    setIsSaving(true);
    try {
        const manualQuizToSave: Omit<Quiz, 'id'> = {
            title: manualQuizTitle,
            description: manualQuizDescription,
            category: manualQuizCategory,
            difficulty: quizDifficulty,
            access_type: quizAccess,
            duration_minutes: manualQuizDuration,
            total_questions: manualQuestions.length,
            createdAt: new Date(),
            isMockExam: isManualMockExam,
            scheduledFor: isManualMockExam ? new Date(manualScheduledFor) : undefined,
            questions: manualQuestions.map(q => ({
                question: q.question,
                options: q.options.map(o => o.text),
                correctAnswers: q.correctAnswers,
                explanation: q.explanation
            })),
        };
        await saveQuizToFirestore(manualQuizToSave);
         toast({
            title: 'Quiz Sauvegardé !',
            description: 'Le quiz manuel a été ajouté avec succès.',
        });
        // Reset form
        setManualQuizTitle('');
        setManualQuizDescription('');
        setManualQuizCategory('');
        setManualQuestions([]);

    } catch (error) {
       console.error("Error saving manual quiz: ", error);
       toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: 'Le quiz manuel n\'a pas pu être sauvegardé.',
      });
    } finally {
        setIsSaving(false);
    }
  }


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
                Gestion des Quiz
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Générez automatiquement ou créez manuellement des quiz.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="ai_generator">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai_generator"><Wand2 className="mr-2 h-4 w-4" />Génération Automatique</TabsTrigger>
            <TabsTrigger value="manual_creator"><PlusCircle className="mr-2 h-4 w-4" />Ajouter Manuellement</TabsTrigger>
        </TabsList>
        <TabsContent value="ai_generator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-1">
                    <Card className="glassmorphism shadow-xl sticky top-24">
                        <CardHeader>
                            <CardTitle>Paramètres de Génération</CardTitle>
                            <CardDescription>Définissez les options pour générer votre quiz.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerateQuiz} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="topic">Sujet / Catégorie</Label>
                                    <Input
                                        id="topic"
                                        placeholder="Ex: Histoire du Burkina Faso"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        disabled={isLoading || isSaving}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="competitionType">Type de concours</Label>
                                    <Select onValueChange={setCompetitionType} value={competitionType} disabled={isLoading || isSaving}>
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
                                        disabled={isLoading || isSaving}
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold" disabled={isLoading || isSaving}>
                                    {isLoading ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Génération en cours... </>) : (<> <Wand2 className="mr-2 h-4 w-4" /> Générer le Quiz </>)}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="glassmorphism shadow-xl min-h-[60vh]">
                        <CardHeader>
                            <CardTitle>Résultat</CardTitle>
                            <CardDescription>Le quiz généré apparaîtra ici pour validation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center">
                                    <BrainCircuit className="w-16 h-16 text-purple-400 animate-pulse" />
                                    <p className="mt-4 text-lg font-semibold text-gray-600">Analyse et création en cours...</p>
                                    <p className="text-sm text-gray-500">Génération des questions.</p>
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
                                            <AccordionTrigger className="font-semibold text-left hover:no-underline"> Question {index + 1}: {q.question} </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pl-4">
                                                    {q.options.map((opt, i) => (<p key={i} className={`p-2 rounded-md text-sm ${ q.correctAnswers.includes(opt) ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 font-bold' : 'bg-gray-100 dark:bg-gray-800/50' }`}> {opt} </p>))}
                                                    {q.explanation && ( <div className="mt-2 p-2 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"> <strong>Explication :</strong> {q.explanation} </div>)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        ))}
                                    </Accordion>
                                     <div className="space-y-4 p-4 border rounded-lg">
                                        <h3 className="font-semibold mb-2">Options de sauvegarde</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Difficulté</Label>
                                                <Select onValueChange={(v) => setQuizDifficulty(v as any)} defaultValue="moyen">
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="facile">Facile</SelectItem>
                                                        <SelectItem value="moyen">Moyen</SelectItem>
                                                        <SelectItem value="difficile">Difficile</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Accès</Label>
                                                <Select onValueChange={(v) => setQuizAccess(v as any)} defaultValue="gratuit">
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="gratuit">Gratuit</SelectItem>
                                                        <SelectItem value="premium">Premium</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                         <div className="flex items-center space-x-2 pt-4">
                                            <Switch id="mock-exam-switch" checked={isMockExam} onCheckedChange={setIsMockExam} />
                                            <Label htmlFor="mock-exam-switch">Définir comme Concours Blanc</Label>
                                        </div>
                                        {isMockExam && (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="scheduledFor">Date et heure de début</Label>
                                                <Input id="scheduledFor" type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} />
                                            </div>
                                        )}
                                     </div>
                                    <div className="flex gap-4">
                                    <Button onClick={handleSaveQuiz} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold" disabled={isSaving}>
                                        {isSaving ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde... </>) : (<> <Save className="mr-2 h-4 w-4" /> Enregistrer ce quiz </>)}
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
        </TabsContent>
        <TabsContent value="manual_creator">
           <Card className="glassmorphism shadow-xl mt-4">
             <CardHeader>
                <CardTitle>Créateur de Quiz Manuel</CardTitle>
                <CardDescription>Composez votre propre quiz, question par question.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="manual_title">Titre du Quiz</Label>
                        <Input id="manual_title" placeholder="Ex: Les capitales du monde" value={manualQuizTitle} onChange={e => setManualQuizTitle(e.target.value)} />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="manual_category">Catégorie</Label>
                        <Input id="manual_category" placeholder="Ex: Culture générale" value={manualQuizCategory} onChange={e => setManualQuizCategory(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="manual_description">Description du Quiz</Label>
                    <Textarea id="manual_description" placeholder="Une brève description du quiz" value={manualQuizDescription} onChange={e => setManualQuizDescription(e.target.value)} />
                </div>
                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Options du quiz</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>Difficulté</Label>
                            <Select onValueChange={(v) => setQuizDifficulty(v as any)} defaultValue="moyen">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facile">Facile</SelectItem>
                                    <SelectItem value="moyen">Moyen</SelectItem>
                                    <SelectItem value="difficile">Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Accès</Label>
                            <Select onValueChange={(v) => setQuizAccess(v as any)} defaultValue="gratuit">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gratuit">Gratuit</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="manual_duration">Durée (minutes)</Label>
                            <Input id="manual_duration" type="number" value={manualQuizDuration} onChange={e => setManualQuizDuration(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                        <Switch id="manual-mock-exam" checked={isManualMockExam} onCheckedChange={setIsManualMockExam} />
                        <Label htmlFor="manual-mock-exam">Définir comme Concours Blanc</Label>
                    </div>
                    {isManualMockExam && (
                        <div className="space-y-1.5">
                            <Label htmlFor="manual_scheduledFor">Date et heure de début</Label>
                            <Input id="manual_scheduledFor" type="datetime-local" value={manualScheduledFor} onChange={e => setManualScheduledFor(e.target.value)} />
                        </div>
                    )}
                 </div>

                <div className="border-t pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Questions</h3>
                        <Button variant="outline" size="sm" onClick={addManualQuestion}><PlusCircle className="w-4 h-4 mr-2" />Ajouter une question</Button>
                    </div>
                     {manualQuestions.map((q, qIndex) => (
                        <Card key={q.id} className="p-4 bg-background/50">
                            <div className="flex justify-between items-start">
                                <Label className="mb-2">Question {qIndex + 1}</Label>
                                <Button variant="ghost" size="icon" className="text-red-500 w-7 h-7" onClick={() => removeManualQuestion(q.id)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                            <div className="space-y-3">
                                <Input placeholder="Texte de la question" value={q.question} onChange={e => handleManualQuestionChange(q.id, 'question', e.target.value)}/>
                                <Label className="text-xs">Options (cochez la ou les bonnes réponses)</Label>
                                {q.options.map((opt, optIndex) => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                        <Checkbox 
                                          checked={q.correctAnswers.includes(opt.text)}
                                          onCheckedChange={(checked) => handleCorrectAnswerChange(q.id, opt.text, Boolean(checked))}
                                          disabled={!opt.text}
                                        />
                                        <Input placeholder={`Option ${optIndex + 1}`} value={opt.text} onChange={e => handleOptionChange(q.id, opt.id, e.target.value)} />
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addOption(q.id)}>Ajouter une option</Button>
                                <Textarea placeholder="Explication de la bonne réponse (optionnel)" value={q.explanation} onChange={e => handleManualQuestionChange(q.id, 'explanation', e.target.value)} />
                            </div>
                        </Card>
                     ))}
                </div>

                <Button onClick={handleSaveManualQuiz} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold" disabled={isSaving || manualQuestions.length === 0 || !manualQuizTitle}>
                    {isSaving ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde... </>) : (<> <Save className="mr-2 h-4 w-4" /> Enregistrer le quiz manuel</>)}
                </Button>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

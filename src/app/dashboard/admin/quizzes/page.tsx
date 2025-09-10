// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, useWatch, Control, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { BrainCircuit, Loader, Wand2, Copy, Save, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { saveQuizToFirestore, Quiz } from '@/lib/firestore.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const manualQuestionSchema = z.object({
  question: z.string().min(1, 'La question ne peut pas être vide.'),
  options: z.array(
    z.object({ 
      text: z.string().min(1, "L'option ne peut pas être vide."),
    })
  ).min(2, 'Au moins deux options sont requises.'),
  correctAnswers: z.array(z.string()).min(1, 'Au moins une bonne réponse est requise.'),
  explanation: z.string().optional(),
});

const manualQuizSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  duration: z.number().min(1, 'La durée doit être d\'au moins 1 minute.'),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  access: z.enum(['gratuit', 'premium']),
  isMockExam: z.boolean(),
  scheduledFor: z.string().optional(),
  questions: z.array(manualQuestionSchema).min(1, 'Au moins une question est requise.'),
}).refine(data => !data.isMockExam || (data.isMockExam && data.scheduledFor), {
    message: "La date du concours blanc est requise.",
    path: ["scheduledFor"],
});

type ManualQuizFormValues = z.infer<typeof manualQuizSchema>;

// New component for a single question card
const ManualQuestionCard = ({
  qIndex,
  control,
  register,
  removeQuestion,
  errors,
  watch,
}: {
  qIndex: number;
  control: Control<ManualQuizFormValues>;
  register: UseFormRegister<ManualQuizFormValues>;
  removeQuestion: (index: number) => void;
  errors: any;
  watch: any;
}) => {
  const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`,
  });

  const questionOptions = watch(`questions.${qIndex}.options`);

  return (
    <Card className="p-4 bg-background/50">
      <div className="flex justify-between items-start mb-2">
        <Label className="font-semibold">Question {qIndex + 1}</Label>
        <Button variant="ghost" size="icon" className="text-red-500 w-7 h-7" onClick={() => removeQuestion(qIndex)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <Textarea placeholder="Texte de la question" {...register(`questions.${qIndex}.question`)} />
        {errors.questions?.[qIndex]?.question && (
          <p className="text-sm text-red-500">{errors.questions[qIndex]?.question?.message}</p>
        )}

        <Label className="text-xs text-muted-foreground">Options (cochez la ou les bonnes réponses)</Label>
        {errors.questions?.[qIndex]?.correctAnswers && (
          <p className="text-sm text-red-500">{errors.questions[qIndex]?.correctAnswers.message}</p>
        )}

        {options.map((opt, optIndex) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`questions.${qIndex}.correctAnswers`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value?.includes(questionOptions?.[optIndex]?.text || '')}
                  onCheckedChange={(checked) => {
                    const optionText = questionOptions?.[optIndex]?.text;
                    if (!optionText) return;
                    return checked
                      ? field.onChange([...(field.value || []), optionText])
                      : field.onChange(field.value?.filter((value) => value !== optionText));
                  }}
                />
              )}
            />
            <Input placeholder={`Option ${optIndex + 1}`} {...register(`questions.${qIndex}.options.${optIndex}.text`)} />
            <Button variant="ghost" size="icon" className="text-muted-foreground w-7 h-7" onClick={() => removeOption(optIndex)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {errors.questions?.[qIndex]?.options && <p className="text-sm text-red-500">Veuillez remplir toutes les options.</p>}

        <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ text: '' })}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Ajouter une option
        </Button>
        <Textarea placeholder="Explication de la bonne réponse (optionnel)" {...register(`questions.${qIndex}.explanation`)} />
      </div>
    </Card>
  );
};


export default function AdminQuizzesPage() {
  const { toast } = useToast();
  const router = useRouter();

  // AI Generator State
  const [generatorState, setGeneratorState] = useState({
    topic: '',
    competitionType: '',
    numberOfQuestions: 10,
    difficulty: 'moyen' as 'facile' | 'moyen' | 'difficile',
    access: 'gratuit' as 'gratuit' | 'premium',
    isMockExam: false,
    scheduledFor: '',
    category: '',
    isLoading: false,
    isSaving: false,
  });

  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  
  // Manual Form setup with react-hook-form
    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ManualQuizFormValues>({
        resolver: zodResolver(manualQuizSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            duration: 15,
            difficulty: 'moyen',
            access: 'gratuit',
            isMockExam: false,
            scheduledFor: '',
            questions: [{ question: '', options: [{text: ''}, {text: ''}], correctAnswers: [], explanation: '' }],
        },
    });

    const { fields: manualQuestions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: "questions",
    });
    
    const watchIsManualMockExam = watch('isMockExam');
    const [isSavingManual, setIsSavingManual] = useState(false);


  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatorState.topic || !generatorState.competitionType) {
      toast({
        variant: 'destructive',
        title: 'Champs manquants',
        description: 'Veuillez renseigner un sujet et un type de concours.',
      });
      return;
    }
    
    setGeneratorState(prev => ({...prev, isLoading: true}));
    setGeneratedQuiz(null);

    try {
      const result = await generateQuiz({ 
        topic: generatorState.topic, 
        competitionType: generatorState.competitionType, 
        numberOfQuestions: generatorState.numberOfQuestions, 
        difficulty: generatorState.difficulty 
      });
      setGeneratedQuiz(result);
       setGeneratorState(prev => ({...prev, category: prev.topic}));
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
      setGeneratorState(prev => ({...prev, isLoading: false}));
    }
  };
  
  const handleSaveAiQuiz = async () => {
    if (!generatedQuiz) return;
     if (generatorState.isMockExam && !generatorState.scheduledFor) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Veuillez définir une date pour le concours blanc.' });
      return;
    }
    setGeneratorState(prev => ({...prev, isSaving: true}));
    try {
      const quizDataToSave: Omit<Quiz, 'id'> = {
        ...generatedQuiz.quiz,
        category: generatorState.category || generatorState.topic,
        difficulty: generatorState.difficulty,
        access_type: generatorState.access,
        duration_minutes: generatorState.numberOfQuestions * 1.5,
        total_questions: generatedQuiz.quiz.questions.length,
        createdAt: new Date(),
        isMockExam: generatorState.isMockExam,
        ...(generatorState.isMockExam && generatorState.scheduledFor && { scheduledFor: new Date(generatorState.scheduledFor) }),
      };
      
      await saveQuizToFirestore(quizDataToSave);

      toast({
          title: 'Quiz Sauvegardé !',
          description: 'Le quiz est maintenant disponible pour les utilisateurs.',
      });
      setGeneratedQuiz(null);
      setGeneratorState(prev => ({
        ...prev,
        topic: '',
        competitionType: '',
        category: '',
        isSaving: false,
      }));
    } catch (error) {
      console.error("Error saving quiz: ", error);
      toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: 'Le quiz n\'a pas pu être sauvegardé.',
      });
    } finally {
       setGeneratorState(prev => ({...prev, isSaving: false}));
    }
  }

  const onSaveManualQuiz = async (data: ManualQuizFormValues) => {
    setIsSavingManual(true);
    try {
        const manualQuizToSave: Omit<Quiz, 'id'> = {
            title: data.title,
            description: data.description,
            category: data.category,
            difficulty: data.difficulty,
            access_type: data.access,
            duration_minutes: data.duration,
            createdAt: new Date(),
            isMockExam: data.isMockExam,
            questions: data.questions.map(q => ({
                question: q.question,
                options: q.options.map(o => o.text),
                correctAnswers: q.correctAnswers,
                explanation: q.explanation
            })),
            total_questions: data.questions.length,
            ...(data.isMockExam && data.scheduledFor && { scheduledFor: new Date(data.scheduledFor) }),
        };

        await saveQuizToFirestore(manualQuizToSave);
         toast({
            title: 'Quiz Sauvegardé !',
            description: 'Le quiz manuel a été ajouté avec succès.',
        });
        // Reset form can be done here if needed
    } catch (error) {
       console.error("Error saving manual quiz: ", error);
       toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: 'Le quiz manuel n\'a pas pu être sauvegardé.',
      });
    } finally {
        setIsSavingManual(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
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
        <Button variant="outline" onClick={() => router.push('/dashboard/admin')} className="hidden sm:flex">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'admin
        </Button>
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
                                        value={generatorState.topic}
                                        onChange={(e) => setGeneratorState(prev => ({...prev, topic: e.target.value}))}
                                        disabled={generatorState.isLoading || generatorState.isSaving}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="competitionType">Type de concours</Label>
                                    <Select onValueChange={(value) => setGeneratorState(prev => ({...prev, competitionType: value}))} value={generatorState.competitionType} disabled={generatorState.isLoading || generatorState.isSaving}>
                                        <SelectTrigger id="competitionType">
                                        <SelectValue placeholder="Sélectionner un type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="direct">Concours Direct</SelectItem>
                                        <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="numberOfQuestions">N. Questions</Label>
                                        <Input
                                            id="numberOfQuestions"
                                            type="number"
                                            value={generatorState.numberOfQuestions}
                                            onChange={(e) => setGeneratorState(prev => ({...prev, numberOfQuestions: parseInt(e.target.value, 10) || 1}))}
                                            min="1"
                                            max="50"
                                            disabled={generatorState.isLoading || generatorState.isSaving}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="difficulty">Difficulté</Label>
                                        <Select onValueChange={(v: 'facile' | 'moyen' | 'difficile') => setGeneratorState(prev => ({...prev, difficulty: v}))} value={generatorState.difficulty} disabled={generatorState.isLoading || generatorState.isSaving}>
                                            <SelectTrigger id="difficulty"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="facile">Facile</SelectItem>
                                                <SelectItem value="moyen">Moyen</SelectItem>
                                                <SelectItem value="difficile">Difficile</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold" disabled={generatorState.isLoading || generatorState.isSaving || !generatorState.topic || !generatorState.competitionType}>
                                    {generatorState.isLoading ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Génération en cours... </>) : (<> <Wand2 className="mr-2 h-4 w-4" /> Générer le Quiz </>)}
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
                            {generatorState.isLoading && (
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
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div className="space-y-1.5">
                                                  <Label htmlFor="ai_quiz_category">Catégorie</Label>
                                                  <Input id="ai_quiz_category" placeholder="Ex: Histoire" value={generatorState.category} onChange={e => setGeneratorState(prev => ({...prev, category: e.target.value}))} />
                                             </div>
                                            <div className="space-y-1.5">
                                                <Label>Accès</Label>
                                                <Select onValueChange={(v: 'gratuit' | 'premium') => setGeneratorState(prev => ({...prev, access: v}))} defaultValue={generatorState.access}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="gratuit">Gratuit</SelectItem>
                                                        <SelectItem value="premium">Premium</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                         <div className="flex items-center space-x-2 pt-4">
                                            <Switch id="mock-exam-switch" checked={generatorState.isMockExam} onCheckedChange={(checked) => setGeneratorState(prev => ({...prev, isMockExam: checked}))} />
                                            <Label htmlFor="mock-exam-switch">Définir comme Concours Blanc</Label>
                                        </div>
                                        {generatorState.isMockExam && (
                                            <div className="space-y-1.5">
                                                <Label htmlFor="scheduledFor">Date et heure de début</Label>
                                                <Input id="scheduledFor" type="datetime-local" value={generatorState.scheduledFor} onChange={e => setGeneratorState(prev => ({...prev, scheduledFor: e.target.value}))} />
                                            </div>
                                        )}
                                     </div>
                                    <div className="flex gap-4">
                                    <Button onClick={handleSaveAiQuiz} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold" disabled={generatorState.isSaving}>
                                        {generatorState.isSaving ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde... </>) : (<> <Save className="mr-2 h-4 w-4" /> Enregistrer ce quiz </>)}
                                    </Button>
                                    </div>
                                </div>
                            )}
                            {!generatorState.isLoading && !generatedQuiz && (
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
           <form onSubmit={handleSubmit(onSaveManualQuiz)}>
               <Card className="glassmorphism shadow-xl mt-4">
                 <CardHeader>
                    <CardTitle>Créateur de Quiz Manuel</CardTitle>
                    <CardDescription>Composez votre propre quiz, question par question.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="manual_title">Titre du Quiz</Label>
                            <Input id="manual_title" placeholder="Ex: Les capitales du monde" {...register("title")} />
                             {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="manual_category">Catégorie</Label>
                            <Input id="manual_category" placeholder="Ex: Culture générale" {...register("category")} />
                             {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="manual_description">Description du Quiz</Label>
                        <Textarea id="manual_description" placeholder="Une brève description du quiz" {...register("description")} />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>
                     <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Options du quiz</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Controller
                                control={control}
                                name="difficulty"
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label>Difficulté</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="facile">Facile</SelectItem>
                                                <SelectItem value="moyen">Moyen</SelectItem>
                                                <SelectItem value="difficile">Difficile</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name="access"
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label>Accès</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gratuit">Gratuit</SelectItem>
                                                <SelectItem value="premium">Premium</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />
                            <div className="space-y-1.5">
                                <Label htmlFor="manual_duration">Durée (minutes)</Label>
                                <Input id="manual_duration" type="number" {...register("duration", { valueAsNumber: true })} />
                                {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                             <Controller
                                control={control}
                                name="isMockExam"
                                render={({ field }) => (
                                     <Switch id="manual-mock-exam" checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor="manual-mock-exam">Définir comme Concours Blanc</Label>
                        </div>
                        {watchIsManualMockExam && (
                            <div className="space-y-1.5">
                                <Label htmlFor="manual_scheduledFor">Date et heure de début</Label>
                                <Input id="manual_scheduledFor" type="datetime-local" {...register("scheduledFor")} />
                                 {errors.scheduledFor && <p className="text-sm text-red-500">{errors.scheduledFor.message}</p>}
                            </div>
                        )}
                     </div>

                    <div className="border-t pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Questions</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendQuestion({ question: '', options: [{ text: '' }, { text: '' }], correctAnswers: [], explanation: '' })}><PlusCircle className="w-4 h-4 mr-2" />Ajouter une question</Button>
                        </div>
                         {errors.questions?.root && <p className="text-sm text-red-500">{errors.questions.root.message}</p>}
                         
                         {manualQuestions.map((question, qIndex) => (
                           <ManualQuestionCard 
                             key={question.id}
                             qIndex={qIndex}
                             control={control}
                             register={register}
                             removeQuestion={removeQuestion}
                             errors={errors}
                             watch={watch}
                           />
                         ))}

                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold" disabled={isSavingManual}>
                        {isSavingManual ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde... </>) : (<> <Save className="w-4 h-4" /> Enregistrer le quiz manuel</>)}
                    </Button>
                 </CardContent>
               </Card>
           </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

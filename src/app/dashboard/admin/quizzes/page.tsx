// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
import { BrainCircuit, Loader, Wand2, Save, PlusCircle, Trash2, ArrowLeft, Edit, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { saveQuizToFirestore, Quiz, getQuizzesFromFirestore, deleteQuizFromFirestore, updateQuizInFirestore } from '@/lib/firestore.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const manualQuestionSchema = z.object({
  question: z.string().min(1, 'La question ne peut pas être vide.'),
  options: z.array(z.string().min(1, "L'option ne peut pas être vide.")).min(2, 'Au moins deux options sont requises.'),
  correctAnswers: z.array(z.string()).min(1, 'Au moins une bonne réponse est requise.'),
  explanation: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  duration_minutes: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().min(1, "La durée doit être d'au moins 1 minute.")),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  access_type: z.enum(['gratuit', 'premium']),
  isMockExam: z.boolean(),
  scheduledFor: z.string().optional(),
  questions: z.array(manualQuestionSchema).min(1, 'Au moins une question est requise.'),
}).refine(data => !data.isMockExam || (data.isMockExam && data.scheduledFor), {
    message: "La date du concours blanc est requise.",
    path: ["scheduledFor"],
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

// This component is defined outside to prevent re-creation on every render.
const QuestionEditor = ({ qIndex, control, register, errors, isSubmitting, removeQuestion, watch }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`
  });

  const questionWatch = watch(`questions.${qIndex}`);

  const handleCorrectAnswerChange = (optionValue: string, isChecked: boolean) => {
    const currentCorrectAnswers = control.getValues(`questions.${qIndex}.correctAnswers`) || [];
    const newCorrectAnswers = isChecked
      ? [...currentCorrectAnswers, optionValue]
      : currentCorrectAnswers.filter((value: string) => value !== optionValue);
    control.setValue(`questions.${qIndex}.correctAnswers`, newCorrectAnswers, { shouldValidate: true });
  };

  return (
      <Card className="p-4 bg-background/50">
        <div className="flex justify-between items-start mb-2">
          <Label className="font-semibold">Question {qIndex + 1}</Label>
          <Button variant="ghost" size="icon" className="text-red-500 w-7 h-7" onClick={() => removeQuestion(qIndex)} disabled={isSubmitting}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <Textarea placeholder="Texte de la question" {...register(`questions.${qIndex}.question`)} disabled={isSubmitting} />
          {errors.questions?.[qIndex]?.question && <p className="text-sm text-red-500">{errors.questions[qIndex].question.message}</p>}
          
          <Label className="text-xs text-muted-foreground">Options (cochez la/les bonne(s) réponse(s))</Label>
          {errors.questions?.[qIndex]?.correctAnswers && <p className="text-sm text-red-500">{errors.questions[qIndex].correctAnswers.message}</p>}

          {fields.map((field, optIndex) => (
            <div key={field.id} className="flex items-center gap-2">
              <Controller
                control={control}
                name={`questions.${qIndex}.correctAnswers`}
                render={({ field: { value } }) => (
                  <Checkbox
                    checked={value?.includes(questionWatch.options[optIndex])}
                    onCheckedChange={(checked) => {
                      handleCorrectAnswerChange(questionWatch.options[optIndex], !!checked);
                    }}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Input 
                placeholder={`Option ${optIndex + 1}`} 
                {...register(`questions.${qIndex}.options.${optIndex}`)}
                disabled={isSubmitting}
              />
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground w-7 h-7" onClick={() => remove(optIndex)} disabled={isSubmitting || fields.length < 2}>
                  <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append('')} disabled={isSubmitting}>
            <PlusCircle className="w-4 h-4 mr-2" /> Ajouter une option
          </Button>
          
          <Textarea placeholder="Explication (optionnel)" {...register(`questions.${qIndex}.explanation`)} disabled={isSubmitting}/>
        </div>
      </Card>
  );
};

export default function AdminQuizzesPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [generatorState, setGeneratorState] = useState({
    topic: '',
    competitionType: '',
    numberOfQuestions: 10,
    difficulty: 'moyen' as 'facile' | 'moyen' | 'difficile',
    isLoading: false,
  });

  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizOutput | null>(null);
  
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setIsLoadingQuizzes(true);
    try {
      const quizzes = await getQuizzesFromFirestore();
      setAllQuizzes(quizzes);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les quiz.',
      });
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);


  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting }, setValue } = useForm<QuizFormValues>({
      resolver: zodResolver(quizFormSchema),
       defaultValues: {
          title: '', description: '', category: '', 
          duration_minutes: 15, difficulty: 'moyen', 
          access_type: 'gratuit', isMockExam: false, questions: []
      }
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
      control,
      name: "questions",
  });
    
  const watchIsMockExam = watch('isMockExam');

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
      // Reset form with generated data
       reset({
        ...result.quiz,
        category: generatorState.topic,
        duration_minutes: Math.round(result.quiz.questions.length * 1.5),
        difficulty: generatorState.difficulty,
        access_type: 'gratuit',
        isMockExam: false,
        scheduledFor: '',
        questions: result.quiz.questions.map(q => ({
          ...q,
          options: q.options,
        })),
      });

      toast({
        title: 'Quiz généré !',
        description: 'Votre quiz a été créé avec succès. Vous pouvez le sauvegarder.',
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
  
  const handleOpenEditDialog = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    const scheduledFor = quiz.scheduledFor ? format(new Date(quiz.scheduledFor), "yyyy-MM-dd'T'HH:mm") : '';
    reset({
      ...quiz,
      duration_minutes: quiz.duration_minutes,
      questions: quiz.questions.map(q => ({...q, options: q.options, correctAnswers: q.correctAnswers || []})),
      scheduledFor,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuizFromFirestore(quizId);
      toast({
        title: 'Succès',
        description: 'Le quiz a été supprimé.',
      });
      fetchQuizzes(); // Refresh list
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le quiz.',
      });
    }
  }
  
  const onSubmitQuiz = async (data: QuizFormValues) => {
    try {
        let scheduledForDate: Date | undefined = undefined;
        if (data.isMockExam && data.scheduledFor) {
            scheduledForDate = new Date(data.scheduledFor);
            if (isNaN(scheduledForDate.getTime())) {
                toast({ variant: "destructive", title: "Date invalide", description: "Veuillez fournir une date valide pour le concours blanc." });
                return;
            }
        }
        
        const quizDataToSave = {
            ...data,
            total_questions: data.questions.length,
            createdAt: editingQuiz ? (editingQuiz.createdAt instanceof Date ? editingQuiz.createdAt : new Date(editingQuiz.createdAt)) : new Date(),
            updatedAt: new Date(),
            scheduledFor: scheduledForDate,
        };

        const { scheduledFor: _, ...finalQuizData } = quizDataToSave;


        if (editingQuiz?.id) {
           await updateQuizInFirestore(editingQuiz.id, finalQuizData);
           toast({ title: 'Succès', description: 'Le quiz a été mis à jour.' });
        } else {
           await saveQuizToFirestore(finalQuizData);
           toast({ title: 'Succès', description: 'Le quiz a été sauvegardé.' });
        }
        
        fetchQuizzes();
        setIsEditDialogOpen(false);
        setEditingQuiz(null);
        setGeneratedQuiz(null);
        reset({ title: '', description: '', category: '', duration_minutes: 15, difficulty: 'moyen', access_type: 'gratuit', isMockExam: false, questions: [] });

    } catch (error) {
       console.error("Error saving quiz: ", error);
       toast({
          variant: 'destructive',
          title: 'Erreur de sauvegarde',
          description: 'Le quiz n\'a pas pu être sauvegardé.',
      });
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
                Générez, créez, modifiez ou supprimez des quiz.
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/admin')} className="hidden sm:flex">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'admin
        </Button>
      </div>
      
      <Tabs defaultValue="creator">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="creator"><Wand2 className="mr-2 h-4 w-4" />Créateur de Quiz</TabsTrigger>
            <TabsTrigger value="manager"><List className="mr-2 h-4 w-4" />Gérer les Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="creator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-1">
                    <Card className="glassmorphism shadow-xl sticky top-24">
                        <CardHeader>
                            <CardTitle>Génération par IA</CardTitle>
                            <CardDescription>Définissez les options pour générer un quiz.</CardDescription>
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
                                        disabled={generatorState.isLoading || isSubmitting}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="competitionType">Type de concours</Label>
                                    <Select onValueChange={(value) => setGeneratorState(prev => ({...prev, competitionType: value}))} value={generatorState.competitionType} disabled={generatorState.isLoading || isSubmitting}>
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
                                            disabled={generatorState.isLoading || isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="difficulty">Difficulté</Label>
                                        <Select onValueChange={(v: 'facile' | 'moyen' | 'difficile') => setGeneratorState(prev => ({...prev, difficulty: v}))} value={generatorState.difficulty} disabled={generatorState.isLoading || isSubmitting}>
                                            <SelectTrigger id="difficulty"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="facile">Facile</SelectItem>
                                                <SelectItem value="moyen">Moyen</SelectItem>
                                                <SelectItem value="difficile">Difficile</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold" disabled={generatorState.isLoading || isSubmitting || !generatorState.topic || !generatorState.competitionType}>
                                    {generatorState.isLoading ? (<> <Loader className="mr-2 h-4 w-4 animate-spin" /> Génération... </>) : (<> <Wand2 className="mr-2 h-4 w-4" /> Générer avec IA</>)}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                   <form onSubmit={handleSubmit(onSubmitQuiz)}>
                     <Card className="glassmorphism shadow-xl">
                        <CardHeader>
                            <CardTitle>{generatedQuiz ? 'Quiz Généré' : 'Créer un Quiz Manuel'}</CardTitle>
                            <CardDescription>Remplissez les détails ci-dessous. Vous pouvez aussi générer le contenu avec l'IA.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title">Titre du Quiz</Label>
                                    <Input id="title" placeholder="Ex: Les capitales du monde" {...register("title")} />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Input id="category" placeholder="Ex: Culture générale" {...register("category")} />
                                    {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description du Quiz</Label>
                                <Textarea id="description" placeholder="Une brève description du quiz" {...register("description")} />
                                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Options du Quiz</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 p-1">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                 <Controller
                                                    control={control}
                                                    name="difficulty"
                                                    render={({ field }) => (
                                                        <div className="space-y-1.5">
                                                            <Label>Difficulté</Label>
                                                            <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                                                    name="access_type"
                                                    render={({ field }) => (
                                                        <div className="space-y-1.5">
                                                            <Label>Accès</Label>
                                                            <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                                                    <Label htmlFor="duration_minutes">Durée (minutes)</Label>
                                                    <Input id="duration_minutes" type="number" {...register("duration_minutes")} disabled={isSubmitting} />
                                                    {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes.message}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-4">
                                                <Controller
                                                    control={control}
                                                    name="isMockExam"
                                                    render={({ field }) => (
                                                        <Switch id="isMockExam" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                                                    )}
                                                />
                                                <Label htmlFor="isMockExam">Définir comme Concours Blanc</Label>
                                            </div>
                                            {watchIsMockExam && (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="scheduledFor">Date et heure de début</Label>
                                                    <Input id="scheduledFor" type="datetime-local" {...register("scheduledFor")} disabled={isSubmitting} />
                                                    {errors.scheduledFor && <p className="text-sm text-red-500">{errors.scheduledFor.message}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                     <AccordionTrigger>Questions ({questions.length})</AccordionTrigger>
                                     <AccordionContent>
                                         <div className="space-y-4 p-1">
                                             {questions.map((question, qIndex) => (
                                                <QuestionEditor key={question.id} qIndex={qIndex} control={control} register={register} errors={errors} isSubmitting={isSubmitting} removeQuestion={removeQuestion} watch={watch} />
                                             ))}
                                              <Button type="button" variant="outline" onClick={() => appendQuestion({ question: '', options: ['', ''], correctAnswers: [], explanation: '' })} disabled={isSubmitting}>
                                                <PlusCircle className="w-4 h-4 mr-2" /> Ajouter une question
                                            </Button>
                                            {errors.questions && <p className="text-sm text-red-500">{errors.questions.message || errors.questions.root?.message}</p>}
                                         </div>
                                     </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                           
                            <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold" disabled={isSubmitting}>
                                {isSubmitting ? (<><Loader className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</>) : (<><Save className="mr-2 h-4 w-4" /> Enregistrer le quiz</>)}
                            </Button>
                        </CardContent>
                     </Card>
                   </form>
                </div>
            </div>
        </TabsContent>
        <TabsContent value="manager">
             <Card className="glassmorphism shadow-xl mt-4">
                <CardHeader>
                  <CardTitle>Quiz Existants</CardTitle>
                  <CardDescription>
                    {allQuizzes.length} quiz sont actuellement dans la base de données.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   {isLoadingQuizzes ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader className="w-10 h-10 animate-spin text-purple-500"/>
                      </div>
                   ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Difficulté</TableHead>
                          <TableHead>Type</TableHead>
                           <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allQuizzes.map((quiz) => (
                          <TableRow key={quiz.id}>
                            <TableCell className="font-medium">{quiz.title}</TableCell>
                            <TableCell>{quiz.category}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{quiz.difficulty}</Badge></TableCell>
                            <TableCell><Badge variant={quiz.access_type === 'premium' ? 'destructive' : 'secondary'}>{quiz.access_type}</Badge></TableCell>
                             <TableCell>{format(new Date(quiz.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="flex gap-2 justify-end">
                               <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(quiz)}>
                                <Edit className="h-4 w-4" />
                               </Button>
                               <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action est irréversible et supprimera le quiz définitivement.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id!)} className="bg-destructive hover:bg-destructive/90">
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                   )}
                </CardContent>
              </Card>
        </TabsContent>
      </Tabs>

        <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingQuiz(null); reset(); } setIsEditDialogOpen(isOpen); }}>
             <DialogContent className="max-w-4xl h-[90vh]">
                 <form onSubmit={handleSubmit(onSubmitQuiz)} className="flex flex-col h-full">
                    <DialogHeader>
                        <DialogTitle>Modifier le Quiz</DialogTitle>
                        <DialogDescription>
                        Modifiez les détails du quiz ci-dessous.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto pr-6 -mr-6 py-4 space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_title">Titre du Quiz</Label>
                                    <Input id="edit_title" {...register("title")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_category">Catégorie</Label>
                                    <Input id="edit_category" {...register("category")} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_description">Description du Quiz</Label>
                                <Textarea id="edit_description" {...register("description")} />
                            </div>
                             <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Options du Quiz</AccordionTrigger>
                                    <AccordionContent>
                                         <div className="space-y-4 p-1">
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
                                                    name="access_type"
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
                                                    <Label htmlFor="edit_duration_minutes">Durée (minutes)</Label>
                                                    <Input id="edit_duration_minutes" type="number" {...register("duration_minutes")} />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 pt-4">
                                                <Controller control={control} name="isMockExam" render={({ field }) => ( <Switch id="edit_isMockExam" checked={field.value} onCheckedChange={field.onChange} /> )}/>
                                                <Label htmlFor="edit_isMockExam">Définir comme Concours Blanc</Label>
                                            </div>
                                            {watchIsMockExam && (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="edit_scheduledFor">Date et heure de début</Label>
                                                    <Input id="edit_scheduledFor" type="datetime-local" {...register("scheduledFor")} />
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-2">
                                     <AccordionTrigger>Questions ({questions.length})</AccordionTrigger>
                                     <AccordionContent>
                                          <div className="space-y-4 p-1">
                                             {questions.map((question, qIndex) => (
                                                <QuestionEditor key={question.id} qIndex={qIndex} control={control} register={register} errors={errors} isSubmitting={isSubmitting} removeQuestion={removeQuestion} watch={watch} />
                                             ))}
                                              <Button type="button" variant="outline" onClick={() => appendQuestion({ question: '', options: ['', ''], correctAnswers: [], explanation: '' })}><PlusCircle className="w-4 h-4 mr-2" /> Ajouter une question</Button>
                                         </div>
                                     </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Annuler</Button>
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Sauvegarde...</> : <><Save className="w-4 h-4 mr-2"/>Mettre à jour</>}
                        </Button>
                    </DialogFooter>
                 </form>
             </DialogContent>
        </Dialog>
    </div>
  );
}

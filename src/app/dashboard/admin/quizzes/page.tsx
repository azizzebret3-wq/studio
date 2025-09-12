
// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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
import { BrainCircuit, Loader, Wand2, Save, PlusCircle, Trash2, ArrowLeft, Edit, List, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-dynamic-quizzes';
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

// Zod schema for basic quiz details, managed by react-hook-form
const quizDetailsSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  category: z.string().min(1, 'La catégorie est requise.'),
  duration_minutes: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().min(1, "La durée doit être d'au moins 1 minute.")),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  access_type: z.enum(['gratuit', 'premium']),
  isMockExam: z.boolean(),
  scheduledFor: z.string().optional(),
});

type QuizDetailsValues = z.infer<typeof quizDetailsSchema>;

// Type for questions, managed by useState
type Question = {
    id: string;
    question: string;
    options: string[];
    correctAnswers: string[];
    explanation?: string;
};


export default function AdminQuizzesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const creatorFormRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("manager");
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const [generatorState, setGeneratorState] = useState({
    topic: '',
    competitionType: '',
    numberOfQuestions: 10,
    difficulty: 'moyen' as 'facile' | 'moyen' | 'difficile',
    isLoading: false,
  });

  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  
  // State for questions, managed manually
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // React Hook Form for quiz details only
  const { control, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<QuizDetailsValues>({
      resolver: zodResolver(quizDetailsSchema),
      defaultValues: {
        title: '', 
        description: '', 
        category: '', 
        duration_minutes: 15, 
        difficulty: 'moyen', 
        access_type: 'gratuit', 
        isMockExam: false, 
        scheduledFor: '',
      },
      mode: 'onChange'
  });

  const watchIsMockExam = watch('isMockExam');

  const fetchQuizzes = useCallback(async () => {
    setIsLoadingQuizzes(true);
    try {
      const quizzes = await getQuizzesFromFirestore();
      setAllQuizzes(quizzes);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les quiz.' });
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);
  
  // --- Question Management Functions ---
  const addQuestion = () => {
    setQuestions(prev => [...prev, { id: `q_${Date.now()}`, question: '', options: ['', ''], correctAnswers: [], explanation: '' }]);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions(prev => prev.filter((_, index) => index !== qIndex));
  };
  
  const updateQuestionField = (qIndex: number, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map((q, index) => index === qIndex ? { ...q, [field]: value } : q));
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };
  
  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    const removedOption = newQuestions[qIndex].options[oIndex];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, index) => index !== oIndex);
    // Also remove from correct answers
    newQuestions[qIndex].correctAnswers = newQuestions[qIndex].correctAnswers.filter(ans => ans !== removedOption);
    setQuestions(newQuestions);
  };
  
  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const oldOptionValue = newQuestions[qIndex].options[oIndex];
    newQuestions[qIndex].options[oIndex] = value;
    // If the old option was a correct answer, update it in correct answers as well
    if (newQuestions[qIndex].correctAnswers.includes(oldOptionValue)) {
        newQuestions[qIndex].correctAnswers = newQuestions[qIndex].correctAnswers.map(ans => ans === oldOptionValue ? value : ans);
    }
    setQuestions(newQuestions);
  };

  const toggleCorrectAnswer = (qIndex: number, optionValue: string) => {
    if (!optionValue.trim()) return; // Don't allow empty options to be correct
    const newQuestions = [...questions];
    const currentCorrect = newQuestions[qIndex].correctAnswers;
    if (currentCorrect.includes(optionValue)) {
        newQuestions[qIndex].correctAnswers = currentCorrect.filter(ans => ans !== optionValue);
    } else {
        newQuestions[qIndex].correctAnswers.push(optionValue);
    }
    setQuestions(newQuestions);
  };
  // --- End Question Management ---

  const handleResetForm = () => {
    reset({
        title: '', description: '', category: '', duration_minutes: 15, 
        difficulty: 'moyen', access_type: 'gratuit', isMockExam: false, scheduledFor: '',
    });
    setQuestions([]);
    setIsEditing(false);
    setEditingQuizId(null);
  };

  const handleStartEditing = (quiz: Quiz) => {
    setEditingQuizId(quiz.id!);
    setIsEditing(true);
    const scheduledFor = quiz.scheduledFor ? format(new Date(quiz.scheduledFor), "yyyy-MM-dd'T'HH:mm") : '';
    
    reset({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      duration_minutes: quiz.duration_minutes,
      difficulty: quiz.difficulty,
      access_type: quiz.access_type,
      isMockExam: !!quiz.isMockExam,
      scheduledFor,
    });

    setQuestions(quiz.questions.map((q, index) => ({
      id: `q_edit_${index}_${Date.now()}`,
      question: q.question,
      options: q.options || [],
      correctAnswers: q.correctAnswers || [],
      explanation: q.explanation || '',
    })));
    
    setActiveTab("creator");
    setTimeout(() => creatorFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatorState.topic || !generatorState.competitionType) {
      toast({ variant: 'destructive', title: 'Champs manquants', description: 'Veuillez renseigner un sujet et un type de concours.' });
      return;
    }
    setGeneratorState(prev => ({...prev, isLoading: true}));
    try {
      const result = await generateQuiz({ 
        topic: generatorState.topic, competitionType: generatorState.competitionType, 
        numberOfQuestions: generatorState.numberOfQuestions, difficulty: generatorState.difficulty 
      });
      
      handleResetForm();

      reset({
        title: result.quiz.title,
        description: result.quiz.description,
        category: generatorState.topic,
        duration_minutes: Math.round(result.quiz.questions.length * 1.5),
        difficulty: generatorState.difficulty,
        access_type: 'gratuit',
        isMockExam: false,
        scheduledFor: '',
      });

      setQuestions(result.quiz.questions.map((q, index) => ({
          id: `q_gen_${index}_${Date.now()}`,
          question: q.question,
          options: q.options || [],
          correctAnswers: q.correctAnswers || [],
          explanation: q.explanation || '',
      })));
      
      setActiveTab("creator");
      toast({ title: 'Quiz généré !', description: 'Votre quiz a été créé avec succès. Vous pouvez le sauvegarder.' });
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({ variant: 'destructive', title: 'Erreur de génération', description: 'Impossible de générer le quiz. Veuillez réessayer.' });
    } finally {
      setGeneratorState(prev => ({...prev, isLoading: false}));
    }
  };
  
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuizFromFirestore(quizId);
      toast({ title: 'Succès', description: 'Le quiz a été supprimé.' });
      fetchQuizzes();
    } catch (error) {
       toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le quiz.' });
    }
  };
  
  const onSubmitQuiz = async (data: QuizDetailsValues) => {
    // Manual validation for questions
    if (questions.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Le quiz doit contenir au moins une question."});
      return;
    }
    for (const q of questions) {
        if (!q.question.trim()) {
            toast({ variant: "destructive", title: "Erreur", description: "Toutes les questions doivent avoir un texte."});
            return;
        }
        if (q.options.length < 2 || q.options.some(opt => !opt.trim())) {
             toast({ variant: "destructive", title: "Erreur", description: "Chaque question doit avoir au moins 2 options non vides."});
            return;
        }
        if (q.correctAnswers.length === 0) {
             toast({ variant: "destructive", title: "Erreur", description: `La question "${q.question.substring(0,20)}..." doit avoir au moins une bonne réponse.`});
            return;
        }
        if (!q.correctAnswers.every(ans => q.options.includes(ans))) {
            toast({ variant: "destructive", title: "Erreur", description: `Certaines bonnes réponses pour la question "${q.question.substring(0,20)}..." ne sont pas dans la liste d'options.`});
            return;
        }
    }
    if (data.isMockExam && !data.scheduledFor) {
        toast({ variant: "destructive", title: "Erreur", description: "Veuillez définir une date pour le concours blanc."});
        return;
    }

    setIsSaving(true);
    try {
        let scheduledForDate: Date | undefined = undefined;
        if (data.isMockExam && data.scheduledFor) {
            scheduledForDate = new Date(data.scheduledFor);
            if (isNaN(scheduledForDate.getTime())) {
                toast({ variant: "destructive", title: "Date invalide", description: "Veuillez fournir une date valide." });
                setIsSaving(false);
                return;
            }
        }

        const questionsToSave = questions.map(({ id, ...rest }) => rest);
        
        const quizDataToSave = {
            ...data,
            questions: questionsToSave,
            total_questions: questionsToSave.length,
            updatedAt: new Date(),
            scheduledFor: scheduledForDate,
        };

        if (editingQuizId) {
           await updateQuizInFirestore(editingQuizId, quizDataToSave);
           toast({ title: 'Succès', description: 'Le quiz a été mis à jour.' });
        } else {
           await saveQuizToFirestore({...quizDataToSave, createdAt: new Date()});
           toast({ title: 'Succès', description: 'Le quiz a été sauvegardé.' });
        }
        
        handleResetForm();
        fetchQuizzes();
        setActiveTab("manager");

    } catch (error) {
       console.error("Error saving quiz: ", error);
       toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: "Le quiz n'a pas pu être sauvegardé." });
    } finally {
       setIsSaving(false);
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manager"><List className="mr-2 h-4 w-4" />Gérer les Quiz</TabsTrigger>
            <TabsTrigger value="creator"><Wand2 className="mr-2 h-4 w-4" />Créateur de Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="manager">
             <Card className="glassmorphism shadow-xl mt-4">
                <CardHeader>
                  <CardTitle>Quiz Existants</CardTitle>
                  <CardDescription>{allQuizzes.length} quiz sont actuellement dans la base de données.</CardDescription>
                </CardHeader>
                <CardContent>
                   {isLoadingQuizzes ? (
                      <div className="flex justify-center items-center h-64"><Loader className="w-10 h-10 animate-spin text-purple-500"/></div>
                   ) : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Catégorie</TableHead><TableHead>Difficulté</TableHead><TableHead>Type</TableHead><TableHead>Date Création</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {allQuizzes.map((quiz) => (
                          <TableRow key={quiz.id}>
                            <TableCell className="font-medium">{quiz.title}</TableCell>
                            <TableCell>{quiz.category}</TableCell>
                            <TableCell><Badge variant="outline" className="capitalize">{quiz.difficulty}</Badge></TableCell>
                            <TableCell><Badge variant={quiz.access_type === 'premium' ? 'destructive' : 'secondary'}>{quiz.access_type}</Badge></TableCell>
                             <TableCell>{format(new Date(quiz.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="flex gap-2 justify-end">
                               <Button variant="ghost" size="icon" onClick={() => handleStartEditing(quiz)}><Edit className="h-4 w-4" /></Button>
                               <AlertDialog>
                                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera le quiz définitivement.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id!)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
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

        <TabsContent value="creator" ref={creatorFormRef}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-1">
                    <Card className="glassmorphism shadow-xl sticky top-24">
                        <CardHeader><CardTitle>Génération par IA</CardTitle><CardDescription>Définissez les options pour générer un quiz.</CardDescription></CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerateQuiz} className="space-y-4">
                                <div className="space-y-1.5"><Label htmlFor="topic">Sujet / Catégorie</Label><Input id="topic" placeholder="Ex: Histoire du Burkina Faso" value={generatorState.topic} onChange={(e) => setGeneratorState(prev => ({...prev, topic: e.target.value}))} /></div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="competitionType">Type de concours</Label>
                                    <Select onValueChange={(value) => setGeneratorState(prev => ({...prev, competitionType: value}))} value={generatorState.competitionType}><SelectTrigger id="competitionType"><SelectValue placeholder="Sélectionner un type" /></SelectTrigger><SelectContent><SelectItem value="direct">Concours Direct</SelectItem><SelectItem value="professionnel">Concours Professionnel</SelectItem></SelectContent></Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><Label htmlFor="numberOfQuestions">N. Questions</Label><Input id="numberOfQuestions" type="number" value={generatorState.numberOfQuestions} onChange={(e) => setGeneratorState(prev => ({...prev, numberOfQuestions: parseInt(e.target.value, 10) || 1}))} min="1" max="50" /></div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="difficulty">Difficulté</Label>
                                        <Select onValueChange={(v: 'facile' | 'moyen' | 'difficile') => setGeneratorState(prev => ({...prev, difficulty: v}))} value={generatorState.difficulty}><SelectTrigger id="difficulty"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent></Select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold" disabled={generatorState.isLoading || !generatorState.topic || !generatorState.competitionType}>
                                    {generatorState.isLoading ? (<><Loader className="mr-2 h-4 w-4 animate-spin" /> Génération...</>) : (<><Wand2 className="mr-2 h-4 w-4" /> Générer avec IA</>)}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <form onSubmit={handleSubmit(onSubmitQuiz)}>
                        <Card className="glassmorphism shadow-xl">
                            <CardHeader>
                              <div className='flex justify-between items-center'>
                                  <div><CardTitle>{isEditing ? 'Modifier le Quiz' : 'Créer un Quiz'}</CardTitle><CardDescription>{isEditing ? `Modification du quiz` : "Remplissez les détails ou générez avec l'IA."}</CardDescription></div>
                                  {isEditing && (<Button variant="outline" size="sm" onClick={handleResetForm}><XCircle className='w-4 h-4 mr-2' />Annuler la modification</Button>)}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Basic Quiz Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Controller name="title" control={control} render={({ field }) => <div className="space-y-1.5"><Label htmlFor="title">Titre du Quiz</Label><Input id="title" {...field} />{errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}</div>}/>
                                  <Controller name="category" control={control} render={({ field }) => <div className="space-y-1.5"><Label htmlFor="category">Catégorie</Label><Input id="category" {...field} />{errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}</div>}/>
                                </div>
                                <Controller name="description" control={control} render={({ field }) => <div className="space-y-1.5"><Label htmlFor="description">Description</Label><Textarea id="description" {...field} />{errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}</div>}/>

                                {/* Accordion for Options & Questions */}
                                <Accordion type="single" collapsible className="w-full" defaultValue='item-2'>
                                  <AccordionItem value="item-1">
                                    <AccordionTrigger>Options du Quiz</AccordionTrigger>
                                    <AccordionContent className="p-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Controller control={control} name="difficulty" render={({ field }) => (<div className="space-y-1.5"><Label>Difficulté</Label><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent></Select></div>)} />
                                            <Controller control={control} name="access_type" render={({ field }) => (<div className="space-y-1.5"><Label>Accès</Label><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="gratuit">Gratuit</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent></Select></div>)} />
                                            <Controller control={control} name="duration_minutes" render={({ field }) => <div className="space-y-1.5"><Label htmlFor="duration_minutes">Durée (min)</Label><Input id="duration_minutes" type="number" {...field} />{errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes.message}</p>}</div>} />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-4">
                                            <Controller control={control} name="isMockExam" render={({ field }) => ( <Switch id="isMockExam" checked={field.value} onCheckedChange={field.onChange} /> )}/>
                                            <Label htmlFor="isMockExam">Définir comme Concours Blanc</Label>
                                        </div>
                                        {watchIsMockExam && (<Controller name="scheduledFor" control={control} render={({ field }) => <div className="space-y-1.5"><Label htmlFor="scheduledFor">Date de début</Label><Input id="scheduledFor" type="datetime-local" {...field} />{errors.scheduledFor && <p className="text-sm text-red-500">{errors.scheduledFor.message}</p>}</div>} />)}
                                    </AccordionContent>
                                  </AccordionItem>
                                  <AccordionItem value="item-2" className="border-b-0">
                                    <AccordionTrigger>Questions ({questions.length})</AccordionTrigger>
                                    <AccordionContent className="p-1 space-y-4">
                                       {questions.map((q, qIndex) => (
                                          <Card key={q.id} className="p-4 bg-background/50 border">
                                              <div className="flex justify-between items-start mb-2">
                                                  <Label className="font-semibold text-base">Question {qIndex + 1}</Label>
                                                  <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 w-8 h-8" onClick={() => removeQuestion(qIndex)}><Trash2 className="w-4 h-4" /></Button>
                                              </div>
                                              <div className="space-y-4">
                                                  <Textarea placeholder="Texte de la question" value={q.question} onChange={e => updateQuestionField(qIndex, 'question', e.target.value)} />
                                                  <div className="space-y-2">
                                                      <Label className="text-sm text-muted-foreground">Options (cochez la/les bonne(s) réponse(s))</Label>
                                                      {q.options.map((opt, oIndex) => (
                                                          <div key={`${q.id}-opt-${oIndex}`} className="flex items-center gap-2">
                                                              <Checkbox checked={q.correctAnswers.includes(opt)} onCheckedChange={() => toggleCorrectAnswer(qIndex, opt)} />
                                                              <Input placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} />
                                                              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground w-7 h-7" onClick={() => removeOption(qIndex, oIndex)} disabled={q.options.length <= 2}><Trash2 className="w-4 h-4" /></Button>
                                                          </div>
                                                      ))}
                                                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}><PlusCircle className="w-4 h-4 mr-2" />Ajouter une option</Button>
                                                  </div>
                                                  <Textarea placeholder="Explication (optionnel)" value={q.explanation} onChange={e => updateQuestionField(qIndex, 'explanation', e.target.value)} />
                                              </div>
                                          </Card>
                                       ))}
                                      <Button type="button" variant="outline" onClick={addQuestion}><PlusCircle className="w-4 h-4 mr-2" />Ajouter une question</Button>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>

                                <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold" disabled={isSaving}>
                                    {isSaving ? (<><Loader className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</>) : (<><Save className="mr-2 h-4 w-4" /> {isEditing ? 'Mettre à jour le quiz' : 'Enregistrer le nouveau quiz'}</>)}
                                </Button>
                            </CardContent>
                        </Card>
                     </form>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
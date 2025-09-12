// src/components/admin/QuizAdminPanel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClipboardList, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft, BrainCircuit, X
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Quiz,
  getQuizzesFromFirestore,
  deleteQuizFromFirestore,
  saveQuizToFirestore,
  updateQuizInFirestore,
  NewQuizData,
} from '@/lib/firestore.service';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

const questionSchema = z.object({
  question: z.string().min(1, "La question est requise."),
  options: z.array(z.object({ value: z.string().min(1, "L'option ne peut pas être vide.") })).min(2, "Au moins deux options sont requises."),
  correctAnswers: z.array(z.string()).min(1, "Au moins une bonne réponse est requise."),
  explanation: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  category: z.string().min(1, "La catégorie est requise."),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  access_type: z.enum(['gratuit', 'premium']),
  duration_minutes: z.coerce.number().min(1, "La durée doit être d'au moins 1 minute."),
  isMockExam: z.boolean(),
  scheduledFor: z.date().optional(),
  questions: z.array(questionSchema).min(1, "Un quiz doit avoir au moins une question."),
}).refine(data => !data.isMockExam || !!data.scheduledFor, {
  message: "Un concours blanc doit avoir une date de programmation.",
  path: ["scheduledFor"],
});

type QuizFormData = z.infer<typeof quizFormSchema>;

const formatDateForInput = (date?: Date): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

export default function QuizAdminPanel() {
  const { toast } = useToast();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'moyen',
      access_type: 'gratuit',
      duration_minutes: 15,
      isMockExam: false,
      questions: [],
    },
  });

  const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = form;

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  const isMockExam = watch("isMockExam");

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedQuizzes = await getQuizzesFromFirestore();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les quiz.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const resetForm = useCallback(() => {
    reset({
      title: '',
      description: '',
      category: '',
      difficulty: 'moyen',
      access_type: 'gratuit',
      duration_minutes: 15,
      isMockExam: false,
      scheduledFor: undefined,
      questions: [],
    });
    setEditingQuiz(null);
  }, [reset]);

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      reset({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        access_type: quiz.access_type,
        duration_minutes: quiz.duration_minutes,
        isMockExam: quiz.isMockExam || false,
        scheduledFor: quiz.scheduledFor ? new Date(quiz.scheduledFor) : undefined,
        questions: (quiz.questions || []).map(q => ({
          question: q.question,
          options: q.options.map(opt => ({ value: opt })),
          correctAnswers: q.correctAnswers,
          explanation: q.explanation || '',
        })),
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const onFormSubmit = async (formData: QuizFormData) => {
    const quizDataToSave: NewQuizData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      access_type: formData.access_type,
      duration_minutes: formData.duration_minutes,
      isMockExam: formData.isMockExam,
      questions: formData.questions.map(q => ({
        question: q.question,
        options: q.options.map(opt => opt.value),
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
      })),
      total_questions: formData.questions.length,
      scheduledFor: formData.isMockExam ? formData.scheduledFor : undefined,
    };

    try {
      if (editingQuiz) {
        await updateQuizInFirestore(editingQuiz.id!, quizDataToSave as Partial<Quiz>);
      } else {
        await saveQuizToFirestore(quizDataToSave);
      }
      
      toast({ title: 'Succès', description: `Le quiz a été ${editingQuiz ? 'mis à jour' : 'enregistré'}.` });
      
      setTimeout(() => {
        handleCloseDialog();
        fetchQuizzes();
      }, 50);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'enregistrement',
        description: 'Une erreur est survenue lors de la sauvegarde du quiz.',
      });
    }
  };
  
  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteQuizFromFirestore(id);
      toast({ title: 'Succès', description: 'Le quiz a été supprimé.' });
      fetchQuizzes();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le quiz.' });
    }
  };

  const handleGenerateQuiz = async () => {
    const topic = prompt("Quel est le sujet du quiz à générer ?");
    if (!topic) return;

    setIsGenerating(true);
    try {
      const result: GenerateQuizOutput = await generateQuiz({ topic });
      const { quiz } = result;

      reset({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        duration_minutes: quiz.duration_minutes,
        isMockExam: false,
        scheduledFor: undefined,
        questions: (quiz.questions || []).map(q => ({
            question: q.question,
            options: q.options.map(opt => ({ value: opt })),
            correctAnswers: q.correctAnswers,
            explanation: q.explanation || '',
        })),
      });
      
      toast({ title: "Quiz généré !", description: `Un quiz sur "${topic}" a été créé. Veuillez le vérifier avant de l'enregistrer.`});
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de génération', description: "L'IA n'a pas pu générer le quiz." });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black gradient-text">Gérer les Quiz</h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Créez, modifiez ou supprimez des quiz.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2"/>
          Nouveau Quiz
        </Button>
      </div>
      
      <Card className="glassmorphism shadow-xl">
        <CardHeader>
          <CardTitle>Liste des quiz</CardTitle>
          <CardDescription>{quizzes.length} quiz disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="w-10 h-10 animate-spin text-purple-500"/></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Accès</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.category}</TableCell>
                    <TableCell>{quiz.total_questions}</TableCell>
                    <TableCell><Badge variant={quiz.access_type === 'premium' ? 'destructive' : 'default'}>{quiz.access_type}</Badge></TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quiz)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id!)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
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
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}</DialogTitle>
            <DialogDescription>Remplissez les détails ci-dessous. Les champs marqués d'un * sont obligatoires.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Titre *</Label>
                    <Input {...register("title")} id="title" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description *</Label>
                    <Input {...register("description")} id="description" />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Input {...register("category")} id="category"/>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Difficulté *</Label>
                    <Controller name="difficulty" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent>
                      </Select>
                    )}/>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Accès *</Label>
                    <Controller name="access_type" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="gratuit">Gratuit</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent>
                      </Select>
                    )}/>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="duration_minutes">Durée (minutes) *</Label>
                    <Input type="number" {...register("duration_minutes")} id="duration_minutes" />
                    {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes.message}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Controller name="isMockExam" control={control} render={({ field }) => <Switch id="isMockExam" checked={field.value} onCheckedChange={field.onChange} />}/>
                  <Label htmlFor="isMockExam">Concours Blanc</Label>
                </div>
                {isMockExam && (
                  <div className="mt-4 space-y-1.5">
                    <Label>Date de programmation</Label>
                    <Controller name="scheduledFor" control={control} render={({ field }) => (
                      <Input type="datetime-local" value={formatDateForInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value))}/>
                    )}/>
                    {errors.scheduledFor && <p className="text-red-500 text-xs mt-1">{errors.scheduledFor.message}</p>}
                  </div>
                )}
              </Card>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <div>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateQuiz} disabled={isGenerating}>
                            {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin"/> : <BrainCircuit className="w-4 h-4 mr-2"/>} Générer avec l'IA
                        </Button>
                        <Button type="button" size="sm" className="ml-2" onClick={() => appendQuestion({ question: '', options: [{ value: '' }, { value: '' }], correctAnswers: [], explanation: '' })}>
                            <PlusCircle className="w-4 h-4 mr-2"/> Ajouter Question
                        </Button>
                    </div>
                </div>
                {errors.questions && <p className="text-red-500 text-sm">{errors.questions.message}</p>}
                
                <div className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <Card key={question.id} className="bg-muted/50 p-4 space-y-3">
                       <QuestionsForm qIndex={qIndex} control={control} register={register} removeQuestion={removeQuestion} />
                       {errors.questions?.[qIndex] && <p className="text-red-500 text-sm">Veuillez vérifier cette question.</p>}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Enregistrement...</> : <><Save className="w-4 h-4 mr-2"/>Enregistrer</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuestionsForm({ qIndex, control, register, removeQuestion }: { qIndex: number, control: any, register: any, removeQuestion: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`,
  });

  const { watch, setValue } = useForm({
    control,
  });

  const correctAnswers = watch(`questions.${qIndex}.correctAnswers`, []);

  const handleCorrectAnswerChange = (optionValue: string) => {
    const currentCorrectAnswers = watch(`questions.${qIndex}.correctAnswers`, []) || [];
    const newCorrectAnswers = currentCorrectAnswers.includes(optionValue)
      ? currentCorrectAnswers.filter((a: string) => a !== optionValue)
      : [...currentCorrectAnswers, optionValue];
    setValue(`questions.${qIndex}.correctAnswers`, newCorrectAnswers, { shouldValidate: true });
  };
  
  return (
    <>
      <div className="flex justify-between items-center">
        <h4 className="font-bold">Question {qIndex + 1}</h4>
        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeQuestion(qIndex)}>
            <Trash2 className="w-4 h-4"/>
        </Button>
      </div>
      <div>
        <Label>Texte de la question *</Label>
        <Textarea {...register(`questions.${qIndex}.question`)} />
      </div>
      <div>
        <Label>Explication (optionnel)</Label>
        <Textarea {...register(`questions.${qIndex}.explanation`)} />
      </div>
      <div>
        <Label>Options et Bonnes réponses *</Label>
        <div className="space-y-2 mt-1">
            {fields.map((option, optionIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                    <Controller
                        control={control}
                        name={`questions.${qIndex}.options.${optionIndex}.value`}
                        render={({ field: optionField }) => (
                           <Checkbox
                              checked={correctAnswers?.includes(optionField.value)}
                              onCheckedChange={() => handleCorrectAnswerChange(optionField.value)}
                              disabled={!optionField.value}
                           />
                        )}
                    />
                    <Input {...register(`questions.${qIndex}.options.${optionIndex}.value`)} placeholder={`Option ${optionIndex + 1}`} />
                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => remove(optionIndex)}><X className="w-4 h-4"/></Button>
                </div>
            ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: '' })}>Ajouter Option</Button>
      </div>
    </>
  )
}

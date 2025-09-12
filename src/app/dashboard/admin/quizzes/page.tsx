// src/app/dashboard/admin/quizzes/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClipboardList, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft, BrainCircuit, AlertCircle, X, Check
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


// Zod Schema for robust validation
const questionSchema = z.object({
  question: z.string().min(1, "La question ne peut pas être vide."),
  options: z.array(z.string()).min(2, "Il doit y avoir au moins 2 options."),
  correctAnswers: z.array(z.string()).min(1, "Il doit y avoir au moins 1 bonne réponse."),
  explanation: z.string().optional(),
});

const quizSchema = z.object({
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

type QuizFormData = z.infer<typeof quizSchema>;

export default function AdminQuizzesPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const methods = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
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

  const { control, register, handleSubmit, reset, watch, formState: { errors }, setValue } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

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
  
  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      reset({
        ...quiz,
        duration_minutes: quiz.duration_minutes || 15,
        scheduledFor: quiz.scheduledFor ? new Date(quiz.scheduledFor) : undefined,
      });
    } else {
      setEditingQuiz(null);
      reset({
        title: '',
        description: '',
        category: '',
        difficulty: 'moyen',
        access_type: 'gratuit',
        duration_minutes: 15,
        isMockExam: false,
        questions: [],
      });
    }
    setIsDialogOpen(true);
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

  const onSubmit = async (data: QuizFormData) => {
    const quizDataToSave = {
        ...data,
        total_questions: data.questions.length,
        createdAt: editingQuiz ? editingQuiz.createdAt : new Date(),
    };

    try {
        if (editingQuiz) {
            await updateQuizInFirestore(editingQuiz.id!, quizDataToSave);
            toast({ title: 'Succès', description: 'Le quiz a été mis à jour.' });
        } else {
            await saveQuizToFirestore(quizDataToSave);
            toast({ title: 'Succès', description: 'Le quiz a été ajouté.' });
        }
        setIsDialogOpen(false);
        fetchQuizzes();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erreur d\'enregistrement',
            description: 'Une erreur est survenue lors de la sauvegarde du quiz.',
        });
    }
  };
  
  const handleGenerateQuiz = async () => {
    const topic = prompt("Quel est le sujet du quiz à générer ?");
    if (!topic) return;

    setIsGenerating(true);
    try {
        const result: GenerateQuizOutput = await generateQuiz({ topic });
        const { quiz } = result;

        // Populate form with AI-generated data
        setValue('title', quiz.title);
        setValue('description', quiz.description);
        setValue('category', quiz.category);
        setValue('difficulty', quiz.difficulty);
        setValue('duration_minutes', quiz.duration_minutes);
        setValue('questions', quiz.questions); // This replaces existing questions
        
        toast({ title: "Quiz généré !", description: `Un quiz sur "${topic}" a été créé. Veuillez le vérifier avant de l'enregistrer.`});
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erreur de génération', description: "L'IA n'a pas pu générer le quiz." });
    } finally {
        setIsGenerating(false);
    }
  };

  const isMockExam = watch("isMockExam");
  
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}</DialogTitle>
            <DialogDescription>Remplissez les détails ci-dessous. Les champs marqués d'un * sont obligatoires.</DialogDescription>
          </DialogHeader>
           <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                {/* Quiz Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><Label>Titre *</Label><Input {...register("title")} />{errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}</div>
                    <div><Label>Description *</Label><Input {...register("description")} />{errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}</div>
                    <div><Label>Catégorie *</Label><Input {...register("category")} />{errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}</div>
                    <div><Label>Difficulté *</Label><Select onValueChange={(v: any) => setValue('difficulty', v)} defaultValue={watch('difficulty')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent></Select></div>
                    <div><Label>Accès *</Label><Select onValueChange={(v: any) => setValue('access_type', v)} defaultValue={watch('access_type')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="gratuit">Gratuit</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent></Select></div>
                    <div><Label>Durée (minutes) *</Label><Input type="number" {...register("duration_minutes")} />{errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes.message}</p>}</div>
                </div>

                <div className="flex items-center space-x-2"><Switch id="isMockExam" {...register("isMockExam")} /><Label htmlFor="isMockExam">Concours Blanc</Label></div>
                {isMockExam && <div><Label>Date de programmation</Label><Input type="datetime-local" {...register("scheduledFor", { valueAsDate: true })} />{errors.scheduledFor && <p className="text-red-500 text-xs mt-1">{errors.scheduledFor.message}</p>}</div>}
                
                <hr/>
                {/* Questions Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Questions</h3>
                        <div>
                             <Button type="button" variant="outline" size="sm" onClick={handleGenerateQuiz} disabled={isGenerating}>
                                {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin"/> : <BrainCircuit className="w-4 h-4 mr-2"/>} Générer avec l'IA
                            </Button>
                            <Button type="button" size="sm" className="ml-2" onClick={() => append({ question: '', options: ['', ''], correctAnswers: [], explanation: '' })}>
                                <PlusCircle className="w-4 h-4 mr-2"/> Ajouter Question
                            </Button>
                        </div>
                    </div>
                    {errors.questions?.root && <p className="text-red-500 text-xs mt-1">{errors.questions.root.message}</p>}
                    
                    <div className="space-y-6">
                        {fields.map((field, index) => (
                          <QuestionCard key={field.id} index={index} remove={remove} />
                        ))}
                    </div>
                </div>
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit"><Save className="w-4 h-4 mr-2"/>Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for managing a single question
function QuestionCard({ index, remove }: { index: number, remove: (index: number) => void }) {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<QuizFormData>();
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${index}.options`
  });

  const questionErrors = errors.questions?.[index];

  const handleCorrectAnswerChange = (option: string) => {
    const currentCorrectAnswers = watch(`questions.${index}.correctAnswers`) || [];
    const newCorrectAnswers = currentCorrectAnswers.includes(option)
      ? currentCorrectAnswers.filter(a => a !== option)
      : [...currentCorrectAnswers, option];
    setValue(`questions.${index}.correctAnswers`, newCorrectAnswers, { shouldValidate: true });
  };
  
  const options = watch(`questions.${index}.options`);
  const correctAnswers = watch(`questions.${index}.correctAnswers`);

  return (
    <Card className="bg-muted/50 p-4 space-y-3">
        <div className="flex justify-between items-center">
            <h4 className="font-bold">Question {index + 1}</h4>
            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => remove(index)}>
                <Trash2 className="w-4 h-4"/>
            </Button>
        </div>
        <div>
            <Label>Texte de la question *</Label>
            <Textarea {...register(`questions.${index}.question`)} />
            {questionErrors?.question && <p className="text-red-500 text-xs mt-1">{questionErrors.question.message}</p>}
        </div>
        <div>
            <Label>Explication (optionnel)</Label>
            <Textarea {...register(`questions.${index}.explanation`)} />
        </div>
        
        <div>
            <Label>Options *</Label>
             {questionErrors?.options?.root && <p className="text-red-500 text-xs mt-1">{questionErrors.options.root.message}</p>}
            <div className="space-y-2 mt-1">
                {optionFields.map((field, optionIndex) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input {...register(`questions.${index}.options.${optionIndex}`)} placeholder={`Option ${optionIndex + 1}`} />
                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeOption(optionIndex)}><X className="w-4 h-4"/></Button>
                    </div>
                ))}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendOption('')}>Ajouter Option</Button>
        </div>

        <div>
            <Label>Bonnes réponses *</Label>
            {questionErrors?.correctAnswers && <p className="text-red-500 text-xs mt-1">{questionErrors.correctAnswers.message}</p>}
            <div className="grid grid-cols-2 gap-2 mt-1">
                {options.map((option, optionIndex) => (
                    option && (
                        <div key={optionIndex} className="flex items-center space-x-2 p-2 bg-background rounded-md">
                            <input
                                type="checkbox"
                                id={`q${index}-opt${optionIndex}`}
                                value={option}
                                checked={correctAnswers?.includes(option)}
                                onChange={() => handleCorrectAnswerChange(option)}
                            />
                            <Label htmlFor={`q${index}-opt${optionIndex}`} className="flex-1 cursor-pointer">{option}</Label>
                        </div>
                    )
                ))}
            </div>
        </div>
    </Card>
  )
}

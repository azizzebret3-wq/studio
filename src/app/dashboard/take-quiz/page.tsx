// src/app/dashboard/take-quiz/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Info, Award, BarChart, Loader, ArrowLeft, ArrowRight } from 'lucide-react';
import { getQuizzesFromFirestore, Quiz, saveAttemptToFirestore } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';

type ActiveQuiz = Quiz;

type QuestionResult = {
  question: string;
  options: string[];
  selectedAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  explanation?: string;
};

export default function TakeQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = React.useState<ActiveQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<string[][]>([]);
  const [quizFinished, setQuizFinished] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(900); // 15 minutes default
  const [results, setResults] = React.useState<QuestionResult[]>([]);
  const [loading, setLoading] = React.useState(true);

  const quizId = searchParams.get('id');
  const source = searchParams.get('source');

  
  const handleFinishQuiz = React.useCallback(async () => {
    if (!quiz || !user || quizFinished) return; // Prevent multiple submissions
    
    setQuizFinished(true);

    if (source === 'generated') {
      sessionStorage.removeItem('generatedQuiz');
    }

    const newResults: QuestionResult[] = quiz.questions.map((q, index) => {
      const userSelection = userAnswers[index] || [];
      const isCorrect =
        q.correctAnswers.length === userSelection.length &&
        q.correctAnswers.every((ans) => userSelection.includes(ans));
      
      return {
        question: q.question,
        options: q.options,
        selectedAnswers: userSelection,
        correctAnswers: q.correctAnswers,
        isCorrect,
        explanation: q.explanation,
      };
    });
    setResults(newResults);

    const score = newResults.filter(r => r.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    
    try {
        await saveAttemptToFirestore({
            userId: user.uid,
            quizId: quiz.id || 'generated',
            quizTitle: quiz.title,
            score: score,
            totalQuestions: totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            correctAnswers: score,
            createdAt: new Date(),
        });
        toast({ title: 'Résultats enregistrés !', description: 'Votre performance a été sauvegardée.' });
    } catch(error) {
        console.error("Failed to save attempt", error);
        toast({ title: 'Erreur', description: "Impossible d'enregistrer vos résultats.", variant: 'destructive' });
    }
  }, [quiz, user, source, userAnswers, toast, quizFinished]);

  React.useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      
      const quizId = searchParams.get('id');
      const source = searchParams.get('source');

      if (source === 'generated') {
        const quizData = sessionStorage.getItem('generatedQuiz');
        if (quizData) {
          const parsedData: GenerateQuizOutput = JSON.parse(quizData);
          const activeQuiz = {...parsedData.quiz, id: `generated-${Date.now()}`};
          setQuiz(activeQuiz as ActiveQuiz);
          setUserAnswers(Array(activeQuiz.questions.length).fill([]));
          setTimeLeft((activeQuiz.questions.length || 10) * 60); // 1 minute per question
        } else {
          toast({ title: 'Erreur', description: 'Aucun quiz généré trouvé.', variant: 'destructive' });
          router.push('/dashboard/quizzes');
        }
      } else if (quizId) {
        try {
          const allQuizzes = await getQuizzesFromFirestore();
          const foundQuiz = allQuizzes.find(q => q.id === quizId);
          if (foundQuiz) {
            setQuiz(foundQuiz);
            setUserAnswers(Array(foundQuiz.questions.length).fill([]));
            setTimeLeft(foundQuiz.duration_minutes * 60);
          } else {
            toast({ title: 'Erreur', description: 'Quiz non trouvé.', variant: 'destructive' });
            router.push('/dashboard/quizzes');
          }
        } catch (error) {
          toast({ title: 'Erreur de chargement', description: 'Impossible de charger le quiz.', variant: 'destructive' });
          router.push('/dashboard/quizzes');
        }
      } else {
        router.push('/dashboard/quizzes');
      }
      setLoading(false);
    };

    loadQuiz();
  }, [router, toast, searchParams]);
  
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quiz && !quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizFinished) {
      handleFinishQuiz();
    }
    return () => clearInterval(timer);
  }, [quiz, quizFinished, timeLeft, handleFinishQuiz]);


  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleAnswerChange = (option: string) => {
    const newAnswers = [...userAnswers];
    const currentAnswers = newAnswers[currentQuestionIndex] || [];
    const updatedAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(item => item !== option)
      : [...currentAnswers, option];
    newAnswers[currentQuestionIndex] = updatedAnswers;
    setUserAnswers(newAnswers);
  };

  if (loading || !quiz) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
          <Loader className="w-12 h-12 animate-spin text-purple-500" />
          <p className="font-medium text-muted-foreground">Chargement du quiz...</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const score = results.filter(r => r.isCorrect).length;

  if (quizFinished) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <Card className="glassmorphism shadow-xl">
          <CardHeader className="text-center">
            <Award className="w-16 h-16 mx-auto text-yellow-500" />
            <CardTitle className="text-3xl font-black gradient-text">Résultats du Quiz</CardTitle>
            <CardDescription className="text-lg font-medium">{quiz.title}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-5xl font-bold">
              {score} / {quiz.questions.length}
            </p>
            <Progress value={(score / quiz.questions.length) * 100} className="w-full max-w-sm mx-auto" />
             <Button onClick={() => router.push('/dashboard/quizzes')}>
                Retourner à la liste des quiz
            </Button>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart/>Correction détaillée</h2>
          {results.map((result, index) => (
            <Card key={index} className="glassmorphism shadow-lg border-l-4" style={{borderColor: result.isCorrect ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}}>
              <CardContent className="p-6 space-y-3">
                <p className="font-bold">{index + 1}. {result.question}</p>
                <div className="space-y-2">
                  {result.options.map(option => {
                    const isSelected = result.selectedAnswers.includes(option);
                    const isCorrect = result.correctAnswers.includes(option);
                    const Icon = isCorrect ? CheckCircle : XCircle;
                    
                    let className = 'text-gray-700 dark:text-gray-300';
                    if (isSelected && isCorrect) className = 'text-green-600 dark:text-green-400 font-bold';
                    else if (isSelected && !isCorrect) className = 'text-red-600 dark:text-red-400 line-through';
                    else if (!isSelected && isCorrect) className = 'text-green-600 dark:text-green-400';

                    return (
                      <div key={option} className="flex items-center gap-3 text-sm p-2 rounded-md bg-white/50 dark:bg-black/20">
                         {isSelected ? (
                            <Icon className={`w-5 h-5 ${isCorrect ? 'text-green-500' : 'text-red-500'}`} />
                        ) : (
                             isCorrect && <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />
                        )}
                        <span className={className}>{option}</span>
                      </div>
                    );
                  })}
                </div>
                {result.explanation && (
                  <div className="mt-2 p-3 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <div><strong>Explication :</strong> {result.explanation}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswersForCurrent = userAnswers[currentQuestionIndex] || [];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-3xl glassmorphism shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start mb-2 gap-4">
             <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className='flex-1 text-center'>
                <CardTitle className="text-xl font-bold gradient-text">{quiz.title}</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} sur {quiz.questions.length}</CardDescription>
            </div>
            <div className="flex items-center gap-2 font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full text-sm shrink-0">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg font-semibold">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                 <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-all">
                    <Checkbox 
                        id={`option-${index}`}
                        checked={selectedAnswersForCurrent.includes(option)}
                        onCheckedChange={() => handleAnswerChange(option)}
                    />
                    <Label htmlFor={`option-${index}`} className="font-medium flex-1 cursor-pointer">
                        {option}
                    </Label>
                 </div>
              ))}
            </div>
             <p className="text-xs text-muted-foreground text-center">
              Cette question peut avoir une ou plusieurs bonnes réponses.
            </p>
            <div className="flex justify-between gap-4">
              <Button onClick={handlePreviousQuestion} variant="outline" disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button onClick={() => handleFinishQuiz()} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg">
                  Terminer le Quiz
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg">
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

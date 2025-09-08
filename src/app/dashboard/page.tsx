// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { 
  Trophy, 
  Play, 
  BookOpen, 
  Clock,
  Target,
  Award,
  ArrowRight,
  Crown,
  Calendar,
  Zap,
  Star,
  Flame,
  Sparkles,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data, to be replaced with Firebase data later
const mockQuizzes = [
  { id: '1', title: 'Culture Générale - Niveau 1', access_type: 'gratuit', difficulty: 'facile', duration_minutes: 10, total_questions: 20, category: 'Culture' },
  { id: '2', title: 'Logique & Mathématiques', access_type: 'premium', difficulty: 'moyen', duration_minutes: 20, total_questions: 15, category: 'Logique' },
  { id: '3', title: 'Histoire du Burkina Faso', access_type: 'gratuit', difficulty: 'facile', duration_minutes: 15, total_questions: 25, category: 'Histoire' },
  { id: '4', title: 'Droit Administratif', access_type: 'premium', difficulty: 'difficile', duration_minutes: 30, total_questions: 30, category: 'Droit' },
];

const mockRecentAttempts = [
    { id: 'a1', quiz_id: 'q1', percentage: 85, correct_answers: 17, total_questions: 20, created_date: new Date().toISOString() },
    { id: 'a2', quiz_id: 'q2', percentage: 70, correct_answers: 14, total_questions: 20, created_date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'a3', quiz_id: 'q3', percentage: 55, correct_answers: 11, total_questions: 20, created_date: new Date(Date.now() - 172800000).toISOString() },
];

const mockContents = [
    { id: 'c1', title: 'Résumé de la Constitution', type: 'pdf', access_type: 'gratuit' },
    { id: 'c2', title: 'Vidéo : Résoudre les tests psychotechniques', type: 'video', access_type: 'premium', duration: '45 min' },
    { id: 'c3', title: 'Annales du concours ENA 2023', type: 'pdf', access_type: 'premium' },
];


export default function Dashboard() {
  const { user, userData, loading } = useAuth();
  
  // For now, we'll use mocked data. This can be replaced with API calls to Firestore.
  const [quizzes] = useState(mockQuizzes);
  const [recentAttempts] = useState(mockRecentAttempts);
  const [contents] = useState(mockContents);
  
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    weeklyProgress: 0
  });

  useEffect(() => {
      // Calculate stats from mocked data
      const totalQuizzes = quizzes.length;
      const completedQuizzes = recentAttempts.length;
      const averageScore = recentAttempts.length > 0 
        ? recentAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / recentAttempts.length 
        : 0;

      setStats({
        totalQuizzes,
        completedQuizzes,
        averageScore: Math.round(averageScore),
        weeklyProgress: Math.min(100, (completedQuizzes / Math.max(1, totalQuizzes)) * 100)
      });
  }, [quizzes, recentAttempts]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl w-2/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl"></div>
            <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = userData?.premium || false; // Assuming a 'premium' field in userData
  const firstName = userData?.fullName?.split(' ')[0] || 'Champion';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 min-h-screen">
       <style>{`
          .card-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-hover:hover {
            transform: translateY(-6px) scale(1.01);
          }
          .glassmorphism {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black gradient-text">
              Salut {firstName} ! 
            </h1>
            <div className="text-3xl floating">🚀</div>
          </div>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Prêt à dominer ton concours ?
          </p>
        </div>
        
        {!isPremium && (
          <Card className="card-hover glassmorphism border-2 border-yellow-200 shadow-xl w-full lg:w-auto">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-800">Passer Premium</h3>
                  <p className="text-sm text-yellow-700">Débloquer tout</p>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold shadow-lg ml-auto">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Allons-y
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase">Quiz</CardTitle>
            <Play className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-gray-900">{stats.totalQuizzes}</div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase">Complétés</CardTitle>
             <Target className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-gray-900">{stats.completedQuizzes}</div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase">Score</CardTitle>
            <Trophy className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-gray-900">{stats.averageScore}%</div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 group-hover:from-orange-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase">Série</CardTitle>
            <Flame className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-gray-900">{Math.min(7, stats.completedQuizzes)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Quiz Recommandés</CardTitle>
                  <p className="text-gray-600 font-medium text-sm">Sélectionnés par notre IA</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <div className="text-center py-10">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">Aucun quiz disponible</h3>
                  <p className="text-gray-500 text-sm">Revenez bientôt !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.slice(0,4).map((quiz, index) => (
                    <div key={quiz.id} className="group bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-3 hover:bg-white/80 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                              index % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              index % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              index % 4 === 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}>
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-sm">
                                {quiz.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{quiz.category}</Badge>
                                <Badge variant="outline" className={`text-xs capitalize ${
                                  quiz.difficulty === 'facile' ? 'border-green-300 text-green-700' :
                                  quiz.difficulty === 'moyen' ? 'border-yellow-300 text-yellow-700' :
                                  'border-red-300 text-red-700'
                                }`}>
                                  {quiz.difficulty}
                                </Badge>
                              </div>
                            </div>
                        </div>
                        <Link href={`/dashboard/quizzes/${quiz.id}`} passHref>
                          <Button 
                            size="icon"
                            className={`rounded-full shadow-md w-10 h-10 ${
                              quiz.access_type === 'premium' && !isPremium 
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                            }`}
                            disabled={quiz.access_type === 'premium' && !isPremium}
                          >
                             {quiz.access_type === 'premium' && !isPremium ? <Crown className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Link href="/dashboard/quizzes" passHref>
                  <Button variant="outline" size="sm" className="font-semibold rounded-lg hover:bg-purple-50 border-purple-200 text-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Voir tous les quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Derniers Résultats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <div className="text-center py-6">
                   <Trophy className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">Aucun résultat encore</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      attempt.percentage >= 80 ? 'bg-green-50/50 border-green-200' :
                      attempt.percentage >= 60 ? 'bg-yellow-50/50 border-yellow-200' :
                      'bg-red-50/50 border-red-200'
                    }`}>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Quiz #{attempt.quiz_id.slice(-6)}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(attempt.created_date), 'dd MMM', { locale: fr })} - {attempt.correct_answers}/{attempt.total_questions}
                        </p>
                      </div>
                      <div className={`text-lg font-black ${
                          attempt.percentage >= 80 ? 'text-green-600' : 
                          attempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Nouveau Contenu</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
               {contents.length === 0 ? (
                 <div className="text-center py-6">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">Aucun contenu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contents.slice(0, 3).map((content) => (
                    <div key={content.id} className="group p-3 border border-gray-200 rounded-lg hover:bg-white/80 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
                          content.type === 'pdf' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                          'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}>
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-purple-600">
                            {content.title}
                          </p>
                           <Badge variant="outline" className="text-xs capitalize mt-1">
                              {content.type}
                            </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

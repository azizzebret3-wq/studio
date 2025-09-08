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
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl"></div>
            <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = userData?.premium || false; // Assuming a 'premium' field in userData
  const firstName = userData?.fullName?.split(' ')[0] || 'Champion';

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 min-h-screen">
       <style>{`
          .card-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-hover:hover {
            transform: translateY(-8px) scale(1.02);
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
          .pulse-glow {
            animation: pulse-glow 2s infinite;
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
            50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.8); }
          }
          .floating {
            animation: float 4s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-black gradient-text">
              Salut {firstName} ! 
            </h1>
            <div className="text-4xl floating">🚀</div>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Prêt à dominer ton concours <span className="capitalize font-bold text-purple-600">{userData?.competitionType}</span> aujourd'hui ?
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
        </div>
        
        {!isPremium && (
          <Card className="card-hover glassmorphism border-2 border-yellow-200 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg floating">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-yellow-800 text-lg">Passer Premium</h3>
                  <p className="text-sm text-yellow-700">Débloquer tout ton potentiel</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  5000 FCFA/an
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Quiz Disponibles</CardTitle>
              <div className="text-3xl font-black text-gray-900 mt-2">{stats.totalQuizzes}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-gray-600 font-medium">
              {isPremium ? "🔥 Accès illimité" : "📊 Version gratuite"}
            </p>
            {!isPremium && (
              <Badge className="mt-2 bg-blue-100 text-blue-800 font-semibold">
                +50 avec Premium
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Quiz Complétés</CardTitle>
              <div className="text-3xl font-black text-gray-900 mt-2">{stats.completedQuizzes}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Progress value={stats.weeklyProgress} className="h-2 mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              {stats.weeklyProgress >= 80 ? "🎯 Excellent rythme !" : stats.weeklyProgress >= 50 ? "💪 Bon progrès" : "🚀 Accélère le rythme"}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Score Moyen</CardTitle>
              <div className="text-3xl font-black text-gray-900 mt-2">{stats.averageScore}%</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center gap-2">
              {stats.averageScore >= 80 && <div className="flex gap-1">{Array(3).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />)}</div>}
              {stats.averageScore >= 60 && stats.averageScore < 80 && <div className="flex gap-1">{Array(2).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />)}</div>}
              {stats.averageScore < 60 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              <p className="text-sm text-gray-600 font-medium">
                {stats.averageScore >= 80 ? "🏆 Champion !" : stats.averageScore >= 60 ? "📈 En progression" : "💡 Continue tes efforts"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 group-hover:from-orange-500/20 group-hover:to-red-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Série Actuelle</CardTitle>
              <div className="text-3xl font-black text-gray-900 mt-2">{Math.min(7, stats.completedQuizzes)}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Flame className="w-7 h-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm text-gray-600 font-medium">
              {stats.completedQuizzes >= 7 ? "🔥 En feu !" : stats.completedQuizzes >= 3 ? "⚡ Bien parti" : "🌱 Commence fort"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glassmorphism shadow-2xl card-hover border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Quiz Recommandés Pour Toi</CardTitle>
                  <p className="text-gray-600 font-medium">Sélectionnés par notre IA selon ton niveau</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun quiz disponible</h3>
                  <p className="text-gray-500">Reviens bientôt pour de nouveaux défis !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className="group bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 hover:bg-white/80 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              index % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              index % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              index % 4 === 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}>
                              <Play className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {quiz.title}
                              </h3>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant={quiz.access_type === 'premium' ? 'default' : 'secondary'} className="font-semibold">
                                  {quiz.access_type === 'premium' ? (
                                    <><Crown className="w-3 h-3 mr-1" />Premium</>
                                  ) : (
                                    'Gratuit'
                                  )}
                                </Badge>
                                <Badge variant="outline" className={`font-semibold capitalize ${
                                  quiz.difficulty === 'facile' ? 'border-green-300 text-green-700' :
                                  quiz.difficulty === 'moyen' ? 'border-yellow-300 text-yellow-700' :
                                  'border-red-300 text-red-700'
                                }`}>
                                  {quiz.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600 font-medium">
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {quiz.duration_minutes} min
                            </span>
                            <span className="flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              {quiz.total_questions} questions
                            </span>
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              {quiz.category}
                            </span>
                          </div>
                        </div>
                        <div className="ml-6">
                           <Link href={`/dashboard/quizzes/${quiz.id}`} passHref>
                            <Button 
                              className={`font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 group ${
                                quiz.access_type === 'premium' && !isPremium 
                                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                              }`}
                              disabled={quiz.access_type === 'premium' && !isPremium}
                            >
                              {quiz.access_type === 'premium' && !isPremium ? (
                                <>
                                  <Crown className="w-5 h-5 mr-2" />
                                  Premium
                                </>
                              ) : (
                                <>
                                  <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                  Commencer
                                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-8 text-center">
                <Link href="/dashboard/quizzes" passHref>
                  <Button variant="outline" className="font-semibold px-8 py-3 rounded-xl hover:bg-purple-50 border-purple-200 text-purple-700">
                    <Zap className="w-5 h-5 mr-2" />
                    Explorer tous les quiz
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glassmorphism shadow-2xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Tes Derniers Résultats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucun résultat encore</p>
                  <p className="text-sm text-gray-400 mt-1">Commence ton premier quiz !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttempts.slice(0, 4).map((attempt, index) => (
                    <div key={attempt.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                      attempt.percentage >= 80 ? 'bg-green-50 border-green-200' :
                      attempt.percentage >= 60 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          attempt.percentage >= 80 ? 'bg-green-500 text-white' :
                          attempt.percentage >= 60 ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Quiz #{attempt.quiz_id.slice(-6)}</p>
                          <p className="text-xs text-gray-500 font-medium">
                            {format(new Date(attempt.created_date), 'dd MMM à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-black ${
                          attempt.percentage >= 80 ? 'text-green-600' : 
                          attempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage}%
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {attempt.correct_answers}/{attempt.total_questions} correct
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glassmorphism shadow-2xl card-hover border-0">
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
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucun contenu disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contents.slice(0, 4).map((content) => (
                    <div key={content.id} className="group p-4 border border-gray-200 rounded-xl hover:bg-white/80 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                          content.type === 'pdf' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                          content.type === 'video' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 
                          'bg-gradient-to-r from-purple-500 to-indigo-600'
                        }`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                            {content.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs font-semibold capitalize">
                              {content.type}
                            </Badge>
                            {content.access_type === 'premium' && (
                              <Badge className="text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          {content.duration && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">{content.duration}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Link href="/dashboard/documents" passHref>
                  <Button variant="outline" className="w-full font-semibold rounded-xl hover:bg-green-50 border-green-200 text-green-700">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explorer la bibliothèque
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

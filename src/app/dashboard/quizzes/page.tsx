// src/app/dashboard/quizzes/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ArrowRight,
  Crown,
  Lock,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data, to be replaced with Firebase data
const mockQuizzes = [
  { id: '1', title: 'Culture Générale - Niveau 1', access_type: 'gratuit', difficulty: 'facile', duration_minutes: 10, total_questions: 20, category: 'Culture Générale' },
  { id: '2', title: 'Logique & Mathématiques', access_type: 'premium', difficulty: 'moyen', duration_minutes: 20, total_questions: 15, category: 'Logique' },
  { id: '3', title: 'Histoire du Burkina Faso', access_type: 'gratuit', difficulty: 'facile', duration_minutes: 15, total_questions: 25, category: 'Histoire' },
  { id: '4', title: 'Droit Administratif', access_type: 'premium', difficulty: 'difficile', duration_minutes: 30, total_questions: 30, category: 'Droit' },
  { id: '5', title: 'Anglais : Les temps verbaux', access_type: 'gratuit', difficulty: 'moyen', duration_minutes: 10, total_questions: 20, category: 'Anglais' },
  { id: '6', title: 'Actualités Internationales 2024', access_type: 'premium', difficulty: 'difficile', duration_minutes: 25, total_questions: 30, category: 'Actualités' },
  { id: '7', title: 'Informatique : Réseaux', access_type: 'gratuit', difficulty: 'facile', duration_minutes: 15, total_questions: 20, category: 'Informatique' },
  { id: '8', title: 'Test Psychotechnique - Avancé', access_type: 'premium', difficulty: 'difficile', duration_minutes: 45, total_questions: 40, category: 'Psychotechnique' },
];

export default function QuizzesPage() {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    access: 'all',
  });

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    return (
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.category === 'all' || quiz.category === filters.category) &&
      (filters.difficulty === 'all' || quiz.difficulty === filters.difficulty) &&
      (filters.access === 'all' || quiz.access_type === filters.access)
    );
  });
  
  const isPremium = userData?.subscription_type === 'premium';
  
  const categories = ['all', ...Array.from(new Set(mockQuizzes.map(q => q.category)))];
  const difficulties = ['all', 'facile', 'moyen', 'difficile'];
  const accessTypes = ['all', 'gratuit', 'premium'];


  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg floating">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black gradient-text">
                Tous les Quiz
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Mettez-vous au défi et suivez votre progression.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="glassmorphism shadow-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative md:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher un quiz..."
              className="pl-10 h-12 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Toutes les catégories' : cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Difficulté" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(diff => <SelectItem key={diff} value={diff}>{diff === 'all' ? 'Toutes les difficultés' : diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={filters.access} onValueChange={(value) => handleFilterChange('access', value)}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Accès" />
            </SelectTrigger>
            <SelectContent>
               {accessTypes.map(acc => <SelectItem key={acc} value={acc}>{acc === 'all' ? 'Tous les accès' : acc.charAt(0).toUpperCase() + acc.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredQuizzes.map((quiz, index) => {
          const isLocked = quiz.access_type === 'premium' && !isPremium;
          return (
            <Card key={quiz.id} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={`font-semibold capitalize ${
                    quiz.difficulty === 'facile' ? 'border-green-300 text-green-700' :
                    quiz.difficulty === 'moyen' ? 'border-yellow-300 text-yellow-700' :
                    'border-red-300 text-red-700'
                  }`}>
                    {quiz.difficulty}
                  </Badge>
                  {quiz.access_type === 'premium' && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2 group-hover:text-purple-600 transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-4">
                  Catégorie : {quiz.category}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600 font-medium border-t border-gray-200 pt-4">
                  <span>{quiz.total_questions} questions</span>
                  <span>{quiz.duration_minutes} min</span>
                </div>
              </CardContent>
              <Link href={isLocked ? '#' : `/dashboard/quizzes/${quiz.id}`} passHref>
                <Button 
                  className={`w-full font-bold text-white rounded-t-none h-14 text-base ${
                    isLocked 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  }`}
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Réservé Premium
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Commencer le quiz
                    </>
                  )}
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 col-span-full">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun quiz trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
      )}
    </div>
  );
}

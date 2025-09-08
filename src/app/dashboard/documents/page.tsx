// src/app/dashboard/documents/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Search, 
  Download,
  ArrowRight,
  Crown,
  Lock,
  FileText,
  Video
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
const mockDocuments = [
  { id: '1', title: 'Annales Corrigées - ENA 2023', type: 'pdf', access_type: 'premium', category: 'Annales' },
  { id: '2', title: 'Résumé de la Constitution', type: 'pdf', access_type: 'gratuit', category: 'Droit' },
  { id: '3', title: 'Fiche de révision : Histoire Géo', type: 'pdf', access_type: 'gratuit', category: 'Histoire' },
  { id: '4', title: 'Guide des Tests Psychotechniques', type: 'pdf', access_type: 'premium', category: 'Psychotechnique' },
  { id: '5', title: 'Leçons de Culture Générale', type: 'pdf', access_type: 'gratuit', category: 'Culture Générale' },
  { id: '6', title: 'Vidéo : Méthodologie de la dissertation', type: 'video', access_type: 'premium', category: 'Méthodologie' },
];

export default function DocumentsPage() {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
  });

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    return (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.category === 'all' || doc.category === filters.category) &&
      (filters.type === 'all' || doc.type === filters.type)
    );
  });
  
  const isPremium = userData?.subscription_type === 'premium';
  
  const categories = ['all', ...Array.from(new Set(mockDocuments.map(d => d.category)))];
  const types = ['all', 'pdf', 'video'];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Bibliothèque
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Toutes les ressources pour votre succès.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="glassmorphism shadow-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une ressource..."
              className="pl-9 h-10 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat} className="text-sm">{cat === 'all' ? 'Toutes les catégories' : cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue placeholder="Type de média" />
            </SelectTrigger>
            <SelectContent>
               {types.map(type => <SelectItem key={type} value={type} className="text-sm">{type === 'all' ? 'Tous les types' : type.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.map(doc => {
          const isLocked = doc.access_type === 'premium' && !isPremium;
          const Icon = doc.type === 'pdf' ? FileText : Video;
          
          return (
            <Card key={doc.id} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0 flex flex-col">
              <CardContent className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                    doc.type === 'pdf' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                    'bg-gradient-to-r from-blue-500 to-cyan-500'
                   }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {doc.access_type === 'premium' && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                  {doc.title}
                </h3>
                <Badge variant="outline" className="text-xs font-semibold capitalize">
                  {doc.category}
                </Badge>
              </CardContent>
              <div className="p-3 bg-white/20">
                <Button 
                  className={`w-full font-bold text-white rounded-lg h-10 text-sm ${
                    isLocked 
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  }`}
                  disabled={isLocked}
                  asChild
                >
                  <Link href={isLocked ? '#' : `/dashboard/documents/${doc.id}`}>
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Premium
                      </>
                    ) : (
                      <>
                        {doc.type === 'pdf' ? 'Consulter' : 'Visionner'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {filteredDocuments.length === 0 && (
        <div className="text-center py-10 col-span-full">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucune ressource trouvée</h3>
            <p className="text-gray-500 text-sm">Essayez de modifier vos filtres.</p>
        </div>
      )}
    </div>
  );
}

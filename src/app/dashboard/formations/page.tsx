// src/app/dashboard/formations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, BookCheck, Zap, ChevronRight, BarChart, Loader } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getTrainingPathsFromFirestore, TrainingPath } from '@/lib/firestore.service';
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps>;
  if (!LucideIcon) return <BookCheck {...props} />; // Fallback icon
  return <LucideIcon {...props} />;
};

export default function FormationsPage() {
  const [trainingPaths, setTrainingPaths] = useState<TrainingPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaths = async () => {
      setIsLoading(true);
      try {
        const paths = await getTrainingPathsFromFirestore();
        setTrainingPaths(paths);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les parcours de formation.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaths();
  }, [toast]);


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Parcours de Formation
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Maîtrisez les programmes, étape par étape.
              </p>
            </div>
          </div>
        </div>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Proposer un parcours
        </Button>
      </div>
      
       {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-10 h-10 animate-spin text-purple-500" />
        </div>
      ) : trainingPaths.length === 0 ? (
        <div className="text-center py-16">
           <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-400" />
           </div>
           <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun parcours de formation</h3>
           <p className="text-gray-500 text-sm">De nouveaux parcours seront bientôt disponibles.</p>
        </div>
      ) : (
       <div className="space-y-6">
        {trainingPaths.map((path) => (
           <Card key={path.id} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0">
             <Link href="#" className="block p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${path.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon name={path.icon as IconName} className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-lg font-bold text-foreground group-hover:text-purple-600 transition-colors">{path.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{path.description}</p>
                   <div className="flex items-center gap-4">
                    <Progress value={path.progress} className="w-full h-2" />
                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{path.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <Badge variant={path.status === 'Terminé' ? 'default' : 'secondary'} className={path.status === 'Terminé' ? 'bg-green-500 text-white' : ''}>
                    {path.status}
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
           </Card>
        ))}
       </div>
      )}
    </div>
  );
}

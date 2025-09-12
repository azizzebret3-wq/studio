// src/app/dashboard/formations/page.tsx
'use client';

import React from 'react';
import { Trophy, BookCheck, Zap, ChevronRight, BarChart } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const trainingPaths = [
  {
    title: "Préparation Complète au Concours Direct ENA",
    description: "Un parcours structuré couvrant toutes les matières, des connaissances générales au droit administratif.",
    icon: BarChart,
    color: "from-blue-500 to-cyan-500",
    progress: 75,
    status: "En cours",
  },
  {
    title: "Maîtriser les Tests Psychotechniques",
    description: "Développez votre logique, votre raisonnement et votre rapidité pour exceller dans les tests psychotechniques.",
    icon: BarChart,
    color: "from-purple-500 to-pink-500",
    progress: 30,
    status: "Non commencé",
  },
  {
    title: "Culture Générale pour les Concours de la Fonction Publique",
    description: "Approfondissez votre connaissance du monde contemporain, de l'histoire et des institutions.",
    icon: BookCheck,
    color: "from-orange-500 to-red-500",
    progress: 0,
    status: "Non commencé",
  },
   {
    title: "Devenir un Expert en Note de Synthèse",
    description: "Apprenez la méthodologie et les techniques pour rédiger des notes de synthèse parfaites.",
    icon: BarChart,
    color: "from-green-500 to-emerald-500",
    progress: 100,
    status: "Terminé",
  },
];


export default function FormationsPage() {
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

       <div className="space-y-6">
        {trainingPaths.map((path, index) => (
           <Card key={index} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0">
             <Link href="#" className="block p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${path.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <path.icon className="w-8 h-8 text-white" />
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

    </div>
  );
}

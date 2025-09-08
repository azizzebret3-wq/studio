
// src/app/dashboard/admin/page.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, ClipboardList, BrainCircuit, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);


  if (loading || !userData || userData.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
      </div>
    );
  }
  
  const adminLinks = [
      {
          title: "Gérer les Utilisateurs",
          description: "Voir, modifier et assigner des rôles.",
          href: "/dashboard/admin/users",
          icon: Users,
          color: "from-amber-500 to-orange-500"
      },
      {
          title: "Gérer les Quiz",
          description: "Ajouter, modifier ou supprimer des quiz.",
          href: "/dashboard/admin/quizzes",
          icon: ClipboardList,
           color: "from-teal-500 to-cyan-500"
      },
      {
          title: "Gérer la Bibliothèque",
          description: "Gérer les PDF et les vidéos.",
          href: "/dashboard/admin/content",
          icon: FileText,
          color: "from-rose-500 to-pink-500"
      },
      {
          title: "Générateur de Quiz IA",
          description: "Créer des quiz automatiquement avec l'IA.",
          href: "/dashboard/admin/generate-quiz",
          icon: BrainCircuit,
          color: "from-indigo-500 to-purple-500"
      }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black gradient-text">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Gérez l'ensemble de la plateforme ici.
        </p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminLinks.map((link) => (
            <Card key={link.title} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0">
                <Link href={link.href} passHref>
                    <div className="p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${link.color}`}>
                                <link.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold group-hover:text-purple-600 transition-colors">{link.title}</h2>
                                <p className="text-sm text-muted-foreground">{link.description}</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </Card>
          ))}
      </div>
    </div>
  );
}

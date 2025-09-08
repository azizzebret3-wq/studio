// src/app/dashboard/admin/content/page.tsx
'use client';

import React from 'react';
import { FileText, PlusCircle, Trash2, Edit } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

// Mock data, to be replaced with Firebase data
const mockDocuments = [
  { id: '1', title: 'Annales Corrigées - ENA 2023', type: 'pdf', access_type: 'premium', category: 'Annales' },
  { id: '2', title: 'Résumé de la Constitution', type: 'pdf', access_type: 'gratuit', category: 'Droit' },
  { id: '3', title: 'Fiche de révision : Histoire Géo', type: 'pdf', access_type: 'gratuit', category: 'Histoire' },
  { id: '6', title: 'Vidéo : Méthodologie de la dissertation', type: 'video', access_type: 'premium', category: 'Méthodologie' },
];


export default function AdminContentPage() {
  // Add logic to fetch and manage content (PDFs, videos)
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Gérer la Bibliothèque
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Ajoutez, modifiez ou supprimez des ressources.
              </p>
            </div>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2"/>
          Ajouter une ressource
        </Button>
      </div>
      
       <Card className="glassmorphism shadow-xl">
        <CardHeader>
          <CardTitle>Contenu de la bibliothèque</CardTitle>
          <CardDescription>
            {mockDocuments.length} ressources sont actuellement disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Accès</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant={doc.type === 'pdf' ? 'secondary' : 'outline'}>{doc.type}</Badge>
                    </TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>
                      <Badge variant={doc.access_type === 'premium' ? 'destructive' : 'default'}>
                        {doc.access_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                       <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

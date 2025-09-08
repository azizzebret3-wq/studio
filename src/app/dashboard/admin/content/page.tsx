// src/app/dashboard/admin/content/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, Trash2, Edit, Loader } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LibraryDocument, getDocumentsFromFirestore, deleteDocumentFromFirestore } from '@/lib/firestore.service';
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
} from "@/components/ui/alert-dialog"

export default function AdminContentPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getDocumentsFromFirestore();
      setDocuments(docs);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les documents.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDocumentFromFirestore(id);
      toast({
        title: 'Succès',
        description: 'Le document a été supprimé.',
      });
      fetchDocuments(); // Refresh list
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le document.',
      });
    }
  }

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
            {documents.length} ressource(s) sont actuellement disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-10 h-10 animate-spin text-purple-500"/>
              </div>
           ) : (
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
                {documents.map((doc) => (
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
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible et supprimera le document de la bibliothèque.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                Supprimer
                              </AlertDialogAction>
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
    </div>
  );
}

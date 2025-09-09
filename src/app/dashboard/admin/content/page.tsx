// src/app/dashboard/admin/content/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  LibraryDocument, 
  getDocumentsFromFirestore, 
  deleteDocumentFromFirestore,
  addDocumentToFirestore,
  updateDocumentInFirestore,
  LibraryDocumentFormData,
} from '@/lib/firestore.service';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminContentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<LibraryDocument | null>(null);
  const [formData, setFormData] = useState<LibraryDocumentFormData>({
    title: '',
    type: 'pdf',
    category: '',
    access_type: 'gratuit',
    url: ''
  });

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

  const resetForm = () => {
    setEditingDocument(null);
    setFormData({
      title: '',
      type: 'pdf',
      category: '',
      access_type: 'gratuit',
      url: ''
    });
  };

  const handleOpenDialog = (doc?: LibraryDocument) => {
    if (doc) {
      setEditingDocument(doc);
      setFormData({
        title: doc.title,
        type: doc.type,
        category: doc.category,
        access_type: doc.access_type,
        url: doc.url
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };
  
  const handleFormChange = (field: keyof LibraryDocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingDocument) {
        await updateDocumentInFirestore(editingDocument.id, formData);
        toast({
          title: 'Succès',
          description: 'Le document a été mis à jour.',
        });
      } else {
        await addDocumentToFirestore(formData);
        toast({
          title: 'Succès',
          description: 'Le document a été ajouté.',
        });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: editingDocument ? 'Impossible de mettre à jour le document.' : 'Impossible d\'ajouter le document.',
      });
    } finally {
      setIsSaving(false);
    }
  };


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
             <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
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
        <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/admin')} className="hidden sm:flex">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
            </Button>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-lg">
                <PlusCircle className="w-4 h-4 mr-2"/>
                Ajouter
            </Button>
        </div>
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
                       <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(doc)}>
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
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if(!isOpen) resetForm();}}>
        <DialogContent className="sm:max-w-[425px]">
           <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingDocument ? 'Modifier le document' : 'Ajouter un document'}</DialogTitle>
                <DialogDescription>
                  Remplissez les détails ci-dessous. Cliquez sur enregistrer lorsque vous avez terminé.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} required />
                </div>
                 <div className="space-y-1.5">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input id="category" value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)} required />
                </div>
                 <div className="space-y-1.5">
                  <Label htmlFor="url">URL du Fichier</Label>
                  <Input id="url" value={formData.url} onChange={(e) => handleFormChange('url', e.target.value)} required placeholder="https://..."/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="type">Type</Label>
                     <Select value={formData.type} onValueChange={(value: 'pdf' | 'video') => handleFormChange('type', value)}>
                        <SelectTrigger id="type"><SelectValue/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="video">Vidéo</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="access_type">Accès</Label>
                    <Select value={formData.access_type} onValueChange={(value: 'gratuit' | 'premium') => handleFormChange('access_type', value)}>
                      <SelectTrigger id="access_type"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gratuit">Gratuit</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Annuler</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Enregistrement...</> : <><Save className="w-4 h-4 mr-2"/>Enregistrer</>}
                </Button>
              </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

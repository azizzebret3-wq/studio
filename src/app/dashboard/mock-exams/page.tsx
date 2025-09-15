// src/app/dashboard/mock-exams/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { getQuizzesFromFirestore, Quiz } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, CalendarClock, Lock, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Countdown = ({ to }: { to: Date }) => {
  const [timeLeft, setTimeLeft] = useState(differenceInSeconds(to, new Date()));

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (timeLeft <= 0) {
    return <span className="text-green-500 font-bold">Le concours a commencé !</span>;
  }

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex gap-2 sm:gap-4 items-center justify-center">
      {days > 0 && <div className="text-center"><div className="text-xl sm:text-2xl font-bold">{days}</div><div className="text-xs">Jours</div></div>}
      <div className="text-center"><div className="text-xl sm:text-2xl font-bold">{String(hours).padStart(2, '0')}</div><div className="text-xs">Heures</div></div>
      <div className="text-center"><div className="text-xl sm:text-2xl font-bold">{String(minutes).padStart(2, '0')}</div><div className="text-xs">Min</div></div>
      <div className="text-center"><div className="text-xl sm:text-2xl font-bold">{String(seconds).padStart(2, '0')}</div><div className="text-xs">Sec</div></div>
    </div>
  );
};


export default function MockExamsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mockExams, setMockExams] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const allQuizzes = await getQuizzesFromFirestore();
        const mockExams = allQuizzes
          .filter(q => q.isMockExam)
          .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime());
        setMockExams(mockExams);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur de chargement',
          description: 'Impossible de récupérer les concours blancs.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, [toast]);
  
  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarClock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Concours Blancs
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Mesurez-vous aux autres dans des conditions réelles.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader className="w-10 h-10 animate-spin text-purple-500"/>
        </div>
      ) : (
        <div className="space-y-6">
          {mockExams.length > 0 ? mockExams.map(exam => {
            const isLocked = exam.access_type === 'premium' && !isPremium && !isAdmin;
            const scheduledDate = new Date(exam.scheduledFor!);
            const hasStarted = new Date() > scheduledDate;

            return (
              <Card key={exam.id} className="glassmorphism shadow-xl card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{exam.title}</CardTitle>
                    {exam.access_type === 'premium' && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Premium requis
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/50 border">
                    {hasStarted ? (
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">Le concours blanc a commencé !</p>
                        <p className="text-sm text-muted-foreground">Terminé {formatDistanceToNow(scheduledDate, { addSuffix: true, locale: fr })}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                         <p className="text-sm font-medium text-muted-foreground mb-2">Le concours commence dans :</p>
                         <Countdown to={scheduledDate} />
                      </div>
                    )}
                  </div>
                   <Button 
                      className={`w-full font-bold text-white rounded-lg h-12 text-base ${
                        isLocked || !hasStarted
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                      }`}
                      disabled={isLocked || !hasStarted}
                      onClick={() => router.push(`/dashboard/take-quiz?id=${exam.id}`)}
                    >
                      {isLocked ? 'Premium Requis' : (hasStarted ? <> <Rocket className="w-5 h-5 mr-2" /> Participer </>: 'En attente')}
                    </Button>
                </CardContent>
              </Card>
            )
          }) : (
            <div className="flex flex-col items-center justify-center text-center py-16 col-span-full">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarClock className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun concours blanc programmé</h3>
                <p className="text-gray-500 text-sm">Revenez bientôt pour de nouveaux défis.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

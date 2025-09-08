// src/app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Home,
  BookOpen,
  ClipboardList as Play,
  FileText,
  Users,
  Settings,
  LogOut,
  User as UserIcon,
  Crown,
  Trophy,
  LayoutDashboard as BarChart3,
  Sparkles,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast"
import { Logo } from '@/components/logo';

interface UserData {
  fullName?: string;
  email?: string;
  competitionType?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
}

const userNavItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: BarChart3, gradient: "from-purple-500 to-pink-500" },
  { title: "Quiz", url: "/dashboard/quizzes", icon: Play, gradient: "from-green-500 to-emerald-500" },
  { title: "Documents", url: "/dashboard/documents", icon: BookOpen, gradient: "from-orange-500 to-red-500" },
  { title: "Vidéos", url: "/dashboard/videos", icon: FileText, gradient: "from-blue-500 to-cyan-500" },
  { title: "Formations", url: "/dashboard/formations", icon: Trophy, gradient: "from-rose-500 to-pink-500" },
];

const adminNavItems = [
  { title: "Gérer Quiz", url: "/dashboard/admin/quizzes", icon: Play, gradient: "from-teal-500 to-cyan-500" },
  { title: "Gérer Contenu", url: "/dashboard/admin/content", icon: FileText, gradient: "from-rose-500 to-pink-500" },
  { title: "Gérer Users", url: "/dashboard/admin/users", icon: Users, gradient: "from-amber-500 to-orange-500" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          // Fallback if user document doesn't exist
          setUserData({ email: user.email || '' });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);
  
  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [pathname]);


  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté.",
      });
      router.push('/login');
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-700 to-blue-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';

  return (
     <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-pink-50/80">
      <style>
        {`
          .glassmorphism {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .glassmorphism-dark {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .floating {
            animation: float 4s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          .pulse-ring {
            animation: pulse-ring 2s infinite;
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 1; }
            40%, 50% { opacity: 0; }
            100% { opacity: 0; transform: scale(1.2); }
          }
          
          .hover-lift {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .hover-lift:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          
          .nav-glow {
            transition: all 0.3s ease;
          }
          
          .nav-glow:hover {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
          }
          
          .menu-slide {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .background-mesh {
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 40%);
          }
        `}
      </style>

      <div className="min-h-screen background-mesh">
        {/* Header */}
        <header className="glassmorphism sticky top-0 z-50 border-b border-white/20 shadow-lg">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg floating">
                    <Trophy className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl opacity-30 pulse-ring"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-black gradient-text tracking-tight">
                    Gagne ton concours
                  </h1>
                  <p className="text-xs text-gray-600 font-semibold capitalize">
                    Concours {userData?.competitionType}
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {userNavItems.map((item) => (
                  <Link key={item.title} href={item.url}>
                    <Button
                      variant="ghost"
                      className={`nav-glow rounded-2xl px-5 py-3 font-semibold text-sm transition-all ${
                        pathname === item.url
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : 'text-gray-700 hover:bg-white/60'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      {item.title}
                    </Button>
                  </Link>
                ))}
                
                {isAdmin && <div className="w-px h-8 bg-gray-300 mx-2"></div>}
                
                {isAdmin && adminNavItems.map((item) => (
                  <Link key={item.title} href={item.url}>
                    <Button
                      variant="ghost"
                      className={`nav-glow rounded-2xl px-5 py-3 font-semibold text-sm transition-all ${
                        pathname === item.url
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : 'text-gray-700 hover:bg-white/60'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      {item.title}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Profile & Hamburger */}
              <div className="flex items-center gap-4">
                {isPremium && (
                  <Badge className="hidden sm:flex bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold shadow-lg px-4 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium
                  </Badge>
                )}

                <div className="hidden md:flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-white/50 shadow-lg hover-lift">
                    <AvatarImage src={userData?.photoURL} />
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold">
                       {getInitials(userData?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">
                       {userData?.fullName?.split(' ')[0] || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      {isPremium ? '👑 Premium' : '🆓 Gratuit'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden glassmorphism rounded-2xl w-12 h-12 hover:scale-105 transition-all shadow-lg"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] glassmorphism-dark text-white menu-slide transform translate-x-0 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-lg">Menu</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <Card className="glassmorphism mb-8 border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-white/30 shadow-lg">
                        <AvatarImage src={userData?.photoURL} />
                        <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold">
                          {getInitials(userData?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{userData?.fullName || 'Utilisateur'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isPremium ? (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs font-bold">
                              <Crown className="w-3 h-3 mr-1" />Premium
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs font-medium bg-white/20 text-white border-white/30">
                              Gratuit
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3 mb-8">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />Navigation
                  </h3>
                  {userNavItems.map((item) => (
                    <Link key={item.title} href={item.url}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start rounded-2xl p-4 font-semibold text-sm transition-all hover-lift ${
                          pathname === item.url
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                          pathname === item.url ? 'bg-white/20' : `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        {item.title}
                      </Button>
                    </Link>
                  ))}
                </div>

                {isAdmin && (
                  <div className="space-y-3 mb-8">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-4 h-4" />Administration
                    </h3>
                    {adminNavItems.map((item) => (
                      <Link key={item.title} href={item.url}>
                         <Button
                            variant="ghost"
                            className={`w-full justify-start rounded-2xl p-4 font-semibold text-sm transition-all hover-lift ${
                              pathname === item.url
                                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                              pathname === item.url ? 'bg-white/20' : `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                           }`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            {item.title}
                          </Button>
                      </Link>
                    ))}
                  </div>
                )}
                
                <div className="space-y-3 border-t border-white/20 pt-6">
                  {!isPremium && (
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-2xl p-4 shadow-lg">
                      <Crown className="w-5 h-5 mr-3" />Passer Premium
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <Link href="/dashboard/profile">
                    <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl p-4">
                      <UserIcon className="w-5 h-5 mr-4" />Mon Profil
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings">
                     <Button variant="ghost" className="w-full justify-start text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl p-4">
                       <Settings className="w-5 h-5 mr-4" />Paramètres
                     </Button>
                   </Link>
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl p-4" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-4" />Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1">
          {children}
        </main>
        
         {/* Bottom mobile navigation */}
         <div className="lg:hidden h-20"></div>
         <div className="lg:hidden fixed bottom-0 left-0 right-0 glassmorphism border-t border-white/20 z-30">
             <div className="grid grid-cols-5 gap-1 p-2">
                 {[...userNavItems].slice(0,5).map((item) => (
                     <Link key={item.title} href={item.url}>
                         <Button
                             variant="ghost"
                             className={`flex flex-col gap-1 h-auto py-3 px-1 rounded-2xl font-medium text-xs transition-all w-full ${
                                 pathname === item.url
                                     ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                                     : 'text-gray-600 hover:bg-white/60'
                             }`}
                         >
                             <item.icon className="w-5 h-5" />
                             <span className="text-[10px] font-semibold">{item.title}</span>
                         </Button>
                     </Link>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
}

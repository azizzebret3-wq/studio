
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, 
  BookOpen, 
  Users, 
  Zap, 
  Crown, 
  Play,
  CheckCircle,
  ArrowRight,
  Download,
  Star,
  Sparkles,
  Rocket,
  Target,
  Award,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);
  
  if (loading || !isClient || user) {
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

  const features = [
    {
      icon: Play,
      title: "Quiz Interactifs",
      description: "Des quiz chronométrés avec corrections détaillées et animations captivantes",
      color: "from-purple-500 via-pink-500 to-red-500",
      bgPattern: "from-purple-100 to-pink-100"
    },
    {
      icon: BookOpen,
      title: "Bibliothèque Riche",
      description: "PDF, vidéos HD et formations organisés par concours avec recherche avancée",
      color: "from-blue-500 via-cyan-500 to-teal-500",
      bgPattern: "from-blue-100 to-cyan-100"
    },
    {
      icon: Target,
      title: "Suivi Intelligent",
      description: "Tableau de bord avec IA pour analyser tes points forts et faiblesses",
      color: "from-orange-500 via-red-500 to-pink-500",
      bgPattern: "from-orange-100 to-red-100"
    },
    {
      icon: Users,
      title: "Communauté Active",
      description: "Rejoins des milliers de candidats motivés et échange avec des mentors",
      color: "from-green-500 via-emerald-500 to-teal-500",
      bgPattern: "from-green-100 to-emerald-100"
    }
  ];

  const testimonials = [
    {
      name: "Lauréat de la fonction publique",
      role: "Concours direct",
      text: "Grâce aux quiz interactifs et au suivi personnalisé, j'ai pu identifier mes lacunes et m'améliorer rapidement. Les animations rendent l'apprentissage amusant !",
      rating: 5,
      avatar: "https://picsum.photos/60/60?random=4"
    },
    {
      name: "Candidate",
      role: "Concours professionnel",
      text: "La qualité des contenus et l'interface moderne ont transformé ma préparation en expérience immersive. Les formations vidéo sont exceptionnelles !",
      rating: 5,
      avatar: "https://picsum.photos/60/60?random=5"
    },
    {
      name: "Étudiant",
      role: "Concours direct",
      text: "Le système de badges et de progression m'a motivée tout au long de ma préparation. J'ai gagné 40 points en moyenne !",
      rating: 5,
      avatar: "https://picsum.photos/60/60?random=6"
    }
  ];

  const stats = [
    { label: "Candidats Motivés", icon: Users },
    { label: "Taux de Réussite Élevé", icon: Trophy },
    { label: "Centaines de Quiz", icon: Play },
    { label: "Formations Vidéo", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      <style>
        {`
          .hero-animation {
            animation: float 4s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          .pulse-ring {
            animation: pulse-ring 2s infinite;
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(0.33); }
            40%, 50% { opacity: 0; }
            100% { opacity: 0; transform: scale(1.2); }
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .card-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-12px) scale(1.02);
          }
          
          .glassmorphism {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
          
          .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          
          .background-dots {
            background-image: radial-gradient(circle, rgba(139, 92, 246, 0.15) 1px, transparent 1px);
            background-size: 20px 20px;
          }
        `}
      </style>

      {/* Hero Section Améliorée */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white py-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 background-dots opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl hero-animation">
                <Trophy className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-50 pulse-ring"></div>
            </div>
            <Badge className="glassmorphism text-white border-white/30 px-6 py-2 text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Plateforme éducative #1 au Burkina Faso
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-shadow leading-tight">
            <span className="gradient-text bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Gagne ton concours
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            🚀 La plateforme la plus moderne et interactive pour réussir tes concours directs et professionnels
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-white to-gray-100 text-indigo-600 hover:from-gray-100 hover:to-white font-bold px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg group"
              asChild
            >
              <Link href="/signup">
                <Rocket className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="glassmorphism border-white/40 text-white hover:bg-white/20 font-bold px-10 py-6 rounded-2xl text-lg backdrop-blur-md"
              asChild
            >
              <Link href="/login">
                <Play className="w-6 h-6 mr-3" />
                Voir la démo
              </Link>
            </Button>
          </div>

          {/* Stats en hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="glassmorphism rounded-2xl p-6 text-center backdrop-blur-lg">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
                <div className="text-lg font-bold text-white">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section Ultra-Améliorée */}
      <section className="py-24 px-4 bg-gradient-to-b from-white via-purple-50/30 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Fonctionnalités Premium
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 gradient-text">
              Tout pour dominer tes concours
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Des outils révolutionnaires avec intelligence artificielle pour une préparation sur mesure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-2xl card-hover group overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgPattern} opacity-50`}></div>
                <CardContent className="p-8 text-center relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <feature.icon className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                    {feature.description}
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section Premium */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 background-dots opacity-20"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold mb-6 shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            Plans & Tarifs
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 gradient-text">
            Choisis ton niveau de réussite
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Commence gratuitement puis débloque ton plein potentiel avec Premium
          </p>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Plan Gratuit Amélioré */}
            <Card className="border-2 border-gray-200 shadow-2xl card-hover relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <CardContent className="p-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Découverte</h3>
                  <div className="text-5xl font-black text-gray-900 mb-2">
                    0 <span className="text-xl text-gray-500 font-medium">FCFA</span>
                  </div>
                  <p className="text-gray-500 font-medium">Pour commencer</p>
                </div>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">5 quiz d'essai par jour</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">PDF de base inclus</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Suivi de progression simple</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Accès communauté</span>
                  </li>
                </ul>
                
                <Button asChild className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-lg">
                  <Link href="/signup">Commencer maintenant</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plan Premium Ultra-Amélioré */}
            <Card className="border-2 border-yellow-400 shadow-2xl card-hover relative overflow-hidden bg-gradient-to-b from-yellow-50 to-orange-50">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-xl text-sm">
                  <Crown className="w-5 h-5 mr-2" />
                  LE PLUS POPULAIRE
                </Badge>
              </div>
              
              <CardContent className="p-10 pt-14">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Premium</h3>
                  <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    5000 <span className="text-xl text-gray-500 font-medium">FCFA/an</span>
                  </div>
                  <p className="text-gray-500 font-medium">Succès garanti</p>
                </div>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Quiz illimités + corrections IA</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Bibliothèque complète + nouveautés</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Formations vidéo HD exclusives</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Analytics avancés + prédictions</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Support prioritaire 24/7</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Garantie réussite ou remboursé</span>
                  </li>
                </ul>
                
                <Button asChild className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-2xl text-white">
                   <Link href="/signup">
                    <Rocket className="w-5 h-5 mr-2" />
                    Débloquer Premium
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Premium */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold mb-6 shadow-lg">
            <Award className="w-4 h-4 mr-2" />
            Témoignages
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 gradient-text">
            Ils ont réussi avec nous
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Plus de 10,000 étudiants nous font confiance et obtiennent des résultats exceptionnels
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-2xl card-hover group overflow-hidden">
                <CardContent className="p-8 relative">
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      data-ai-hint="person"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100 shadow-lg"
                    />
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-sm text-purple-600 font-semibold">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 italic leading-relaxed font-medium">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Ultimate */}
      <section className="py-24 px-4 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 background-dots opacity-20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl hero-animation">
            <Rocket className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-shadow">
            Prêt à transformer ta réussite ?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Rejoins la révolution éducative et fais partie des milliers d'étudiants qui dominent leurs concours
          </p>
          
           <Button 
              size="lg" 
              className="bg-gradient-to-r from-white to-gray-100 text-indigo-600 hover:from-gray-100 hover:to-white font-bold px-12 py-6 rounded-2xl shadow-2xl text-xl group"
              asChild
            >
              <Link href="/signup">
                <TrendingUp className="w-6 h-6 mr-3 group-hover:scale-125 transition-transform" />
                Démarrer mon succès maintenant
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          
          <p className="mt-8 text-blue-200 font-medium">
            ✨ Aucune carte de crédit requise • Résultats garantis en 30 jours
          </p>
        </div>
      </section>

      {/* Footer Premium */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
             <div className="inline-block mb-6">
                <Logo />
             </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              La plateforme éducative de nouvelle génération qui révolutionne la préparation aux concours au Burkina Faso
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 mb-12 text-center md:text-left">
            <div>
              <h3 className="font-bold text-white mb-4">Plateforme</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Témoignages</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Centre d'aide</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Concours</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Concours Direct</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Fonction Publique</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Préparations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conditions</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-400">
              © 2025 Gagne ton concours. Développe par Abdoul Aziz. ✨
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

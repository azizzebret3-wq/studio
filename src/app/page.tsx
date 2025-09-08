
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BookOpen, Video, ClipboardList, Crown, ArrowRight, Rocket, Users, Trophy } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <style>
        {`
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hero-animation {
            animation: float 4s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>

      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between z-10">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg">
            <Link href="/signup">S'inscrire</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/50 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
             <div className="inline-block hero-animation mb-8">
               <Trophy className="w-20 h-20 text-purple-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter gradient-text">
              Réussissez vos concours, haut la main.
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 font-medium">
              La plateforme n°1 au Burkina Faso pour préparer efficacement les concours directs et professionnels. Quiz, PDF, vidéos, et formations à portée de clic.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg rounded-xl px-8 py-6 text-base group">
                <Link href="/signup">
                  Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 gradient-text">Une préparation complète et sur-mesure</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Accédez à une mine de ressources organisées par type de concours pour une révision ciblée et efficiente.
              </p>
            </div>
            <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<ClipboardList className="h-8 w-8 text-purple-600" />}
                title="Quiz Dynamiques"
                description="Testez vos connaissances avec des milliers de questions, un chronomètre et un suivi de vos scores."
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-blue-600" />}
                title="Bibliothèque de PDF"
                description="Consultez des cours, annales et fiches de révision essentiels, disponibles à tout moment."
              />
              <FeatureCard
                icon={<Video className="h-8 w-8 text-pink-600" />}
                title="Vidéos Explicatives"
                description="Approfondissez des notions complexes grâce à notre collection de vidéos pédagogiques."
              />
              <FeatureCard
                icon={<Crown className="h-8 w-8 text-yellow-600" />}
                title="Formations Complètes"
                description="Suivez des parcours de formation structurés pour maîtriser l'intégralité du programme."
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-center gradient-text">Choisissez votre plan</h2>
            <div className="mt-16 flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
              <PricingCard
                title="Gratuit"
                price="0 FCFA"
                period="/ an"
                features={[
                  "Accès limité aux contenus",
                  "Quiz de démonstration",
                  "Suivi de progression de base",
                ]}
                ctaText="S'inscrire gratuitement"
                href="/signup"
              />
              <PricingCard
                title="Premium"
                price="5000 FCFA"
                period="/ an"
                features={[
                  "Accès illimité à tous les contenus",
                  "Quiz, PDF, Vidéos, Formations",
                  "Génération de quiz personnalisés",
                  "Support prioritaire",
                ]}
                ctaText="Passer Premium"
                href="/signup"
                isFeatured
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo />
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Gagne ton concours. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center p-6 bg-white rounded-2xl shadow-lg transition-transform transform hover:-translate-y-2">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-100/70 mx-auto mb-6">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-800">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, period, features, ctaText, href, isFeatured = false }: { title: string, price: string, period: string, features: string[], ctaText: string, href: string, isFeatured?: boolean }) {
  return (
    <Card className={`w-full flex flex-col rounded-2xl shadow-xl transition-shadow hover:shadow-2xl ${isFeatured ? 'border-2 border-purple-500 bg-purple-50/20' : 'bg-white'}`}>
      {isFeatured && (
         <div className="py-2 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold text-center rounded-t-2xl">
            Le plus populaire
        </div>
      )}
      <CardHeader className="text-center pt-8">
        <CardTitle className={`text-2xl font-bold ${isFeatured ? 'text-purple-700' : 'text-gray-800'}`}>{title}</CardTitle>
        <p className="mt-2">
          <span className="text-5xl font-black text-gray-900">{price}</span>
          <span className="text-gray-500 font-medium">{period}</span>
        </p>
      </CardHeader>
      <CardContent className="flex-grow px-8">
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-8 pt-0">
        <Button asChild size="lg" className={`w-full font-bold rounded-xl text-base ${isFeatured ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg' : 'bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50'}`}>
          <Link href={href}>{ctaText}</Link>
        </Button>
      </div>
    </Card>
  )
}

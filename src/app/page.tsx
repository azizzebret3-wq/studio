import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BookOpen, Video, ClipboardList, Crown, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">S'inscrire</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-primary">
              Réussissez vos concours, haut la main.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
              La plateforme n°1 au Burkina Faso pour préparer efficacement les concours directs et professionnels. Quiz, PDF, vidéos, et formations à portée de clic.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center font-headline">Une préparation complète et sur-mesure</h2>
            <p className="mt-2 text-center text-foreground/70 max-w-xl mx-auto">
              Accédez à une mine de ressources organisées par type de concours pour une révision ciblée et efficiente.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<ClipboardList className="h-8 w-8 text-primary" />}
                title="Quiz Dynamiques"
                description="Testez vos connaissances avec des milliers de questions, un chronomètre et un suivi de vos scores."
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-primary" />}
                title="Bibliothèque de PDF"
                description="Consultez des cours, annales et fiches de révision essentiels, disponibles à tout moment."
              />
              <FeatureCard
                icon={<Video className="h-8 w-8 text-primary" />}
                title="Vidéos Explicatives"
                description="Approfondissez des notions complexes grâce à notre collection de vidéos pédagogiques."
              />
              <FeatureCard
                icon={<Crown className="h-8 w-8 text-primary" />}
                title="Formations Complètes"
                description="Suivez des parcours de formation structurés pour maîtriser l'intégralité du programme."
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center font-headline">Choisissez votre plan</h2>
            <div className="mt-12 flex flex-col lg:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
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

      <footer className="bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo />
          <p className="text-sm text-foreground/60">&copy; {new Date().getFullYear()} Gagne ton concours. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold font-headline">{title}</h3>
      <p className="mt-1 text-foreground/70">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, period, features, ctaText, href, isFeatured = false }: { title: string, price: string, period: string, features: string[], ctaText: string, href: string, isFeatured?: boolean }) {
  return (
    <Card className={`w-full flex flex-col ${isFeatured ? 'border-primary scale-105 shadow-xl' : ''}`}>
      <CardHeader className="text-center">
        <CardTitle className={`text-2xl font-headline ${isFeatured ? 'text-primary' : ''}`}>{title}</CardTitle>
        <p className="mt-2">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-foreground/70">{period}</span>
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full" variant={isFeatured ? 'default' : 'outline'}>
          <Link href={href}>{ctaText}</Link>
        </Button>
      </div>
    </Card>
  )
}

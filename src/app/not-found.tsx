import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold font-headline tracking-tight">Page non trouvée</h2>
      <p className="mt-2 text-lg text-foreground/70">
        Désolé, nous n'avons pas pu trouver la page que vous recherchez.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}

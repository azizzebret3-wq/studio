
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50">
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200/50 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="relative z-10">
        <h1 className="text-9xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">404</h1>
        <h2 className="mt-4 text-4xl font-bold text-gray-800 tracking-tight">Page non trouvée</h2>
        <p className="mt-4 text-lg text-gray-600 font-medium max-w-md mx-auto">
          Désolé, la page que vous recherchez semble s'être égarée dans le monde numérique.
        </p>
        <Button asChild size="lg" className="mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg rounded-xl px-8">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  )
}

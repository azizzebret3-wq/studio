
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gray-50">
       <style>
        {`
          body {
            background-color: #F9FAFB;
          }
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>
      <div className="relative z-10">
        <h1 className="text-9xl font-black gradient-text">404</h1>
        <h2 className="mt-4 text-4xl font-bold text-gray-800 tracking-tight">Page non trouvée</h2>
        <p className="mt-4 text-lg text-gray-600 font-medium max-w-md mx-auto">
          Désolé, la page que vous recherchez semble s'être égarée.
        </p>
        <Button asChild size="lg" className="mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg rounded-xl px-8">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  )
}

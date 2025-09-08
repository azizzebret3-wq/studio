
"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Connexion réussie",
        description: "Vous allez être redirigé vers votre tableau de bord.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="rounded-2xl shadow-2xl border-0 bg-white/70 backdrop-blur-xl">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Heureux de vous revoir
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium pt-2">
              Connectez-vous pour reprendre votre préparation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form className="grid gap-6" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password"  className="font-semibold text-gray-700">Mot de passe</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg group" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm font-medium text-gray-600">
              Vous n'avez pas de compte?{" "}
              <Link href="/signup" className="text-purple-600 hover:text-purple-800 font-bold hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

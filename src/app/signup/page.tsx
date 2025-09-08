"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Logo } from "@/components/logo"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [competitionType, setCompetitionType] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!competitionType) {
      toast({
        variant: "destructive",
        title: "Champ manquant",
        description: "Veuillez sélectionner un type de concours.",
      });
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone,
        competitionType,
        createdAt: new Date(),
      });
      
      toast({
        title: "Compte créé avec succès",
        description: "Vous allez être redirigé vers votre tableau de bord.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Une erreur est survenue lors de la création du compte.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cette adresse e-mail est déjà utilisée."
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères."
      }
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Créer un compte</CardTitle>
            <CardDescription>
              Entrez vos informations pour commencer votre préparation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSignup}>
              <div className="grid gap-2">
                <Label htmlFor="full-name">Nom & Prénom(s)</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+226 XX XX XX XX" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="competition-type">Type de concours</Label>
                <Select required onValueChange={setCompetitionType} value={competitionType}>
                  <SelectTrigger id="competition-type">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Concours Direct</SelectItem>
                    <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création en cours..." : "Créer le compte"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Page() {
  const router = useRouter();
  const { signIn } = useAuth();
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | boolean>(false);
  const [passwordError, setPasswordError] = useState<string | boolean>(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let ok = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Email invalide");
      ok = false;
    } else {
      setEmailError(false);
    }
    if (!password || password.length < 6) {
      setPasswordError("Mot de passe trop court");
      ok = false;
    } else {
      setPasswordError(false);
    }
    if (!ok) return;

    const res = await signIn({ email, password });
    if (res?.access_token) router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen w-full grid place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border p-6 bg-background shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Connexion</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="exemple@domaine.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            error={emailError}
            clearable
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            error={passwordError}
          />
          <Button type="submit" fullWidth isLoading={loading}>
            Se connecter
          </Button>
        </form>
        {/* <div className="mt-4 text-sm text-muted-foreground">
          <span>Pas de compte ? </span>
          <Link href="/auth/register" className="text-primary underline">
            Créer un compte
          </Link>
        </div> */}
        <div className="mt-2 text-sm">
          <Link href="/auth/forgot" className="text-primary underline">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </div>
  );
}

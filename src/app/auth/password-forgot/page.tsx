"use client";

import { useState } from "react";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useAuthStore } from "@/store/authStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Phase = "request" | "verify" | "reset";

export default function Page() {
  const { requestCode, verifyCode, submitNewPassword } = usePasswordReset();
  const loading = useAuthStore((s) => s.loading);

  const [phase, setPhase] = useState<Phase>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  const [emailError, setEmailError] = useState<string | boolean>(false);
  const [codeError, setCodeError] = useState<string | boolean>(false);
  const [pwd1Error, setPwd1Error] = useState<string | boolean>(false);
  const [pwd2Error, setPwd2Error] = useState<string | boolean>(false);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^\S+@\S+\.\S+$/.test(email);
    setEmailError(ok ? false : "Email invalide");
    if (!ok) return;
    await requestCode({ email });
    setPhase("verify");
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = !!code && code.trim().length === 6;
    setCodeError(ok ? false : "Code invalide");
    if (!ok) return;
    await verifyCode({ email, code });
    setPhase("reset");
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = pwd1 && pwd1.length >= 6;
    const b = pwd2 && pwd2 === pwd1;
    setPwd1Error(a ? false : "6 caractères minimum");
    setPwd2Error(b ? false : "Les mots de passe ne correspondent pas");
    if (!(a && b)) return;
    await submitNewPassword({ email, code, new_password: pwd1, confirm_password: pwd2 });
    setPhase("request");
    setEmail("");
    setCode("");
    setPwd1("");
    setPwd2("");
  };

  return (
    <div className="min-h-screen w-full grid place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border p-6 bg-background shadow-sm">
        {phase === "request" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight mb-6">Mot de passe oublié</h1>
            <form onSubmit={onRequest} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                error={emailError}
                clearable
              />
              <Button type="submit" fullWidth isLoading={loading}>
                Recevoir le code
              </Button>
            </form>
          </>
        )}

        {phase === "verify" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight mb-6">Vérification</h1>
            <form onSubmit={onVerify} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                disabled
              />
              <Input
                label="Code reçu par email"
                type="text"
                placeholder="XXXXXX"
                value={code}
                onChange={(e) => setCode((e.target as HTMLInputElement).value)}
                error={codeError}
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setPhase("request")} disabled={loading} className="w-1/3">
                  Retour
                </Button>
                <Button type="submit" className="w-2/3" isLoading={loading}>
                  Vérifier le code
                </Button>
              </div>
            </form>
          </>
        )}

        {phase === "reset" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight mb-6">Nouveau mot de passe</h1>
            <form onSubmit={onReset} className="space-y-4">
              <Input label="Email" type="email" value={email} disabled />
              <Input label="Code" type="text" value={code} disabled />
              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="******"
                value={pwd1}
                onChange={(e) => setPwd1((e.target as HTMLInputElement).value)}
                error={pwd1Error}
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="******"
                value={pwd2}
                onChange={(e) => setPwd2((e.target as HTMLInputElement).value)}
                error={pwd2Error}
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setPhase("verify")} disabled={loading} className="w-1/3">
                  Retour
                </Button>
                <Button type="submit" className="w-2/3" isLoading={loading}>
                  Mettre à jour
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

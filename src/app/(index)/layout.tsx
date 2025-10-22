// src/app/(index)/layout.tsx
"use client";

import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Footer from "@/components/ui/Footer"; // Import du Footer
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const { fetchMe } = useAuth();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (!user) {
      fetchMe().catch(() => {
        router.push("/auth/login");
      });
    }
  }, [token, user, fetchMe, router]);

  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex flex-1">
        <Sidebar collapsedExternal={collapsed} />
        <main className="flex-1 p-0 md:ml-0 md:p-0">{children}</main>
      </div>
      <Footer />  
    </div>
  );
}
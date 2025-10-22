"use client";

import { Menu, LogOut, User, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./Button";
import Badge from "./Badge";

export default function Header({ onToggle }: { onToggle?: () => void }) {
    const [open, setOpen] = useState(false);
    const [greeting, setGreeting] = useState("");
    const user = useAuthStore((s) => s.user);
    const { signOut } = useAuth();

    // Fonction pour déterminer la salutation en fonction de l'heure
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bonjour";
        if (hour >= 12 && hour < 18) return "Bon après-midi";
        return "Bonsoir";
    };

    useEffect(() => {
        setGreeting(getGreeting());

        // Mettre à jour la salutation toutes les heures
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 3600000); // 1 heure

        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        signOut();
        window.location.href = "/auth/login";
    };

    // Déterminer le statut de l'utilisateur basé sur les propriétés disponibles
    const getUserStatus = () => {
        if (!user) return { label: "Invité", tone: "slate" as const };

        // Utiliser is_verified pour déterminer un statut "vérifié"
        if (user.is_verified) {
            return { label: "Vérifié", tone: "green" as const };
        }

        // Utiliser is_active pour déterminer le statut
        if (user.is_active) {
            return { label: "Actif", tone: "blue" as const };
        }

        return { label: "Inactif", tone: "slate" as const };
    };

    const userStatus = getUserStatus();

    return (
        <header className="sticky top-0 z-50 h-16 border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm">
            <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
                {/* Section gauche */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setOpen(!open);
                            onToggle?.();
                        }}
                        className="md:hidden h-9 w-9 p-0"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>

                    <Link href="/" className="flex items-center gap-2 sm:gap-3 ">
                        <div className="relative">
                            <Image
                                src="/images/logo.png"
                                alt="OncoGuard Logo"
                                width={180}
                                height={64}
                                className="h-12 sm:h-14 md:h-16 w-auto"
                                priority
                            />
                        </div>
                         
                    </Link>
                </div>

                {/* Section droite */}
                <div className="flex items-center gap-4">
                    {/* Informations utilisateur - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Salutation et informations utilisateur */}
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">{greeting},</span>
                                <span className="text-blue-600 font-semibold max-w-[150px] truncate">
                                    {user?.full_name || user?.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge tone={userStatus.tone}>
                                    {userStatus.label}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {new Date().toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar utilisateur */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>

                    {/* Informations utilisateur - Mobile */}
                    <div className="md:hidden flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">
                                {greeting} !
                            </span>
                            <Badge tone={userStatus.tone}>
                                {userStatus.label}
                            </Badge>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                    </div>

                    {/* Bouton de déconnexion */}
                    <Button
                        variant="outline"
                        color=""
                        size="sm"
                        onClick={handleLogout}
                        iconLeft={<LogOut className="h-4 w-4" />}
                        className="hover:bg-red-50 transition-colors"
                    >
                        <span className="hidden sm:inline">Déconnexion</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
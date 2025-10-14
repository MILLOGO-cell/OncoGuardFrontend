"use client";

import { Heart, Shield, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-screen-2xl px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Section gauche - Copyright et informations */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>OncoGuard • Système de gestion oncologique</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>© {currentYear} Tous droits réservés</span>
              <span>•</span>
              <span>Développé avec</span>
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
              <span>pour la médecine</span>
            </div>
          </div>

          {/* Section droite - Contact et liens */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <Link 
              href="mailto:nicolasmillogo3@gmail.com"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>nicolasmillogo3@gmail.com</span>
            </Link>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Confidentialité
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Conditions d'utilisation
              </Link>
              <span>•</span>
              <Link href="/help" className="hover:text-blue-600 transition-colors">
                Aide
              </Link>
            </div>
          </div>
        </div>

        {/* Version mobile compacte */}
        <div className="mt-4 pt-4 border-t border-gray-100 md:hidden">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>OncoGuard © {currentYear}</span>
            </div>
            <Link 
              href="mailto:nicolasmillogo3@gmail.com"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Mail className="h-3 w-3" />
              <span>Contact</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
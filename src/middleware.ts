// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Mets ici le(s) nom(s) de cookie(s) que TON backend pose réellement
const AUTH_COOKIES = [
  "og_session",                  // <- recommande : session HttpOnly posée par ton backend
  "access_token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "session",
];

const LOGIN_PATH = "/auth/login";
const DASHBOARD_HOME = "/dashboard";

// Pages d'auth publiques
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot",
  "/auth/mfa",
];

function isAuthenticated(req: NextRequest): boolean {
  return AUTH_COOKIES.some((k) => !!req.cookies.get(k)?.value);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();
  const authed = isAuthenticated(req);

  // (A) Rediriger "/" -> /auth/login
  if (pathname === "/") {
    url.pathname = LOGIN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // (B) Si déjà connecté, empêcher d'aller sur les pages d'auth -> /dashboard
  if (pathname.startsWith("/auth") && PUBLIC_AUTH_PATHS.includes(pathname) && authed) {
    url.pathname = DASHBOARD_HOME;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // (C) IMPORTANT: On NE protège PAS /dashboard côté middleware
  // Laisse un guard client (HOC/useEffect) gérer la redirection si non auth.
  // => évite les boucles quand le cookie n'est pas encore visible côté edge.

  // (D) Sinon: laisser passer
  return NextResponse.next();
}

// Exclure _next, fichiers statiques et /api
export const config = {
  matcher: ["/((?!_next|.*\\..*|api).*)"],
};

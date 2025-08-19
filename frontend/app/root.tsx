import { useState, useEffect } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation, // ⬅️ añade esto
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import Keycloak from "keycloak-js";
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";

const keycloak = new Keycloak({
  url: `${import.meta.env.VITE_KEYCLOAK_URL}/`,
  realm: import.meta.env.VITE_KEYCLOAK_REALM!,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID!,
});

// (Opcional) evita usar window en SSR
const silentSSO =
  typeof window !== "undefined"
    ? `${window.location.origin}/silent-check-sso.html`
    : undefined;

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href:
      "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/* ---------- Auth gate que protege TODAS las rutas ---------- */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Marca cuando estamos en cliente
  useEffect(() => setMounted(true), []);

  // Dispara el login solo en cliente y cuando Keycloak ya inicializó
  useEffect(() => {
    if (!mounted) return;
    if (initialized && !keycloak.authenticated) {
      const redirectUri =
        window.location.origin + location.pathname + location.search;
      keycloak.login({ redirectUri });
    }
  }, [mounted, initialized, keycloak.authenticated, location]);

  if (!mounted || !initialized) return <div>Loading auth…</div>;
  if (!keycloak.authenticated) return <div>Redirecting to login…</div>;

  return <>{children}</>;
}

export default function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        ...(silentSSO && { silentCheckSsoRedirectUri: silentSSO }),
      }}
      onEvent={(event, error) => {
        // Útil para ver el ciclo de vida: onAuthSuccess, onTokenExpired, onAuthRefreshSuccess, etc.
        // if (import.meta.env.DEV) console.log('KC event:', event, error);
        console.log('Keycloak event:', event, error);
      }}
      onTokens={({ token, idToken, refreshToken }) => {
        if (import.meta.env.DEV) {
          console.log('KC tokens:', { token, idToken, refreshToken });
        }
        // (Opcional) Persistencia temporal en sessionStorage:
        if (token) sessionStorage.setItem('kc_token', token);
        if (refreshToken) sessionStorage.setItem('kc_refreshToken', refreshToken);
        if (idToken) sessionStorage.setItem('kc_idToken', idToken);
      }}
    >
      <AuthGate>
        <Outlet />
      </AuthGate>
    </ReactKeycloakProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
import { useState, useEffect } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import Keycloak from "keycloak-js";
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";

// --- Configuración de Keycloak ---
const keycloak = new Keycloak({
  url: `${import.meta.env.VITE_KEYCLOAK_URL}/`,
  realm: import.meta.env.VITE_KEYCLOAK_REALM!,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID!,
});

const silentSSO =
  typeof window !== "undefined"
    ? `${window.location.origin}/silent-check-sso.html`
    : undefined;

// --- Estilos y Fuentes ---
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];

// --- Layout HTML Principal ---
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full bg-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* --- CORRECCIÓN FINAL DE CSP --- */}
        {/* Se añade http://localhost:3000 a connect-src para permitir las llamadas a la API local */}
        <meta httpEquiv="Content-Security-Policy" content="
            default-src 'self'; 
            script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
            font-src 'self' https://fonts.gstatic.com; 
            img-src 'self' data: https://tailwindui.com;
            connect-src 'self' https://687297cae795.ngrok-free.app http://localhost:3000;
            frame-src 'self' https://687297cae795.ngrok-free.app;
        " />

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

// --- Componente de Redirección (Client-Side) ---
function LoginTrigger() {
  const { keycloak } = useKeycloak();
  const location = useLocation();

  useEffect(() => {
    const redirectUri = window.location.origin + location.pathname + location.search;
    keycloak.login({ redirectUri });
  }, [keycloak, location]);

  return <div>Redirigiendo al login…</div>;
}

// --- Componente de Guardia de Autenticación (SSR-Safe) ---
function AuthGate({ children }: { children: React.ReactNode }) {
  const { keycloak, initialized } = useKeycloak();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !initialized) {
    return <div>Cargando autenticación…</div>;
  }

  if (keycloak.authenticated) {
    return <>{children}</>;
  }

  return <LoginTrigger />;
}

// --- Componente Principal de la App ---
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
    >
      <AuthGate>
        <Outlet />
      </AuthGate>
    </ReactKeycloakProvider>
  );
}

// --- Manejo de Errores (Client-Side Safe) ---
export function ErrorBoundary() {
  const error = useRouteError();
  const [clientError, setClientError] = useState<any>(null);

  useEffect(() => {
    setClientError(error);
  }, [error]);

  let message = "¡Ups!";
  let details = "Ocurrió un error inesperado.";
  let stack: string | undefined;

  if (clientError) {
    if (isRouteErrorResponse(clientError)) {
      message = clientError.status === 404 ? "Página no encontrada (404)" : "Error de Ruta";
      details = (clientError.data as any)?.message || clientError.statusText;
    } else if (import.meta.env.DEV && clientError instanceof Error) {
      details = clientError.message;
      stack = clientError.stack;
    }
  }

  return (
    <Layout>
        <main className="pt-16 p-4 container mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600">{message}</h1>
            <p className="mt-2 text-gray-700">{details}</p>
            {stack && (
                <pre className="mt-4 w-full p-4 overflow-x-auto bg-gray-100 text-left text-sm rounded-md">
                <code>{stack}</code>
                </pre>
            )}
        </main>
    </Layout>
  );
}

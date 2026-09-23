"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Componente que garante que a barra de endereços do navegador exiba
 * permanentemente a URL raiz "https://motos-orpin.vercel.app/"
 * sem expor subpastas ou rotas internas (/login, /dashboard, etc.).
 */
export function UrlMasker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Salva a rota ativa internamente para restauração rápida em caso de F5/Reload
      if (pathname && pathname !== "/" && pathname !== "/login") {
        try {
          sessionStorage.setItem("motoshop_last_route", pathname);
        } catch (e) {
          // ignore
        }
      }
      if (window.location.pathname !== "/") {
        try {
          window.history.replaceState(null, "", "/");
        } catch (e) {
          // Fallback silencioso caso ocorra restrição de segurança
        }
      }
    }
  }, [pathname]);

  return null;
}

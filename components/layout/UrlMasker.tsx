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
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      try {
        window.history.replaceState(null, "", "/");
      } catch (e) {
        // Fallback silencioso caso ocorra restrição de segurança
      }
    }
  }, [pathname]);

  return null;
}

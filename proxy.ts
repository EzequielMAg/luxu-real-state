import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy para proteger las rutas del dashboard administrativo.
 * - Si el usuario no está autenticado → redirect a /login
 * - Si el usuario no tiene rol 'admin' → redirect a / (acceso denegado)
 * - Si es admin → continúa normalmente
 *
 * NOTA: En Next.js v16+ el archivo se llama proxy.ts y la función es `proxy()`.
 * El archivo middleware.ts está deprecado.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refrescar sesión automáticamente si el token expiró
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión → redirect al login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar rol admin desde raw_app_meta_data (campo del JWT, seguro)
  const appRole = user.app_metadata?.app_role;

  if (appRole !== "admin") {
    // Usuario autenticado pero sin permisos de admin → redirect a inicio
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

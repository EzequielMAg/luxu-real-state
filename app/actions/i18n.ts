"use server";

import { cookies } from "next/headers";
import { Locale, hasLocale, defaultLocale } from "../dictionaries";

export async function setLocaleAction(locale: string): Promise<Locale> {
  const targetLocale: Locale = hasLocale(locale) ? locale : defaultLocale;
  const cookieStore = await cookies();
  
  cookieStore.set("NEXT_LOCALE", targetLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 año de duración
    sameSite: "lax",
  });

  return targetLocale;
}

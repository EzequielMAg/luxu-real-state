"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Locale, Dictionary, dictionaries, getDictionarySync } from "../dictionaries";
import { setLocaleAction } from "../actions/i18n";

interface I18nContextType {
  locale: Locale;
  t: Dictionary;
  changeLocale: (newLocale: Locale) => Promise<void>;
  isPending: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
  initialDictionary: Dictionary;
}

export function I18nProvider({
  children,
  initialLocale,
  initialDictionary,
}: I18nProviderProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [t, setT] = useState<Dictionary>(initialDictionary);
  const [isPending, startTransition] = useTransition();

  // Sincronizar si el servidor envía un nuevo dictionary/locale por router.refresh()
  useEffect(() => {
    setLocale(initialLocale);
    setT(initialDictionary);
  }, [initialLocale, initialDictionary]);

  const changeLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Actualizamos optimistamente en el cliente al instante
    const newDict = getDictionarySync(newLocale);
    setLocale(newLocale);
    setT(newDict);

    // Persistimos en cookie y refrescamos componentes de servidor
    startTransition(async () => {
      await setLocaleAction(newLocale);
      router.refresh();
    });
  };

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale, isPending }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation debe utilizarse dentro de un <I18nProvider>");
  }
  return context;
}

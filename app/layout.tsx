import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { getDictionary, hasLocale, defaultLocale, Locale } from "./dictionaries";
import { I18nProvider } from "./i18n/I18nProvider";
import ThemeInitializer from "./components/ThemeInitializer";

export const metadata: Metadata = {
  title: "LuxeEstate - Premium Real Estate Sanctuary",
  description: "Find your modern, premium, and minimal real estate sanctuary with LuxeEstate.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = hasLocale(localeCookie) ? localeCookie : defaultLocale;
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className="h-full antialiased overflow-x-hidden w-full"
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <ThemeInitializer />
        <I18nProvider initialLocale={locale} initialDictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

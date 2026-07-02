import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { getDictionary, hasLocale, defaultLocale, Locale } from "./dictionaries";
import { I18nProvider } from "./i18n/I18nProvider";

export const metadata: Metadata = {
  title: "LuxeEstate - Premium Real Estate Sanctuary",
  description: "Find your modern, premium, and minimal real estate sanctuary with LuxeEstate.",
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider initialLocale={locale} initialDictionary={dictionary}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}


"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import { Locale } from "../dictionaries";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

function FlagIcon({ code }: { code: Locale }) {
  if (code === "es") {
    return (
      <svg className="w-4 h-3 rounded-[2px] shadow-sm overflow-hidden flex-shrink-0 border border-black/10" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#c60b1e" />
        <rect width="600" height="200" y="100" fill="#ffc400" />
      </svg>
    );
  }
  if (code === "fr") {
    return (
      <svg className="w-4 h-3 rounded-[2px] shadow-sm overflow-hidden flex-shrink-0 border border-black/10" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="2" fill="#002654" />
        <rect width="1" height="2" x="1" fill="#ffffff" />
        <rect width="1" height="2" x="2" fill="#ce1126" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-3 rounded-[2px] shadow-sm overflow-hidden flex-shrink-0 border border-black/10" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      <clipPath id="uk">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export default function LanguageSelector() {
  const { locale, changeLocale, isPending } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((lang) => lang.code === locale) || languages[0];

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (langCode: Locale) => {
    setIsOpen(false);
    await changeLocale(langCode);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-nordic-dark/10 hover:border-nordic-dark/30 bg-white/50 dark:bg-nordic-dark/40 text-nordic-dark text-xs font-medium transition-all hover:shadow-sm cursor-pointer disabled:opacity-50"
        title="Seleccionar idioma / Select language"
      >
        <FlagIcon code={currentLang.code} />
        <span className="uppercase font-bold tracking-wider text-xs">{currentLang.code}</span>
        <span className={`material-icons text-sm transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-[#1a1c1e] shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="py-1.5">
            {languages.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-mosque/10 text-mosque font-semibold"
                      : "text-nordic-dark/80 hover:bg-nordic-dark/5 dark:hover:bg-white/5 hover:text-nordic-dark"
                  }`}
                >
                  <FlagIcon code={lang.code} />
                  <span className="flex-1 font-medium">{lang.label}</span>
                  {isSelected && (
                    <span className="material-icons text-mosque text-sm">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

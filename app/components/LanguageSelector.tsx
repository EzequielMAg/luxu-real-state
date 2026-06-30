"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import { Locale } from "../dictionaries";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-nordic-dark/10 hover:border-nordic-dark/30 bg-white/50 dark:bg-nordic-dark/40 text-nordic-dark text-xs font-medium transition-all hover:shadow-sm cursor-pointer disabled:opacity-50"
        title="Seleccionar idioma / Select language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="uppercase font-semibold tracking-wider">{currentLang.code}</span>
        <span className={`material-icons text-sm transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-white dark:bg-[#1a1c1e] shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="py-1">
            {languages.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-mosque/10 text-mosque font-semibold"
                      : "text-nordic-dark/80 hover:bg-nordic-dark/5 dark:hover:bg-white/5 hover:text-nordic-dark"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
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

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../i18n/I18nProvider";
import LanguageSelector from "./LanguageSelector";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
  };

  // Al montar, leemos la preferencia del localStorage o del sistema
  useEffect(() => {
    setMounted(true);
    const localTheme = localStorage.getItem("theme");
    const isDark =
      localTheme === "dark" ||
      (!localTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Sincronizamos la clase "dark" en el html y body cada vez que el tema cambia
  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">LuxeEstate</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="#">
              {t.nav.buy}
            </a>
            <a
              className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
              href="#"
            >
              {t.nav.rent}
            </a>
            <a
              className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
              href="#"
            >
              {t.nav.newProjects}
            </a>
            <a
              className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
              href="#"
            >
              {t.nav.saved}
            </a>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button className="text-nordic-dark hover:text-mosque transition-colors" title="Buscar / Search">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative" title="Notificaciones / Notifications">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="text-nordic-dark hover:text-mosque transition-colors flex items-center justify-center p-1.5 rounded-lg hover:bg-nordic-dark/5 transition-all active:scale-90"
              title="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <span className="material-icons">light_mode</span>
                ) : (
                  <span className="material-icons">dark_mode</span>
                )
              ) : (
                <span className="material-icons opacity-0">dark_mode</span>
              )}
            </button>

            {/* Language Selector */}
            <div className="flex items-center">
              <LanguageSelector />
            </div>

            {/* Profile / Auth */}
            <div className="flex items-center pl-2 sm:pl-3 border-l border-nordic-dark/10 relative">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 cursor-pointer focus:outline-none"
                    title={user.email || "Profile"}
                  >
                    <div className="w-9 h-9 rounded-full bg-nordic-dark/10 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all relative flex items-center justify-center">
                      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                        <Image
                          alt="Profile"
                          className="w-full h-full object-cover"
                          src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                          width={36}
                          height={36}
                        />
                      ) : (
                        <span className="material-icons text-nordic-dark/70 text-lg">person</span>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card-bg dark:bg-[#152e2a] rounded-xl shadow-soft border border-nordic-dark/10 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-nordic-dark/10">
                        <p className="text-xs font-medium text-nordic-dark/60 dark:text-gray-400">
                          {(t as any).nav?.signedInAs || "Signed in as"}
                        </p>
                        <p className="text-sm font-semibold text-nordic-dark dark:text-white truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-nordic-dark/5 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="material-icons text-base">logout</span>
                        {(t as any).nav?.signOut || "Sign Out"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-all shadow-sm"
                >
                  {(t as any).nav?.signIn || "Sign In"}
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-nordic-dark hover:text-mosque transition-colors"
            >
              <span className="material-icons">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-56" : "max-h-0"
          }`}
      >
        <div className="px-4 py-2 space-y-1">
          <a className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10" href="#">
            {t.nav.buy}
          </a>
          <a
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-nordic-dark/5"
            href="#"
          >
            {t.nav.rent}
          </a>
          <a
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-nordic-dark/5"
            href="#"
          >
            {t.nav.newProjects}
          </a>
          <a
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-nordic-dark/5"
            href="#"
          >
            {t.nav.saved}
          </a>
        </div>
      </div>
    </nav>
  );
}

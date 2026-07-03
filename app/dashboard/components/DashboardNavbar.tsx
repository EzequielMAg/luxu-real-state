"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import LanguageSelector from "@/app/components/LanguageSelector";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard", label: "Listings", exact: true },
  { href: "/dashboard/users", label: "Users", exact: false },
  { href: "#", label: "Inquiries", exact: false },
];

export default function DashboardNavbar({ user }: { user: User }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const localTheme = localStorage.getItem("theme");
    const isDark =
      localTheme === "dark" ||
      (!localTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "dark" : "light");
  }, []);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (link: { href: string; label: string; exact: boolean }) => {
    if (link.label === "Users") return pathname.startsWith("/dashboard/users");
    if (link.label === "Dashboard") return pathname === "/dashboard";
    return false;
  };

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Admin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="bg-white dark:bg-[#0a1a17] border-b border-gray-200 dark:border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-mosque flex items-center justify-center">
              <span className="material-icons text-white text-base">apartment</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">LuxeEstate</span>
          </Link>

          <nav className="flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`px-1 py-1 text-sm font-medium transition-all ${
                  isActive(link)
                    ? "text-mosque dark:text-[#4db8a0] border-b-2 border-mosque dark:border-[#4db8a0]"
                    : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-b-2 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: search, bell, dark mode, language selector, vertical divider + user */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-mosque dark:hover:text-[#4db8a0] transition-colors" title="Search">
            <span className="material-icons text-xl">search</span>
          </button>

          <button className="text-gray-400 hover:text-mosque dark:hover:text-[#4db8a0] transition-colors relative" title="Notifications">
            <span className="material-icons text-xl">notifications_none</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0a1a17]"></span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-400 hover:text-mosque dark:hover:text-[#4db8a0] transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
            title="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <span className="material-icons text-xl">light_mode</span>
              ) : (
                <span className="material-icons text-xl">dark_mode</span>
              )
            ) : (
              <span className="material-icons text-xl opacity-0">dark_mode</span>
            )}
          </button>

          <div className="flex items-center">
            <LanguageSelector />
          </div>

          <div className="flex items-center pl-3 border-l border-gray-200 dark:border-white/10 relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              title="Profile menu"
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-mosque/50 transition-all cursor-pointer"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-icons text-gray-500 dark:text-white/50 text-lg">
                  person
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-[#152e2a] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-icons text-base">home</span>
                  Back to Home
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-icons text-base">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

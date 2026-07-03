"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/users", label: "Users", exact: false },
];

export default function DashboardNavbar({ user }: { user: User }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

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

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href, link.exact)
                    ? "text-mosque dark:text-[#4db8a0] border-b-2 border-mosque dark:border-[#4db8a0] rounded-none pb-[18px]"
                    : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: bell + user */}
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors relative">
            <span className="material-icons text-xl">notifications_none</span>
          </button>

          <div className="flex items-center gap-3 relative" ref={profileRef}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 dark:text-white/40">Admin</p>
            </div>
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
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-[#152e2a] rounded-xl shadow-lg border border-gray-200 dark:border-white/10 py-1.5 z-50">
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

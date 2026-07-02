"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/app/i18n/I18nProvider";

export default function DashboardSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const d = (t as any).dashboard;

  const navLinks = [
    {
      href: "/dashboard",
      label: d?.properties ?? "Properties",
      icon: "apartment",
      exact: true,
    },
    {
      href: "/dashboard/users",
      label: d?.users ?? "Users",
      icon: "manage_accounts",
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-nordic-dark dark:bg-[#0a1a17] flex flex-col z-40 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-mosque flex items-center justify-center flex-shrink-0">
          <span className="material-icons text-white text-lg">apartment</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">LuxeEstate</p>
          <p className="text-white/40 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-4">
          {d?.title ?? "Dashboard"}
        </p>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${
                isActive(link.href, link.exact)
                  ? "bg-mosque text-white shadow-lg shadow-mosque/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <span className="material-icons text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="material-icons text-lg">arrow_back</span>
          {d?.backToSite ?? "Back to Site"}
        </Link>
      </div>
    </aside>
  );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useTranslation } from "../i18n/I18nProvider";

type ActionValue = "All" | "Buy" | "Rent";

interface ActionFilterClientProps {
  currentAction: string;
}

export default function ActionFilterClient({
  currentAction,
}: ActionFilterClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setAction = useCallback(
    (value: ActionValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "All") {
        params.delete("action");
      } else {
        params.set("action", value);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  const getActionLabel = (filter: ActionValue) => {
    if (filter === "All") return t.hero.tabAll;
    if (filter === "Buy") return t.hero.tabSale;
    if (filter === "Rent") return t.hero.tabRent;
    return filter;
  };

  return (
    <div
      className={`hidden md:flex bg-card-bg p-1 rounded-lg border border-nordic-dark/5 transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      {(["All", "Buy", "Rent"] as const).map((filter) => {
        const isActive = currentAction === filter;
        return (
          <button
            key={filter}
            onClick={() => setAction(filter)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-mosque text-white shadow-sm"
                : "text-nordic-muted hover:text-nordic-dark"
            }`}
          >
            {getActionLabel(filter)}
          </button>
        );
      })}
    </div>
  );
}

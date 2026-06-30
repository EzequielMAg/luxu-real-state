"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  className?: string;
}

export default function PaginationControls({
  page: initialPage,
  totalPages,
  total,
  className = "mt-12",
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // ✅ Read the current page from the URL (searchParams) so that after
  // client-side navigation the value stays in sync with what's in the browser.
  // Fall back to the server-side prop only on the very first render (SSR).
  const page = Number(searchParams.get("page") ?? initialPage);

  const navigate = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Page info */}
      <p className="text-sm text-nordic-muted">
        Page{" "}
        <span className="font-medium text-nordic-dark">{page}</span> of{" "}
        <span className="font-medium text-nordic-dark">{totalPages}</span>
        {" · "}
        <span className="font-medium text-nordic-dark">{total}</span>{" "}
        properties
      </p>

      {/* Controls */}
      <div className={`flex items-center gap-3 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
        {/* Previous */}
        <button
          onClick={() => navigate(page - 1)}
          disabled={!hasPrev || isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card-bg border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="material-icons text-base">arrow_back</span>
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, current, and ±1 around current
              return (
                p === 1 ||
                p === totalPages ||
                Math.abs(p - page) <= 1
              );
            })
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push("...");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-nordic-muted text-sm"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => navigate(item as number)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    item === page
                      ? "bg-mosque text-white shadow-sm"
                      : "bg-card-bg border border-nordic-dark/10 text-nordic-dark hover:border-mosque hover:text-mosque hover:shadow-sm"
                  }`}
                >
                  {item}
                </button>
              )
            )}
        </div>

        {/* Next */}
        <button
          onClick={() => navigate(page + 1)}
          disabled={!hasNext || isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card-bg border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark text-sm font-medium rounded-lg transition-all hover:shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          Next
          <span className="material-icons text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

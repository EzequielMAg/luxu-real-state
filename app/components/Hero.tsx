"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition, useState } from "react";
import FilterModal from "./FilterModal";
import { useTranslation } from "../i18n/I18nProvider";

const CATEGORIES = ["All", "House", "Apartment", "Villa", "Penthouse"];

export default function Hero() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCategory = searchParams.get("type") ?? "All";
  const searchQuery = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get("search") as string) ?? "";
    updateParam("search", query);
  };

  const handleApplyFilters = (newFilters: {
    search?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string[];
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Helper to update parameter
    const update = (key: string, value?: string) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };

    update("search", newFilters.search);
    update("type", newFilters.type);
    update("minPrice", newFilters.minPrice);
    update("maxPrice", newFilters.maxPrice);
    update("beds", newFilters.beds);
    update("baths", newFilters.baths);

    if (newFilters.amenities && newFilters.amenities.length > 0) {
      params.set("amenities", newFilters.amenities.join(","));
    } else {
      params.delete("amenities");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Build initial filters state for the modal
  const amenitiesParam = searchParams.get("amenities");
  const initialFilters = {
    search: searchQuery,
    type: selectedCategory === "All" ? undefined : selectedCategory,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    beds: searchParams.get("beds") ?? undefined,
    baths: searchParams.get("baths") ?? undefined,
    amenities: amenitiesParam ? amenitiesParam.split(",") : undefined,
  };

  const getCategoryLabel = (category: string) => {
    if (category === "All") return t.hero.tabAll;
    if (category === "House") return locale === "es" ? "Casa" : locale === "fr" ? "Maison" : "House";
    if (category === "Apartment") return locale === "es" ? "Apartamento" : locale === "fr" ? "Appartement" : "Apartment";
    return category;
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight px-4 sm:px-0">
          {t.hero.title1}{" "}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">{t.hero.titleAccent}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        {/* Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative group max-w-2xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span
              className={`material-icons text-2xl transition-colors ${
                isPending ? "text-mosque animate-pulse" : "text-nordic-muted group-focus-within:text-mosque"
              }`}
            >
              search
            </span>
          </div>
          <input
            name="search"
            className="block w-full pl-11 pr-24 sm:pl-12 sm:pr-28 py-3.5 sm:py-4 rounded-xl border-none bg-card-bg text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-card-bg transition-all text-base sm:text-lg outline-none"
            placeholder={t.hero.locationPlaceholder}
            type="text"
            defaultValue={searchQuery}
            key={searchQuery}
          />
          <button
            type="submit"
            className="absolute inset-y-1.5 sm:inset-y-2 right-1.5 sm:right-2 px-4 sm:px-6 bg-mosque hover:bg-mosque/90 text-white font-medium text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 cursor-pointer"
          >
            {t.hero.searchBtn}
          </button>
        </form>
      </div>

      {/* Category Filters in wider container (max-w-5xl) to fit multi-language labels without overflow */}
      <div className="max-w-5xl mx-auto mt-8 px-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => updateParam("type", category)}
                className={`whitespace-nowrap px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-mosque text-white shadow-lg shadow-mosque/10 hover:-translate-y-0.5"
                    : "bg-card-bg border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            );
          })}

          <div className="hidden sm:block w-px h-6 bg-nordic-dark/10 mx-1"></div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap flex items-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-nordic-dark font-medium text-xs sm:text-sm hover:bg-nordic-dark/5 transition-colors cursor-pointer"
          >
            <span className="material-icons text-sm sm:text-base">tune</span> {t.hero.advancedFiltersBtn}
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFilters={initialFilters}
        onApply={handleApplyFilters}
      />
    </section>
  );
}

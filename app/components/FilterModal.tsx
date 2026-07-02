"use client";

import { useState, useEffect } from "react";
import { getProperties } from "../actions/properties";
import { useTranslation } from "../i18n/I18nProvider";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: {
    search?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string[];
  };
  onApply: (filters: {
    search?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string[];
  }) => void;
}

const AMENITIES_OPTIONS = [
  { id: "Swimming Pool", label: "Swimming Pool", icon: "pool" },
  { id: "Gym", label: "Gym", icon: "fitness_center" },
  { id: "Parking", label: "Parking", icon: "local_parking" },
  { id: "Air Conditioning", label: "Air Conditioning", icon: "ac_unit" },
  { id: "High-speed Wifi", label: "High-speed Wifi", icon: "wifi" },
  { id: "Patio / Terrace", label: "Patio / Terrace", icon: "deck" },
];

export default function FilterModal({
  isOpen,
  onClose,
  initialFilters,
  onApply,
}: FilterModalProps) {
  const { t, locale } = useTranslation();

  // Local state initialized with initialFilters
  const [location, setLocation] = useState(initialFilters.search ?? "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice ?? "");
  const [propertyType, setPropertyType] = useState(initialFilters.type ?? "Any Type");
  const [beds, setBeds] = useState(initialFilters.beds ? parseInt(initialFilters.beds, 10) : 0);
  const [baths, setBaths] = useState(initialFilters.baths ? parseFloat(initialFilters.baths) : 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters.amenities ?? []
  );

  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Sync state with initial filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocation(initialFilters.search ?? "");
      setMinPrice(initialFilters.minPrice ?? "");
      setMaxPrice(initialFilters.maxPrice ?? "");
      setPropertyType(initialFilters.type ?? "Any Type");
      setBeds(initialFilters.beds ? parseInt(initialFilters.beds, 10) : 0);
      setBaths(initialFilters.baths ? parseFloat(initialFilters.baths) : 0);
      setSelectedAmenities(initialFilters.amenities ?? []);
    }
  }, [isOpen, initialFilters]);

  // Fetch count of matching properties when filters change (debounced)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoadingCount(true);
      try {
        const parsedMin = minPrice ? parseFloat(minPrice.replace(/,/g, "")) : undefined;
        const parsedMax = maxPrice ? parseFloat(maxPrice.replace(/,/g, "")) : undefined;

        const result = await getProperties({
          page: 1,
          type: propertyType === "Any Type" ? "All" : (propertyType as any),
          search: location,
          minPrice: parsedMin,
          maxPrice: parsedMax,
          beds: beds > 0 ? beds : undefined,
          baths: baths > 0 ? baths : undefined,
          amenities: selectedAmenities,
        });
        setMatchingCount(result.total);
      } catch (err) {
        console.error("Error fetching matching count:", err);
      } finally {
        setIsLoadingCount(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isOpen, location, minPrice, maxPrice, propertyType, beds, baths, selectedAmenities]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearAll = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("Any Type");
    setBeds(0);
    setBaths(0);
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    const cleanMinPrice = minPrice.replace(/,/g, "").trim();
    const cleanMaxPrice = maxPrice.replace(/,/g, "").trim();

    onApply({
      search: location || undefined,
      type: propertyType === "Any Type" ? undefined : propertyType,
      minPrice: cleanMinPrice || undefined,
      maxPrice: cleanMaxPrice || undefined,
      beds: beds > 0 ? beds.toString() : undefined,
      baths: baths > 0 ? baths.toString() : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
    onClose();
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Helper for pricing display format in slider visual
  const getPriceDisplay = () => {
    if (!minPrice && !maxPrice) return t.hero.anyPrice;
    const formattedMin = minPrice ? `$${parseFloat(minPrice.replace(/,/g, "")).toLocaleString()}` : "$0";
    const formattedMax = maxPrice ? `$${parseFloat(maxPrice.replace(/,/g, "")).toLocaleString()}` : "Any";
    return `${formattedMin} – ${formattedMax}`;
  };

  const getAmenityLabel = (id: string) => {
    if (id === "Swimming Pool") return t.filters.pool;
    if (id === "Gym") return t.filters.gym;
    if (id === "Parking") return locale === "es" ? "Estacionamiento" : locale === "fr" ? "Parking" : "Parking";
    if (id === "Air Conditioning") return locale === "es" ? "Aire Acondicionado" : locale === "fr" ? "Climatisation" : "Air Conditioning";
    if (id === "High-speed Wifi") return locale === "es" ? "Wifi de Alta Velocidad" : locale === "fr" ? "Wifi Haut Débit" : "High-speed Wifi";
    if (id === "Patio / Terrace") return locale === "es" ? "Patio / Terraza" : locale === "fr" ? "Patio / Terrasse" : "Patio / Terrace";
    return id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Main Modal Container */}
      <main className="relative z-20 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-30">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t.filters.title}
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            <span className="material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t.hero.locationLabel}
            </label>
            <div className="relative group">
              <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">
                location_on
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-[#f5f8f6] dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm outline-none"
                placeholder={t.hero.locationPlaceholder}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t.filters.priceRange}
              </label>
              <span className="text-sm font-medium text-mosque">
                {getPriceDisplay()}
              </span>
            </div>
            
            {/* Range Slider Track Graphic */}
            <div className="relative h-12 flex items-center mb-6 px-2">
              <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-mosque w-1/3 ml-[20%]"></div>
              </div>
              <div className="absolute left-[20%] w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10"></div>
              <div className="absolute left-[53%] w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f5f8f6] dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  {t.filters.minPrice}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm outline-none"
                    type="text"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setMinPrice(val ? parseInt(val, 10).toLocaleString() : "");
                    }}
                  />
                </div>
              </div>
              <div className="bg-[#f5f8f6] dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  {t.filters.maxPrice}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm outline-none"
                    type="text"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setMaxPrice(val ? parseInt(val, 10).toLocaleString() : "");
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t.filters.propertyType}
              </label>
              <div className="relative">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-[#f5f8f6] dark:bg-gray-800 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-mosque cursor-pointer outline-none"
                >
                  <option value="Any Type">{t.filters.typeAll}</option>
                  <option value="House">{locale === "es" ? "Casa" : locale === "fr" ? "Maison" : "House"}</option>
                  <option value="Apartment">{locale === "es" ? "Apartamento" : locale === "fr" ? "Appartement" : "Apartment"}</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
                <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-4">
              {/* Beds */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t.filters.bedrooms}
                </span>
                <div className="flex items-center space-x-3 bg-[#f5f8f6] dark:bg-gray-800 rounded-full p-1">
                  <button
                    disabled={beds === 0}
                    onClick={() => setBeds((b) => Math.max(0, b - 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-6 text-center text-gray-900 dark:text-white">
                    {beds === 0 ? t.filters.any : `${beds}+`}
                  </span>
                  <button
                    onClick={() => setBeds((b) => b + 1)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
              {/* Baths */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t.filters.bathrooms}
                </span>
                <div className="flex items-center space-x-3 bg-[#f5f8f6] dark:bg-gray-800 rounded-full p-1">
                  <button
                    disabled={baths === 0}
                    onClick={() => setBaths((b) => Math.max(0, b - 0.5))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-6 text-center text-gray-900 dark:text-white">
                    {baths === 0 ? t.filters.any : `${baths}+`}
                  </span>
                  <button
                    onClick={() => setBaths((b) => b + 0.5)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {t.filters.amenities}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES_OPTIONS.map((option) => {
                const isActive = selectedAmenities.includes(option.id);
                return (
                  <label key={option.id} className="cursor-pointer group relative">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleAmenity(option.id)}
                      className="peer sr-only"
                    />
                    <div
                      className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all font-medium select-none ${
                        isActive
                          ? "border-mosque bg-mosque/5 dark:bg-mosque/20 text-mosque dark:text-white"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <span
                        className={`material-icons text-lg ${
                          isActive ? "text-mosque dark:text-white" : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      >
                        {option.icon}
                      </span>
                      {getAmenityLabel(option.id)}
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors underline decoration-gray-300 underline-offset-4 cursor-pointer"
          >
            {t.filters.clearAll}
          </button>
          <button
            onClick={handleApply}
            className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95 cursor-pointer"
          >
            {isLoadingCount ? (
              <>
                <span className="material-icons text-sm animate-spin">sync</span>
                Loading...
              </>
            ) : (
              <>
                {t.filters.showResults} ({matchingCount ?? 0})
                <span className="material-icons text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </footer>
      </main>
    </div>
  );
}

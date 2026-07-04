"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Property, PropertyAction, PropertyType } from "@/app/types/property";
import { uploadPropertyImage, createProperty, updateProperty } from "@/app/actions/properties";
import { useTranslation } from "@/app/i18n/I18nProvider";
import LeafletMapDynamic from "./LeafletMapDynamic";

interface PropertyFormProps {
  initialData?: Property | null;
}

const AVAILABLE_AMENITIES = [
  "Swimming Pool",
  "Garden",
  "Air Conditioning",
  "Smart Home System",
  "Central Heating & Cooling",
  "Electric Vehicle Charging",
  "Private Gym & Spa",
  "24/7 Perimeter Security",
];

export default function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const pf = (t as any).propertyForm || {};
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [action, setAction] = useState<PropertyAction>(initialData?.action || "Buy");
  const [type, setType] = useState<PropertyType>(initialData?.type || "Apartment");
  const [description, setDescription] = useState(initialData?.description || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [lat, setLat] = useState<number | null>(initialData?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialData?.lng ?? null);
  const [size, setSize] = useState(initialData?.size || "");
  const [yearBuilt, setYearBuilt] = useState(initialData?.year_built ? String(initialData.year_built) : "");
  const [beds, setBeds] = useState(initialData?.beds ?? 0);
  const [baths, setBaths] = useState(initialData?.baths ?? 0);
  const [parking, setParking] = useState(initialData?.parking ?? 0);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);

  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuggestions, setGeocodeSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ display_name: string; lat: number; lng: number } | null>(
    initialData?.lat && initialData?.lng
      ? { display_name: initialData.address, lat: initialData.lat, lng: initialData.lng }
      : null
  );
  const [geocodeError, setGeocodeError] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMapModal(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleGeocode = async () => {
    if (!address.trim()) return;
    setIsGeocoding(true);
    setGeocodeError("");
    setGeocodeSuggestions([]);
    setShowSuggestions(false);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.trim())}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "es", "User-Agent": "LuxeEstate/1.0" },
      });
      const data = await res.json();
      if (data.length > 0) {
        setGeocodeSuggestions(data);
        setShowSuggestions(true);
      } else {
        setGeocodeError("No se encontraron resultados. Intenta con una dirección más específica o haz clic en el mapa.");
      }
    } catch {
      setGeocodeError("Error al conectar con el servicio de geocodificación. Intenta nuevamente.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    const parsedLat = parseFloat(s.lat);
    const parsedLng = parseFloat(s.lon);
    setLat(parsedLat);
    setLng(parsedLng);
    setGeocodeResult({ display_name: s.display_name, lat: parsedLat, lng: parsedLng });
    setGeocodeSuggestions([]);
    setShowSuggestions(false);
    setGeocodeError("");
  };

  const handleMapClick = async (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setGeocodeError("");
    // Preliminary update so UI reacts instantly
    setGeocodeResult((prev) => ({
      display_name: prev?.display_name || address || "Coordenadas seleccionadas en mapa",
      lat: newLat,
      lng: newLng,
    }));

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`,
        { headers: { "Accept-Language": "es", "User-Agent": "LuxeEstate/1.0" } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        setGeocodeResult({ display_name: data.display_name, lat: newLat, lng: newLng });
        if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: false });
      }
    } catch {
      // Keep coordinates even if reverse geocoding fails
      console.error("Reverse geocoding failed");
    }
  };

  const handleGoToMyPosition = () => {
    if (!navigator.geolocation) {
      setGeocodeError("La geolocalización no está disponible en este navegador.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = pos.coords.latitude;
        const currentLng = pos.coords.longitude;
        setIsLocating(false);
        handleMapClick(currentLat, currentLng);
      },
      () => {
        setGeocodeError("No se pudo obtener tu ubicación. Verifica los permisos del navegador.");
        setIsLocating(false);
      }
    );
  };




  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage("");

    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadPropertyImage(formData);
        if (res.success && res.url) {
          newImages.push(res.url);
          if (fieldErrors.gallery) setFieldErrors((prev) => ({ ...prev, gallery: false }));
        } else {
          setErrorMessage(`${pf.errorUpload || "Error uploading image"} (${file.name}): ${res.error}`);
        }
      }
      setImages(newImages);
    } catch (err: any) {
      setErrorMessage(err.message || (pf.errorUpload || "Failed to upload image(s)"));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!title.trim()) errors.title = true;
    if (!price || Number(price) <= 0) errors.price = true;
    if (!address.trim()) errors.location = true;
    if (!size.trim() || Number(size) <= 0 || size === "0") errors.area = true;
    if (images.length === 0) errors.gallery = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(pf.errorMandatory || "Por favor completa los campos obligatorios resaltados en rojo.");
      const firstKey = Object.keys(errors)[0];
      const firstEl = document.getElementById(firstKey);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
        firstEl.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setFieldErrors({});

    const payload: Partial<Property> = {
      title,
      price: Number(price) || 0,
      action,
      type,
      description,
      address: address.trim(),
      size: size.trim(),
      year_built: yearBuilt ? Number(yearBuilt) : undefined,
      beds,
      baths,
      parking,
      images,
      amenities,
      lat: lat ?? (initialData?.lat ?? 0),
      lng: lng ?? (initialData?.lng ?? 0),
      badge: initialData?.badge || "New",
      is_featured: initialData?.is_featured ?? false,
    };

    try {
      let savedId = initialData?.id;
      if (isEdit && initialData?.id) {
        const res = await updateProperty(initialData.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || (pf.errorUpdate || "Failed to update property."));
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await createProperty(payload);
        if (!res.success) {
          setErrorMessage(res.error || (pf.errorCreate || "Failed to create property."));
          setIsSubmitting(false);
          return;
        }
        if (res.id) savedId = res.id;
      }
      const actionType = isEdit ? "update" : "create";
      router.push(`/dashboard?success=${actionType}${savedId ? `&highlight=${savedId}` : ""}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || (pf.errorUnexpected || "An unexpected error occurred."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-white/40 font-medium font-sf">
              <li>
                <Link href="/dashboard" className="hover:text-mosque transition-colors">
                  {pf.breadcrumbProperties || "Properties"}
                </Link>
              </li>
              <li>
                <span className="material-icons text-xs text-gray-400">chevron_right</span>
              </li>
              <li aria-current="page" className="text-nordic dark:text-white">
                {isEdit ? (pf.titleEdit || "Edit Property") : (pf.titleNew || "Add New")}
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic dark:text-white tracking-tight mb-2">
              {isEdit ? (pf.titleEdit || "Edit Property") : (pf.titleNew || "Add New Property")}
            </h1>
            <p className="text-base text-gray-500 dark:text-white/50 max-w-2xl font-normal font-sf">
              {isEdit
                ? (pf.subtitleEdit || "Fill in the details below to update the listing. Fields marked with * are mandatory.")
                : (pf.subtitleNew || "Fill in the details below to create a new listing. Fields marked with * are mandatory.")}
            </p>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm font-sf flex items-center gap-3 shadow-md animate-pulse">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <span className="material-icons text-base">warning</span>
          </div>
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors cursor-pointer"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      <form id="property-form" noValidate onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          {/* Basic Information Box */}
          <div className="bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green dark:bg-mosque/20 flex items-center justify-center text-nordic dark:text-mosque">
                <span className="material-icons text-lg">info</span>
              </div>
              <h2 className="text-xl font-bold text-nordic dark:text-white">{pf.basicInfoTitle || "Basic Information"}</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="group">
                <label htmlFor="title" className="block text-sm font-medium text-nordic dark:text-white mb-1.5 font-sf">
                  {pf.propertyTitleLabel || "Property Title"} <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: false });
                  }}
                  placeholder={pf.propertyTitlePlaceholder || "e.g. Modern Penthouse with Ocean View"}
                  className={`w-full text-base px-4 py-2.5 rounded-md border bg-white dark:bg-white/5 text-nordic dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf ${
                    fieldErrors.title
                      ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                />
                {fieldErrors.title && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1.5 animate-pulse">
                    <span className="material-icons text-sm">error_outline</span>
                    {pf.errorReqTitle || "Este campo es obligatorio para publicar."}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-nordic dark:text-white mb-1.5 font-sf">
                    {pf.priceLabel || "Price"} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf text-sm">$</span>
                    <input
                      id="price"
                      type="number"
                      required
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: false });
                      }}
                      placeholder="0.00"
                      className={`w-full pl-7 pr-4 py-2.5 rounded-md border bg-white dark:bg-white/5 text-nordic dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium font-sf ${
                        fieldErrors.price
                          ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
                          : "border-gray-200 dark:border-white/10"
                      }`}
                    />
                  </div>
                  {fieldErrors.price && (
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1.5 animate-pulse">
                      <span className="material-icons text-sm">error_outline</span>
                      {pf.errorReqPrice || "Ingresa un precio válido mayor a 0."}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-nordic dark:text-white mb-1.5 font-sf">
                    {pf.statusLabel || "Status"}
                  </label>
                  <select
                    id="status"
                    value={action}
                    onChange={(e) => setAction(e.target.value as PropertyAction)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f2420] text-nordic dark:text-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf cursor-pointer"
                  >
                    <option value="Buy">{pf.statusBuy || "For Sale"}</option>
                    <option value="Rent">{pf.statusRent || "For Rent"}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-nordic dark:text-white mb-1.5 font-sf">
                    {pf.typeLabel || "Property Type"}
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f2420] text-nordic dark:text-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf cursor-pointer"
                  >
                    <option value="Apartment">{pf.typeApartment || "Apartment"}</option>
                    <option value="House">{pf.typeHouse || "House"}</option>
                    <option value="Villa">{pf.typeVilla || "Villa"}</option>
                    <option value="Penthouse">{pf.typePenthouse || "Penthouse"}</option>
                    <option value="Commercial">{pf.typeCommercial || "Commercial"}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green dark:bg-mosque/20 flex items-center justify-center text-nordic dark:text-mosque">
                <span className="material-icons text-lg">description</span>
              </div>
              <h2 className="text-xl font-bold text-nordic dark:text-white">{pf.descriptionTitle || "Description"}</h2>
            </div>
            <div className="p-8">
              <div className="mb-3 flex gap-2 border-b border-gray-100 dark:border-white/10 pb-2">
                <button type="button" className="p-1.5 text-gray-400 hover:text-nordic dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded transition-colors">
                  <span className="material-icons text-lg">format_bold</span>
                </button>
                <button type="button" className="p-1.5 text-gray-400 hover:text-nordic dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded transition-colors">
                  <span className="material-icons text-lg">format_italic</span>
                </button>
                <button type="button" className="p-1.5 text-gray-400 hover:text-nordic dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded transition-colors">
                  <span className="material-icons text-lg">format_list_bulleted</span>
                </button>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder={pf.descriptionPlaceholder || "Describe the property features, neighborhood, and unique selling points..."}
                className="w-full px-4 py-3 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-nordic dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf leading-relaxed resize-y min-h-[200px]"
              />
              <div className="mt-2 text-right text-xs text-gray-400 font-sf">
                {description.length} / 2000 {pf.charactersText || " characters"}
              </div>
            </div>
          </div>

          {/* Gallery Box */}
          <div id="gallery" className={`bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border overflow-hidden transition-all ${
            fieldErrors.gallery
              ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/10 dark:bg-red-900/10"
              : "border-gray-100 dark:border-white/10"
          }`}>
            <div className="px-8 py-6 border-b border-hint-green/30 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-hint-green dark:bg-mosque/20 flex items-center justify-center text-nordic dark:text-mosque">
                  <span className="material-icons text-lg">image</span>
                </div>
                <h2 className="text-xl font-bold text-nordic dark:text-white">{pf.galleryTitle || "Gallery"} <span className="text-red-500">*</span></h2>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded font-sf">
                {pf.gallerySubtitle || "JPG, PNG, WEBP"}
              </span>
            </div>
            <div className="p-8">
              <label className="relative border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl bg-gray-50/50 dark:bg-white/2 p-10 text-center hover:bg-hint-green/10 dark:hover:bg-mosque/5 hover:border-mosque/40 transition-colors cursor-pointer group block">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
                    <span className="material-icons text-2xl">
                      {isUploading ? "sync" : "cloud_upload"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-nordic dark:text-white font-sf">
                      {isUploading ? (pf.uploadingText || "Uploading images to Supabase...") : (pf.clickOrDrag || "Click or drag images here")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-white/40 font-sf">{pf.maxSizeText || "Max file size 5MB per image"}</p>
                  </div>
                </div>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {images.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100 dark:bg-white/5">
                    <img src={url} alt={`Gallery item ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete image"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf uppercase tracking-wider">
                        {pf.mainBadge || "Main"}
                      </span>
                    )}
                  </div>
                ))}

                <label className="aspect-square rounded-lg border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center text-gray-400 dark:text-white/40 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 dark:hover:bg-mosque/10 transition-all group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <span className="material-icons group-hover:scale-110 transition-transform">add</span>
                  <span className="text-xs mt-1 font-medium font-sf">{pf.addMoreBtn || "Add More"}</span>
                </label>
              </div>

              {fieldErrors.gallery && (
                <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-4 flex items-center gap-1.5 animate-pulse">
                  <span className="material-icons text-sm">error_outline</span>
                  {pf.errorReqImages || "Debes subir al menos una imagen para publicar."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          {/* Location Box */}
          <div className="bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
            <div className="px-6 py-4 border-b border-hint-green/30 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent rounded-t-xl">
              <div className="w-8 h-8 rounded-full bg-hint-green dark:bg-mosque/20 flex items-center justify-center text-nordic dark:text-mosque">
                <span className="material-icons text-lg">place</span>
              </div>
              <h2 className="text-lg font-bold text-nordic dark:text-white">{pf.locationTitle || "Location"}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-nordic dark:text-white mb-1.5 font-sf">
                  {pf.addressLabel || "Address"} <span className="text-red-500">*</span>
                </label>
                {/* Input + Search button row */}
                <div className="flex gap-2" ref={suggestionsRef}>
                  <div className="relative flex-1">
                    <input
                      id="location"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setGeocodeError("");
                        setShowSuggestions(false);
                        if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: false });
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGeocode(); } }}
                      placeholder={pf.addressPlaceholder || "Street Address, City, Zip"}
                      className={`w-full px-4 py-2.5 rounded-md border bg-white dark:bg-white/5 text-nordic dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf ${
                        fieldErrors.location
                          ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
                          : "border-gray-200 dark:border-white/10"
                      }`}
                    />

                    {/* Dropdown suggestions */}
                    {showSuggestions && geocodeSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-[2500] mt-1 bg-white dark:bg-[#0d2218] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
                        {geocodeSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full text-left px-4 py-3 hover:bg-hint-green/20 dark:hover:bg-mosque/20 transition-colors flex items-start gap-2 cursor-pointer"
                          >
                            <span className="material-icons text-mosque dark:text-[#4db8a0] text-sm mt-0.5 flex-shrink-0">place</span>
                            <span className="text-xs text-gray-700 dark:text-white/80 font-sf leading-relaxed">{s.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* Search button */}
                  <button
                    type="button"
                    onClick={handleGeocode}
                    disabled={isGeocoding || !address.trim()}
                    title={pf.geocodeButton || "Buscar en el mapa"}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-mosque text-white text-sm font-semibold font-sf hover:bg-mosque/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span className={`material-icons text-base ${isGeocoding ? "animate-spin" : ""}`}>
                      {isGeocoding ? "sync" : "search"}
                    </span>
                    <span className="hidden sm:inline">{isGeocoding ? (pf.geocoding || "Buscando...") : (pf.geocodeButton || "Buscar")}</span>
                  </button>
                </div>

                {/* Validation error */}
                {fieldErrors.location && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1.5 animate-pulse">
                    <span className="material-icons text-sm">error_outline</span>
                    {pf.errorReqAddress || "La dirección es obligatoria para publicar."}
                  </p>
                )}

                {/* Geocode Error */}
                {geocodeError && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                    <span className="material-icons text-red-500 text-base mt-0.5 flex-shrink-0">location_off</span>
                    <p className="text-xs text-red-600 dark:text-red-400 font-sf leading-relaxed">{geocodeError}</p>
                  </div>
                )}

                {/* Geocode Success / Manual Coords Card */}
                <div className="mt-3 p-3 rounded-lg bg-hint-green/20 dark:bg-mosque/10 border border-mosque/30 dark:border-mosque/30">
                  <div className="flex items-start gap-2">
                    <span className="material-icons text-mosque dark:text-[#4db8a0] text-base mt-0.5 flex-shrink-0">
                      {geocodeResult ? "check_circle" : "info"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-mosque dark:text-[#4db8a0] font-sf mb-1">
                        {geocodeResult ? (pf.geocodeConfirmed || "Ubicación confirmada") : "Selección manual activada"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-white/60 font-sf leading-relaxed truncate" title={geocodeResult?.display_name || address}>
                        {geocodeResult?.display_name || address || "Haz clic o arrastra el marcador en el mapa abajo para ubicar"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-white dark:bg-white/10 text-nordic dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-white/10 shadow-2xs">
                          <span className="text-mosque font-bold">Lat:</span>
                          <input
                            type="number"
                            step="any"
                            value={lat ?? (geocodeResult?.lat ?? -34.6037)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setLat(val);
                                setGeocodeResult((prev) => ({
                                  display_name: prev?.display_name || address || "Coordenadas editadas",
                                  lat: val,
                                  lng: prev?.lng ?? -58.3816,
                                }));
                              }
                            }}
                            className="w-24 bg-transparent border-0 p-0 focus:ring-0 text-[11px] font-mono font-bold text-nordic dark:text-white"
                          />
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-white dark:bg-white/10 text-nordic dark:text-white px-2 py-1 rounded border border-gray-200 dark:border-white/10 shadow-2xs">
                          <span className="text-mosque font-bold">Lng:</span>
                          <input
                            type="number"
                            step="any"
                            value={lng ?? (geocodeResult?.lng ?? -58.3816)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setLng(val);
                                setGeocodeResult((prev) => ({
                                  display_name: prev?.display_name || address || "Coordenadas editadas",
                                  lat: prev?.lat ?? -34.6037,
                                  lng: val,
                                }));
                              }
                            }}
                            className="w-24 bg-transparent border-0 p-0 focus:ring-0 text-[11px] font-mono font-bold text-nordic dark:text-white"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Preview - Always Interactive */}
              <div className="relative h-56 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <LeafletMapDynamic
                  lat={lat ?? (geocodeResult?.lat ?? -34.6037)}
                  lng={lng ?? (geocodeResult?.lng ?? -58.3816)}
                  zoom={geocodeResult ? 15 : 12}
                  height="100%"
                  onLocationSelect={handleMapClick}
                />
                {/* Expand and GPS buttons */}
                <div className="absolute top-2 right-2 z-[400] flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    title={pf.geocodeExpand || "Ver mapa completo"}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 dark:bg-nordic/90 text-nordic dark:text-white shadow-md hover:bg-white dark:hover:bg-nordic/70 transition-all cursor-pointer backdrop-blur-sm"
                  >
                    <span className="material-icons text-base">fullscreen</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToMyPosition}
                    disabled={isLocating}
                    title="Ir a mi ubicación actual (GPS)"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 dark:bg-nordic/90 text-nordic dark:text-white shadow-md hover:bg-white dark:hover:bg-nordic/70 transition-all cursor-pointer backdrop-blur-sm disabled:opacity-50"
                  >
                    <span className={`material-icons text-base text-mosque ${isLocating ? "animate-spin" : ""}`}>
                      {isLocating ? "sync" : "my_location"}
                    </span>
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 right-2 z-[400] pointer-events-none flex justify-center">
                  <span className="bg-white/90 dark:bg-nordic/90 text-nordic dark:text-white px-3 py-1 rounded-full shadow-md text-[11px] font-sf font-medium border border-gray-200/50 dark:border-white/10 backdrop-blur-xs">
                    💡 Haz clic en el mapa o arrastra el marcador para ubicar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Box */}
          <div className="bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-hint-green/30 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green dark:bg-mosque/20 flex items-center justify-center text-nordic dark:text-mosque">
                <span className="material-icons text-lg">straighten</span>
              </div>
              <h2 className="text-lg font-bold text-nordic dark:text-white">{pf.detailsTitle || "Details"}</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="area" className="text-xs text-gray-500 dark:text-white/40 font-medium font-sf mb-1 block">
                    {pf.areaLabel || "Area (sqft / m²)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="area"
                    type="number"
                    required
                    value={size}
                    onChange={(e) => {
                      setSize(e.target.value);
                      if (fieldErrors.area) setFieldErrors({ ...fieldErrors, area: false });
                    }}
                    placeholder="0"
                    className={`w-full text-left px-3 py-2 rounded border bg-gray-50 dark:bg-white/5 text-nordic dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf text-sm ${
                      fieldErrors.area
                        ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
                        : "border-gray-200 dark:border-white/10"
                    }`}
                  />
                  {fieldErrors.area && (
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1 animate-pulse">
                      <span className="material-icons text-xs">error_outline</span>
                      {pf.errorReqArea || "El área es obligatoria."}
                    </p>
                  )}
                </div>
                <div className="group">
                  <label htmlFor="year" className="text-xs text-gray-500 dark:text-white/40 font-medium font-sf mb-1 block">
                    {pf.yearBuiltLabel || "Year Built"}
                  </label>
                  <input
                    id="year"
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="YYYY"
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-nordic dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf text-sm"
                  />
                </div>
              </div>
              <hr className="border-gray-100 dark:border-white/10" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic dark:text-white font-sf flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">bed</span> {pf.bedroomsLabel || "Bedrooms"}
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-md overflow-hidden bg-white dark:bg-white/5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setBeds(Math.max(0, beds - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors border-r border-gray-100 dark:border-white/10"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={beds}
                      className="w-10 text-center border-none bg-transparent text-nordic dark:text-white p-0 focus:ring-0 text-sm font-medium font-sf"
                    />
                    <button
                      type="button"
                      onClick={() => setBeds(beds + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors border-l border-gray-100 dark:border-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic dark:text-white font-sf flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">shower</span> {pf.bathroomsLabel || "Bathrooms"}
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-md overflow-hidden bg-white dark:bg-white/5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setBaths(Math.max(0, baths - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors border-r border-gray-100 dark:border-white/10"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={baths}
                      className="w-10 text-center border-none bg-transparent text-nordic dark:text-white p-0 focus:ring-0 text-sm font-medium font-sf"
                    />
                    <button
                      type="button"
                      onClick={() => setBaths(baths + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors border-l border-gray-100 dark:border-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic dark:text-white font-sf flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">directions_car</span> {pf.parkingLabel || "Parking"}
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-md overflow-hidden bg-white dark:bg-white/5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setParking(Math.max(0, parking - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors border-r border-gray-100 dark:border-white/10"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={parking}
                      className="w-10 text-center border-none bg-transparent text-nordic dark:text-white p-0 focus:ring-0 text-sm font-medium font-sf"
                    />
                    <button
                      type="button"
                      onClick={() => setParking(parking + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors border-l border-gray-100 dark:border-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-white/10" />

              <div>
                <h3 className="font-bold text-nordic dark:text-white mb-3 font-sf uppercase tracking-wider text-xs text-gray-500 dark:text-white/40">
                  {pf.amenitiesTitle || "Amenities"}
                </h3>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {AVAILABLE_AMENITIES.map((item) => {
                    const isChecked = amenities.includes(item);
                    const labelText = pf.amenitiesList?.[item] || item;
                    return (
                      <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(item)}
                          className="w-4 h-4 text-mosque border-gray-300 dark:border-white/20 rounded focus:ring-mosque bg-transparent cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 dark:text-white/80 font-sf group-hover:text-nordic dark:group-hover:text-white transition-colors">
                          {labelText}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar accompanying scroll */}
        <div className="xl:col-span-12 sticky bottom-0 sm:bottom-4 z-[2000] mt-6 bg-white/95 dark:bg-[#0a1a17]/95 backdrop-blur-md rounded-t-xl sm:rounded-xl p-4 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-white/60 font-sf">
            <div className="w-8 h-8 rounded-full bg-mosque/10 text-mosque flex items-center justify-center flex-shrink-0">
              <span className="material-icons text-base">info</span>
            </div>
            <span>{pf.footerTip || "Double-check all mandatory fields (*) before saving."}</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-nordic dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-medium font-sf text-sm cursor-pointer"
            >
              {pf.cancelBtn || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic dark:hover:bg-[#11302b] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-sf text-sm cursor-pointer disabled:opacity-50"
            >
              <span className="material-icons text-sm">save</span>
              {isSubmitting ? (pf.savingBtn || "Saving...") : (pf.saveBtn || "Save Property")}
            </button>
          </div>
        </div>
      </form>

      {/* Fullscreen Map Modal */}
      {showMapModal && (
        <div 
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn cursor-pointer"
          onClick={() => setShowMapModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl h-[75vh] bg-white dark:bg-[#0a1a17] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="material-icons text-mosque flex-shrink-0">place</span>
                <h3 className="font-bold text-nordic dark:text-white font-sf text-sm sm:text-base truncate">
                  {geocodeResult?.display_name || address || "Selecciona una ubicación en el mapa"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                title="Cerrar mapa"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 transition-colors cursor-pointer flex-shrink-0"
              >
                <span className="material-icons text-lg">close</span>
              </button>
            </div>
            <div className="flex-1 w-full h-full relative">
              <LeafletMapDynamic 
                lat={lat ?? (geocodeResult?.lat ?? -34.6037)} 
                lng={lng ?? (geocodeResult?.lng ?? -58.3816)} 
                zoom={16} 
                height="100%" 
                onLocationSelect={handleMapClick}
              />
              <div className="absolute top-3 left-3 z-[400] pointer-events-none">
                <span className="bg-white/95 dark:bg-nordic/95 text-nordic dark:text-white px-4 py-1.5 rounded-full shadow-lg text-xs font-sf font-semibold border border-gray-200 dark:border-white/10">
                  💡 Haz clic en cualquier calle o arrastra el pin para ubicar y autocompletar
                </span>
              </div>
              {/* GPS button in Fullscreen Modal */}
              <button
                type="button"
                onClick={handleGoToMyPosition}
                disabled={isLocating}
                title="Ir a mi ubicación actual (GPS)"
                className="absolute bottom-6 right-6 z-[400] flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-nordic text-nordic dark:text-white shadow-2xl hover:bg-gray-50 dark:hover:bg-nordic/80 transition-all cursor-pointer border border-gray-200 dark:border-white/10 disabled:opacity-50 group hover:scale-105"
              >
                <span className={`material-icons text-2xl text-mosque group-hover:scale-110 transition-transform ${isLocating ? "animate-spin" : ""}`}>
                  {isLocating ? "sync" : "my_location"}
                </span>
              </button>
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-gray-500 dark:text-white/60">
              <div>
                <span className="font-bold text-mosque">Lat:</span> {(lat ?? (geocodeResult?.lat ?? -34.6037)).toFixed(6)} | <span className="font-bold text-mosque">Lng:</span> {(lng ?? (geocodeResult?.lng ?? -58.3816)).toFixed(6)}
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-4 py-1.5 rounded bg-mosque text-white font-sf font-semibold hover:bg-mosque/80 transition-colors cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

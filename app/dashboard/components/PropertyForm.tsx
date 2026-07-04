"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Property, PropertyAction, PropertyType } from "@/app/types/property";
import { uploadPropertyImage, createProperty, updateProperty } from "@/app/actions/properties";
import { useTranslation } from "@/app/i18n/I18nProvider";

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
  const [size, setSize] = useState(initialData?.size || "");
  const [yearBuilt, setYearBuilt] = useState(initialData?.year_built ? String(initialData.year_built) : "");
  const [beds, setBeds] = useState(initialData?.beds ?? 3);
  const [baths, setBaths] = useState(initialData?.baths ?? 2);
  const [parking, setParking] = useState(initialData?.parking ?? 1);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || ["Garden"]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

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
      size: size || "2500",
      year_built: yearBuilt ? Number(yearBuilt) : undefined,
      beds,
      baths,
      parking,
      images: images.length > 0 ? images : ["https://lh3.googleusercontent.com/aida-public/AB6AXuBZW0qbk7lfvNbdW7E2-JlNvoGiYxd_IFtXs-LfvSnOmMtH8ioaZBs2p82ENkCdRf_ix_zKpdGhOcuHfniuiBJrRDyErAFReMdAHvRnerfSzOyzSUbKvgYTybWysd6hjrQ4ZHMu3lMROjFcEx5IowvtKFZJy7Wv_AnfQ-q-B48VHLKzKhOvavGIGfN-psB9c2CO70k5peXj1HbAL-Lg-aGaK3jNgUS3Dh3V_zz6GKj4inq3dsGTc_tJsANMwh0G0YovWbq0luzYzNo"],
      amenities,
      lat: initialData?.lat || 37.4419,
      lng: initialData?.lng || -122.143,
      badge: initialData?.badge || "New",
      is_featured: initialData?.is_featured ?? false,
    };

    try {
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
      }
      router.push("/dashboard");
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
          <div className="bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-hint-green/30 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-hint-green dark:bg-mosque/20 flex items-center justify-center text-nordic dark:text-mosque">
                  <span className="material-icons text-lg">image</span>
                </div>
                <h2 className="text-xl font-bold text-nordic dark:text-white">{pf.galleryTitle || "Gallery"}</h2>
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
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 space-y-8">
          {/* Location Box */}
          <div className="bg-white dark:bg-[#0a1a17] rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-hint-green/30 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 dark:from-white/5 to-transparent">
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
                <input
                  id="location"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: false });
                  }}
                  placeholder={pf.addressPlaceholder || "Street Address, City, Zip"}
                  className={`w-full px-4 py-2.5 rounded-md border bg-white dark:bg-white/5 text-nordic dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf ${
                    fieldErrors.location
                      ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
                      : "border-gray-200 dark:border-white/10"
                  }`}
                />
                {fieldErrors.location && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1.5 animate-pulse">
                    <span className="material-icons text-sm">error_outline</span>
                    {pf.errorReqAddress || "La dirección es obligatoria para publicar."}
                  </p>
                )}
              </div>
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS55FY7gfArnlTpNsdabJk9nBO5uQJgOwIsl8beO34JRZ9dMmjLoIkTuTUO72Y9L5tUmQqTReQWebUWadAWwLusGmRQiIict5sqY--yRaOxuYpTzfR4vv4RKh1ex6oxY64e0kbSeMudNO6pv-gG0WzVWs-pDfvQm5IoTQ1mT-tAV49LDkXAHZl317M1-D7eZw3N8o2ExKWTgg6oMAXOFVnkApIqnb7TZHekwSw8pWQxpJV2EKI8EQKQbQXJaSbjN8gB1n8b-ueWj8"
                  alt="Map view of city streets"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/90 dark:bg-nordic/90 text-nordic dark:text-white px-3 py-1.5 rounded shadow-sm backdrop-blur-sm text-xs font-bold font-sf flex items-center gap-1">
                    <span className="material-icons text-sm text-mosque">map</span> {pf.previewMap || "Preview"}
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
                    {pf.areaLabel || "Area (sqft / m²)"}
                  </label>
                  <input
                    id="area"
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="0"
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-nordic dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf text-sm"
                  />
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
        <div className="xl:col-span-12 sticky bottom-0 sm:bottom-4 z-30 mt-6 bg-white/95 dark:bg-[#0a1a17]/95 backdrop-blur-md rounded-t-xl sm:rounded-xl p-4 sm:p-6 border border-gray-200/80 dark:border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
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
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/app/types/property";
import { togglePropertyFeatured, togglePropertyActive } from "@/app/actions/properties";
import { useTranslation } from "@/app/i18n/I18nProvider";

interface PropertiesTableProps {
  properties: Property[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function estimateMonthly(price: number): string {
  // Estimación simple: 20% down, 30yr, ~6.5% APR
  const principal = price * 0.8;
  const monthlyRate = 0.065 / 12;
  const n = 360;
  const monthly =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
    (Math.pow(1 + monthlyRate, n) - 1);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(monthly);
}

export default function PropertiesTable({ properties }: PropertiesTableProps) {
  const { t } = useTranslation();
  const d = (t as any).dashboard || {};
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeLoadingId, setActiveLoadingId] = useState<string | null>(null);
  const [confirmingProperty, setConfirmingProperty] = useState<Property | null>(null);

  const searchParams = useSearchParams();
  const highlightedId = searchParams?.get("highlight");
  const successType = searchParams?.get("success");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [showSoftDeleteInfo, setShowSoftDeleteInfo] = useState(false);

  useEffect(() => {
    if (successType) {
      const msg = successType === "create"
        ? (d.successCreated || "La propiedad se ha registrado y publicado con éxito en el catálogo.")
        : (d.successUpdated || "Los datos y especificaciones de la propiedad han sido actualizados con éxito.");
      setSuccessMessage(msg);
      setShowSuccessModal(true);

      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [successType, d]);

  useEffect(() => {
    if (highlightedId) {
      setActiveHighlightId(highlightedId);
      const el = document.getElementById(`property-row-${highlightedId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
      const timer = setTimeout(() => {
        setActiveHighlightId(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const handleToggleFeatured = (property: Property) => {
    setLoadingId(property.id);
    startTransition(async () => {
      await togglePropertyFeatured(property.id, property.is_featured);
      setLoadingId(null);
    });
  };

  const handleToggleActive = (property: Property) => {
    setShowSoftDeleteInfo(false);
    setConfirmingProperty(property);
  };

  const executeToggleActive = () => {
    if (!confirmingProperty) return;
    const prop = confirmingProperty;
    const isDeactivating = prop.is_active !== false;

    setConfirmingProperty(null);
    setShowSoftDeleteInfo(false);
    setActiveLoadingId(prop.id);
    startTransition(async () => {
      await togglePropertyActive(prop.id, prop.is_active !== false);
      setActiveLoadingId(null);

      // Resaltado de color y scroll hacia la propiedad modificada
      setActiveHighlightId(prop.id);
      const el = document.getElementById(`property-row-${prop.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => {
        setActiveHighlightId(null);
      }, 6000);

      setSuccessMessage(
        isDeactivating
          ? (d.successDeactivated || "La propiedad ha sido desactivada y oculta del catálogo público.")
          : (d.successReactivated || "La propiedad ha sido reactivada y está visible en el catálogo.")
      );
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 6000);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/5">
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              {d.colPropertyDetails || "Property Details"}
            </th>
            <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              {d.colPrice || "Price"}
            </th>
            <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              {d.colStatus || "Status"}
            </th>
            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              {d.colActions || "Actions"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
          {properties.map((property) => {
            const isLoading = isPending && loadingId === property.id;

            return (
              <tr
                key={property.id}
                id={`property-row-${property.id}`}
                className={`transition-all duration-1000 ${
                  property.id === activeHighlightId
                    ? "bg-mosque/15 dark:bg-mosque/20 ring-2 ring-mosque/50 shadow-md font-medium"
                    : "hover:bg-gray-50/50 dark:hover:bg-white/2"
                }`}
              >
                {/* Property Details: image + info + specs */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-[100px] h-[70px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-white/5">
                      {property.images?.[0] ? (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          width={100}
                          height={70}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-icons text-gray-300 text-2xl">
                            image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-0.5">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/30 mb-2">
                        {property.address}
                      </p>
                      {/* Specs */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">bed</span>
                          {property.beds} {d.bedsLabel || "Beds"}
                        </span>
                        <span className="text-gray-200 dark:text-white/10">•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">bathtub</span>
                          {property.baths} {d.bathsLabel || "Baths"}
                        </span>
                        <span className="text-gray-200 dark:text-white/10">•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">square_foot</span>
                          {property.size} {d.sqftLabel || "sqft"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price + Monthly */}
                <td className="px-4 py-4">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                    {d.monthlyPrefix || "Monthly: "}{estimateMonthly(property.price)}
                  </p>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-4">
                  {property.is_active === false ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {d.statusInactive || "Desactivada"}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleFeatured(property)}
                      disabled={isLoading}
                      title={
                        property.is_featured
                          ? "Click to unfeature"
                          : "Click to feature"
                      }
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer
                        ${
                          property.is_featured
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : property.action === "Buy"
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                        }
                        ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                      `}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          property.is_featured
                            ? "bg-green-500"
                            : property.action === "Buy"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                      />
                      {isLoading
                        ? "..."
                        : property.is_featured
                        ? (d.featured || "Featured")
                        : property.action === "Buy"
                        ? (d.statusForSale || "For Sale")
                        : (d.statusForRent || "For Rent")}
                    </button>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/properties/${property.id}/edit`}
                      title="Edit property"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-mosque dark:hover:text-[#4db8a0] hover:bg-mosque/5 transition-all cursor-pointer"
                    >
                      <span className="material-icons text-base">edit</span>
                    </Link>
                    <button
                      onClick={() => handleToggleActive(property)}
                      disabled={isPending && activeLoadingId === property.id}
                      title={property.is_active === false ? "Reactivar propiedad" : "Desactivar propiedad"}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        property.is_active === false
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      }`}
                    >
                      <span className={`material-icons text-base ${isPending && activeLoadingId === property.id ? "animate-spin" : ""}`}>
                        {isPending && activeLoadingId === property.id
                          ? "sync"
                          : property.is_active === false
                          ? "restore_from_trash"
                          : "delete_outline"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {properties.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-white/30">
          <span className="material-icons text-5xl mb-3 block opacity-30">
            apartment
          </span>
          <p className="font-medium">{d.noPropertiesFound || "No properties found."}</p>
        </div>
      )}

      {/* Floating Success Toast / Modal */}
      {showSuccessModal && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md w-full bg-white dark:bg-[#0a1a17] border-2 border-mosque dark:border-[#4db8a0] rounded-2xl p-5 shadow-2xl flex items-start gap-4 backdrop-blur-md transition-all">
          <div className="w-10 h-10 rounded-full bg-mosque/20 dark:bg-mosque/30 flex items-center justify-center text-mosque dark:text-[#4db8a0] flex-shrink-0 mt-0.5 shadow-inner">
            <span className="material-icons text-xl">check_circle</span>
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-nordic dark:text-white font-sf flex items-center gap-2">
              {successType === "create" ? (d.successTitleCreated || "¡Propiedad Creada!") : (d.successTitleUpdated || "¡Cambios Guardados!")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-white/70 mt-1 font-sf leading-relaxed">
              {successMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>
      )}

      {/* Custom Luxury Confirmation Modal */}
      {confirmingProperty && (
        <div
          onClick={() => setConfirmingProperty(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0a1a17] border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up text-left relative overflow-hidden cursor-default"
          >
            {/* Top decorative glow */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                confirmingProperty.is_active !== false
                  ? "bg-gradient-to-r from-amber-500 to-red-500"
                  : "bg-gradient-to-r from-mosque to-[#4db8a0]"
              }`}
            />

            <div className="flex items-start gap-4 mb-5 mt-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${
                  confirmingProperty.is_active !== false
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-mosque/15 dark:bg-mosque/30 text-mosque dark:text-[#4db8a0]"
                }`}
              >
                <span className="material-icons text-2xl">
                  {confirmingProperty.is_active !== false ? "warning_amber" : "check_circle"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-sf">
                  {confirmingProperty.is_active !== false
                    ? (d.modalDeactivateTitle || "¿Desactivar propiedad?")
                    : (d.modalReactivateTitle || "¿Reactivar propiedad?")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/70 mt-1.5 font-sf leading-relaxed">
                  {confirmingProperty.is_active !== false ? (
                    <>
                      {d.modalDeactivateDesc1 || "Estás a punto de ocultar "}
                      <strong className="text-gray-900 dark:text-white">{confirmingProperty.title}</strong>
                      {d.modalDeactivateDesc2 || " del catálogo público. Dejará de aparecer en las búsquedas y en la pantalla principal, pero podrás reactivarla en cualquier momento desde este panel."}
                    </>
                  ) : (
                    <>
                      {d.modalReactivateDesc1 || "Estás a punto de publicar nuevamente "}
                      <strong className="text-gray-900 dark:text-white">{confirmingProperty.title}</strong>
                      {d.modalReactivateDesc2 || ". Volverá a estar visible de forma inmediata en el catálogo y en los resultados de búsqueda."}
                    </>
                  )}
                </p>

                {/* Soft Delete Explanation Accordion / Box */}
                <div className="mt-4 bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-xl p-3 text-xs text-gray-600 dark:text-white/70">
                  <button
                    type="button"
                    onClick={() => setShowSoftDeleteInfo(!showSoftDeleteInfo)}
                    className="w-full flex items-center justify-between font-bold text-gray-800 dark:text-white hover:text-mosque dark:hover:text-[#4db8a0] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-icons text-sm text-mosque dark:text-[#4db8a0]">info</span>
                      {d.softDeleteInfoBtn || "¿Qué es la baja lógica (Soft Delete)?"}
                    </span>
                    <span className="material-icons text-sm">{showSoftDeleteInfo ? "expand_less" : "expand_more"}</span>
                  </button>
                  {showSoftDeleteInfo && (
                    <p className="mt-2.5 leading-relaxed pt-2 border-t border-gray-200/40 dark:border-white/5 animate-fade-in text-gray-600 dark:text-white/60">
                      {d.softDeleteInfoText || "Para proteger el historial, estadísticas y referencias de la propiedad, aplicamos una baja lógica en la base de datos (Soft Delete). La propiedad no se borra permanentemente, sino que cambia su estado a inactivo, ocultándose del catálogo público para proteger tu información."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setConfirmingProperty(null);
                  setShowSoftDeleteInfo(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer font-sf"
              >
                {d.modalCancelBtn || "Cancelar"}
              </button>
              <button
                type="button"
                onClick={executeToggleActive}
                className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer font-sf ${
                  confirmingProperty.is_active !== false
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                    : "bg-mosque hover:bg-mosque/90 shadow-mosque/20"
                }`}
              >
                <span className="material-icons text-base">
                  {confirmingProperty.is_active !== false ? "visibility_off" : "visibility"}
                </span>
                {confirmingProperty.is_active !== false
                  ? (d.modalDeactivateBtn || "Desactivar ahora")
                  : (d.modalReactivateBtn || "Reactivar ahora")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

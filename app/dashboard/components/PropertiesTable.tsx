"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/app/types/property";
import { togglePropertyFeatured } from "@/app/actions/properties";

interface PropertiesTableProps {
  properties: Property[];
}

const STATUS_CONFIG = {
  featured: {
    label: "Featured",
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
  },
  standard: {
    label: "Active",
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
  },
};

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
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleFeatured = (property: Property) => {
    setLoadingId(property.id);
    startTransition(async () => {
      await togglePropertyFeatured(property.id, property.is_featured);
      setLoadingId(null);
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/5">
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              Property Details
            </th>
            <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              Price
            </th>
            <th className="text-left px-4 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              Status
            </th>
            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
          {properties.map((property) => {
            const isLoading = isPending && loadingId === property.id;

            return (
              <tr
                key={property.id}
                className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
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
                          {property.beds} Beds
                        </span>
                        <span className="text-gray-200 dark:text-white/10">•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">bathtub</span>
                          {property.baths} Baths
                        </span>
                        <span className="text-gray-200 dark:text-white/10">•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-xs">square_foot</span>
                          {property.size} sqft
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
                    Monthly: {estimateMonthly(property.price)}
                  </p>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-4">
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
                      ? "Featured"
                      : property.action === "Buy"
                      ? "For Sale"
                      : "For Rent"}
                  </button>
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
                      title="Delete property"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer"
                    >
                      <span className="material-icons text-base">delete_outline</span>
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
          <p className="font-medium">No properties found.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "../i18n/I18nProvider";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  badge: string;
  action: string;
}

export default function PropertyGallery({
  images,
  title,
  badge,
  action,
}: PropertyGalleryProps) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ensure we always have at least one image
  const validImages = images && images.length > 0 ? images : ["/placeholder.jpg"];
  const currentImage = validImages[selectedIndex] || validImages[0];

  const actionLabel = action === "Buy" ? t.hero.tabSale : action === "Rent" ? t.hero.tabRent : action;
  const viewPhotosLabel = (t.properties as Record<string, string>).viewAllPhotos
    ? (t.properties as Record<string, string>).viewAllPhotos.replace("{count}", String(validImages.length))
    : `View All Photos (${validImages.length})`;

  return (
    <div className="lg:col-span-8 space-y-4">
      {/* Main Display Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-card-bg">
        <Image
          src={currentImage}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          fill
          priority
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {actionLabel}
          </span>
          {badge && (
            <span className="bg-card-bg/90 backdrop-blur-md text-nordic-dark text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {badge}
            </span>
          )}
        </div>

        {/* View All Photos Button overlay */}
        <button
          onClick={() => {
            // Cycle to next photo on click
            setSelectedIndex((prev) => (prev + 1) % validImages.length);
          }}
          className="absolute bottom-4 right-4 bg-card-bg/90 hover:bg-card-bg text-nordic-dark px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-md transition-all flex items-center gap-2 z-10 cursor-pointer active:scale-95"
        >
          <span className="material-icons text-sm">grid_view</span>
          <span>{viewPhotosLabel}</span>
        </button>
      </div>

      {/* Thumbnails Carousel */}
      {validImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 snap-x pt-1">
          {validImages.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer relative snap-start transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-mosque ring-offset-2 ring-offset-background-light opacity-100 scale-[0.98]"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  className="w-full h-full object-cover"
                  sizes="192px"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "../types/property";
import { togglePropertyFeatured } from "@/app/actions/properties";

interface PropertyCardProps {
  property: Property;
  className?: string;
  priority?: boolean;
}

export default function PropertyCard({ property, className = "", priority = false }: PropertyCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const isRent = property.action === "Rent";

  return (
    <Link href={`/propiedades/${property.slug}`} className="block h-full">
      <article
        className={`bg-card-bg rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer flex flex-col h-full ${className}`}
      >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden w-full">
        <Image
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={property.image_url}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        
        {/* Favorite Button (toggles featured status in DB) */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (isToggling) return;
            setIsToggling(true);
            try {
              await togglePropertyFeatured(property.id, property.is_featured);
            } catch (err) {
              console.error("Failed to toggle featured status:", err);
            } finally {
              setIsToggling(false);
            }
          }}
          disabled={isToggling}
          className="absolute top-3 right-3 z-10 p-2 bg-card-bg/90 rounded-full hover:bg-mosque hover:text-white transition-all active:scale-90 shadow-md text-nordic-dark disabled:opacity-75"
          title={property.is_featured ? "Remove from Featured" : "Add to Featured"}
        >
          <span className={`material-icons text-lg leading-none flex items-center justify-center ${isToggling ? "animate-spin" : property.is_featured ? "text-rose-500" : ""}`}>
            {isToggling ? "sync" : property.is_featured ? "favorite" : "favorite_border"}
          </span>
        </button>
        
        {/* Transaction Type Badge */}
        <div
          className={`absolute bottom-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded tracking-wider ${
            isRent ? "bg-mosque/90" : "bg-nordic-dark/90"
          }`}
        >
          {property.badge}
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Price */}
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {formattedPrice}
            {isRent && <span className="text-xs font-normal text-nordic-muted">/mo</span>}
          </h3>
        </div>

        {/* Title */}
        <h4 className="text-nordic-dark font-medium truncate mb-1 group-hover:text-mosque transition-colors duration-200">
          {property.title}
        </h4>

        {/* Address */}
        <p className="text-nordic-muted text-xs mb-4">{property.address}</p>

        {/* Features */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-nordic-dark/10">
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">king_bed</span>
            {property.beds}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">bathtub</span>
            {property.baths}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">square_foot</span>
            {property.size}
          </div>
        </div>
      </div>
      </article>
    </Link>
  );
}

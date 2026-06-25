"use client";

import { useState } from "react";
import Image from "next/image";
import { Property } from "../types/property";

interface FeaturedCardProps {
  property: Property;
}

export default function FeaturedCard({ property }: FeaturedCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className="group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer transition-all duration-300">
      {/* Image Container */}
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        <Image
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={property.image_url}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-nordic-dark">
          {property.badge}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-nordic-dark hover:bg-mosque hover:text-white transition-all shadow-md active:scale-95"
        >
          <span className="material-icons text-xl">
            {isFavorite ? "favorite" : "favorite_border"}
          </span>
        </button>
        
        {/* Bottom Gradient overlay */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-0"></div>
      </div>

      {/* Info Content */}
      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-nordic-dark group-hover:text-mosque transition-colors duration-200">
              {property.title}
            </h3>
            <p className="text-nordic-muted text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm text-mosque">place</span>
              {property.address}
            </p>
          </div>
          <span className="text-xl font-semibold text-mosque whitespace-nowrap">
            {formattedPrice}
            {property.action === "Rent" && <span className="text-sm font-normal text-nordic-muted">/mo</span>}
          </span>
        </div>

        {/* Property Features */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-nordic-dark/5">
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg text-mosque/80">king_bed</span>
            {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg text-mosque/80">bathtub</span>
            {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg text-mosque/80">square_foot</span>
            {property.size}
          </div>
        </div>
      </div>
    </div>
  );
}

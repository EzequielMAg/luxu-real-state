export interface Property {
  id: string;
  slug: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  size: string;
  images: string[];
  lat: number;
  lng: number;
  badge: string;
  type: "House" | "Apartment" | "Villa" | "Penthouse" | "Commercial";
  action: "Buy" | "Rent";
  is_featured: boolean;
  description?: string;
  amenities?: string[];
  year_built?: number;
  parking?: number;
  is_active?: boolean;
  created_at: string;
}

export type PropertyType = Property["type"];
export type PropertyAction = Property["action"];

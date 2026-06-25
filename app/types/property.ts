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
  type: "House" | "Apartment" | "Villa" | "Penthouse";
  action: "Buy" | "Rent";
  is_featured: boolean;
  created_at: string;
}

export type PropertyType = Property["type"];
export type PropertyAction = Property["action"];

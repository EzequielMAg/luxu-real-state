export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  size: string;
  image_url: string;
  badge: string;
  type: "House" | "Apartment" | "Villa" | "Penthouse";
  action: "Buy" | "Rent";
  is_featured: boolean;
  created_at: string;
}

export type PropertyType = Property["type"];
export type PropertyAction = Property["action"];

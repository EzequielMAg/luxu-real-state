"use server";

import { supabase } from "@/lib/supabase";
import { Property, PropertyAction, PropertyType } from "@/app/types/property";
import { revalidatePath } from "next/cache";

const PROPERTIES_PER_PAGE = 8;

interface GetPropertiesParams {
  page?: number;
  type?: PropertyType | "All";
  action?: PropertyAction | "All";
  search?: string;
}

interface GetPropertiesResult {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Server-side function to fetch paginated non-featured properties from Supabase.
 */
export async function getProperties({
  page = 1,
  type = "All",
  action = "All",
  search = "",
}: GetPropertiesParams = {}): Promise<GetPropertiesResult> {
  const from = (page - 1) * PROPERTIES_PER_PAGE;
  const to = from + PROPERTIES_PER_PAGE - 1;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("is_featured", false)
    .order("created_at", { ascending: false });

  if (type && type !== "All") {
    query = query.eq("type", type);
  }

  if (action && action !== "All") {
    query = query.eq("action", action);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,address.ilike.%${search}%`
    );
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching properties:", error);
    return { properties: [], total: 0, page, totalPages: 0 };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PROPERTIES_PER_PAGE);

  return {
    properties: (data as Property[]) ?? [],
    total,
    page,
    totalPages,
  };
}

/**
 * Server-side function to fetch all featured properties from Supabase.
 */
export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching featured properties:", error);
    return [];
  }

  return (data as Property[]) ?? [];
}

/**
 * Server Action to toggle the 'is_featured' status of a property.
 */
export async function togglePropertyFeatured(
  propertyId: string,
  currentFeaturedStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("properties")
    .update({ is_featured: !currentFeaturedStatus })
    .eq("id", propertyId);

  if (error) {
    console.error("Error toggling featured status:", error);
    return { success: false, error: error.message };
  }

  // Revalidate the home page so lists are updated immediately
  revalidatePath("/");
  return { success: true };
}

/**
 * Server-side function to fetch a single property by slug from Supabase.
 */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(`Error fetching property with slug "${slug}":`, error);
    return null;
  }

  return (data as Property) ?? null;
}

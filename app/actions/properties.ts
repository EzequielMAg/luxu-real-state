"use server";

import { supabase } from "@/lib/supabase";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Property, PropertyAction, PropertyType } from "@/app/types/property";
import { revalidatePath } from "next/cache";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "[getAdminSupabase] SUPABASE_SERVICE_ROLE_KEY no está configurado en las variables de entorno del servidor."
    );
  }
  return createAdminClient(url, key, { auth: { persistSession: false } });
}

const PROPERTIES_PER_PAGE = 8;

interface GetPropertiesParams {
  page?: number;
  limit?: number;
  type?: PropertyType | "All";
  action?: PropertyAction | "All";
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  includeInactive?: boolean;
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
  limit,
  type = "All",
  action = "All",
  search = "",
  minPrice,
  maxPrice,
  beds,
  baths,
  amenities,
  includeInactive = false,
}: GetPropertiesParams = {}): Promise<GetPropertiesResult> {
  const pageSize = limit ?? PROPERTIES_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
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

  if (minPrice !== undefined && !isNaN(minPrice)) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    query = query.lte("price", maxPrice);
  }

  if (beds !== undefined && !isNaN(beds) && beds > 0) {
    query = query.gte("beds", beds);
  }

  if (baths !== undefined && !isNaN(baths) && baths > 0) {
    query = query.gte("baths", baths);
  }

  if (amenities && amenities.length > 0) {
    query = query.contains("amenities", amenities);
  }

  if (!includeInactive) {
    query = query.neq("is_active", false);
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching properties:", error);
    return { properties: [], total: 0, page, totalPages: 0 };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

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
    .neq("is_active", false)
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
 * Server Action to toggle the 'is_active' status of a property (activate / deactivate).
 */
export async function togglePropertyActive(
  propertyId: string,
  currentActiveStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  const adminClient = getAdminSupabase();
  const newStatus = !currentActiveStatus;

  const updateData: any = { is_active: newStatus };
  if (!newStatus) {
    updateData.is_featured = false;
  }

  const { error } = await adminClient
    .from("properties")
    .update(updateData)
    .eq("id", propertyId);

  if (error) {
    console.error("Error toggling active status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
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

/**
 * Server-side function to fetch a single property by ID from Supabase.
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const adminClient = getAdminSupabase();
  const { data, error } = await adminClient
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching property with id "${id}":`, error);
    return null;
  }

  return (data as Property) ?? null;
}

/**
 * Server Action to upload an image to Supabase Storage bucket 'property-images'.
 */
export async function uploadPropertyImage(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No image provided" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    const adminClient = getAdminSupabase();
    const { data, error } = await adminClient.storage
      .from("property-images")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading to storage:", error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = adminClient.storage
      .from("property-images")
      .getPublicUrl(fileName);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Exception in uploadPropertyImage:", err);
    return { success: false, error: err?.message || "Error uploading image" };
  }
}

/**
 * Helper to generate URL slug from title.
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return base ? `${base}-${Math.floor(1000 + Math.random() * 9000)}` : `property-${Date.now()}`;
}

/**
 * Server Action to create a new property.
 */
export async function createProperty(
  payload: Partial<Property>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const adminClient = getAdminSupabase();

    if (!payload.title || !payload.title.trim()) {
      return { success: false, error: "El título de la propiedad es obligatorio." };
    }
    if (!payload.price || Number(payload.price) <= 0) {
      return { success: false, error: "El precio debe ser un número mayor a 0." };
    }
    if (!payload.address || !payload.address.trim() || payload.address === "Specified Address") {
      return { success: false, error: "La dirección de la propiedad es obligatoria." };
    }
    if (!payload.size || !payload.size.trim() || Number(payload.size) <= 0 || payload.size === "0" || payload.size === "2500") {
      return { success: false, error: "El área de la propiedad es obligatoria y debe ser mayor a 0." };
    }
    if (!payload.images || !Array.isArray(payload.images) || payload.images.length === 0) {
      return { success: false, error: "Debes subir al menos una imagen para publicar la propiedad." };
    }

    const title = payload.title.trim();
    const slug = payload.slug || generateSlug(title);

    const insertData = {
      ...payload,
      title,
      slug,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await adminClient
      .from("properties")
      .insert([insertData])
      .select("id")
      .single();

    if (error) {
      console.error("Error creating property:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("Exception in createProperty:", err);
    return { success: false, error: err?.message || "Failed to create property" };
  }
}

/**
 * Server Action to update an existing property.
 */
export async function updateProperty(
  id: string,
  payload: Partial<Property>
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = getAdminSupabase();

    if (payload.title !== undefined && (!payload.title || !payload.title.trim())) {
      return { success: false, error: "El título de la propiedad es obligatorio." };
    }
    if (payload.price !== undefined && (!payload.price || Number(payload.price) <= 0)) {
      return { success: false, error: "El precio debe ser un número mayor a 0." };
    }
    if (payload.address !== undefined && (!payload.address || !payload.address.trim() || payload.address === "Specified Address")) {
      return { success: false, error: "La dirección de la propiedad es obligatoria." };
    }
    if (payload.size !== undefined && (!payload.size || !payload.size.trim() || Number(payload.size) <= 0 || payload.size === "0" || payload.size === "2500")) {
      return { success: false, error: "El área de la propiedad es obligatoria y debe ser mayor a 0." };
    }
    if (payload.images !== undefined && (!Array.isArray(payload.images) || payload.images.length === 0)) {
      return { success: false, error: "La propiedad debe tener al menos una imagen." };
    }

    // Remove immutable fields if present
    const { id: _id, created_at: _created, ...updateFields } = payload as any;

    const { error } = await adminClient
      .from("properties")
      .update(updateFields)
      .eq("id", id);

    if (error) {
      console.error("Error updating property:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");
    if (payload.slug) {
      revalidatePath(`/propiedades/${payload.slug}`);
    }
    return { success: true };
  } catch (err: any) {
    console.error("Exception in updateProperty:", err);
    return { success: false, error: err?.message || "Failed to update property" };
  }
}

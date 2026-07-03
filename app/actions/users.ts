"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { UserWithRole, AppRole } from "@/app/types/user";

/**
 * Obtiene todos los usuarios con sus roles desde la vista segura users_view.
 * Solo los admins pueden ver todos los usuarios (protegido por RLS).
 */
export async function getUsers(): Promise<UserWithRole[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users_view")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return (data as UserWithRole[]) ?? [];
}

/**
 * Actualiza el rol de un usuario en la tabla user_roles.
 * Usa el cliente admin (service_role) para actualizar raw_app_meta_data
 * en auth.users, de forma que el JWT lleve el nuevo rol en el próximo refresh.
 */
export async function updateUserRole(
  userId: string,
  role: AppRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Medida de seguridad: impedir que un admin se quite el rol de admin a sí mismo
  if (user && user.id === userId && role !== "admin") {
    return {
      success: false,
      error: "You cannot remove or change your own administrator access for security reasons.",
    };
  }

  // 1. Actualizar la tabla user_roles con el cliente normal (respeta RLS)
  const { error: roleError } = await supabase
    .from("user_roles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (roleError) {
    console.error("Error updating user_roles:", roleError);
    return { success: false, error: roleError.message };
  }

  // 2. Actualizar raw_app_meta_data usando el cliente admin (service_role)
  //    para que el JWT refleje el nuevo rol en la próxima sesión
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: metaError } = await adminClient.auth.admin.updateUserById(
    userId,
    { app_metadata: { app_role: role } }
  );

  if (metaError) {
    console.error("Error updating app_metadata:", metaError);
    // No fallamos aquí: el rol en la tabla está actualizado, el JWT
    // se sincronizará en el próximo refresh de sesión
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

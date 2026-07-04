import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/app/dashboard/components/DashboardNavbar";

export const dynamic = "force-dynamic";

/**
 * Layout del dashboard: navbar horizontal en la parte superior.
 * Segunda capa de defensa: verifica sesión + rol admin.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const appRole = user.app_metadata?.app_role;
  if (appRole !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#f0f4f1] dark:bg-[#0d1f1b]">
      <DashboardNavbar user={user} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

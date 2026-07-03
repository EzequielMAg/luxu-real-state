import { getUsers } from "@/app/actions/users";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, hasLocale, defaultLocale, Locale } from "@/app/dictionaries";
import { cookies } from "next/headers";
import UsersTable from "@/app/dashboard/components/UsersTable";

export const metadata = {
  title: "Users — LuxeEstate Admin",
};

export default async function UsersPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = hasLocale(localeCookie) ? localeCookie : defaultLocale;
  const t = await getDictionary(locale);
  const d = (t as any).dashboard;

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const users = await getUsers();

  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {d?.usersTitle ?? "User Roles Management"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
            {d?.usersSubtitle ?? "Manage roles of authenticated users"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0a1a17] rounded-2xl p-5 border border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-white/40 mb-1">
              {d?.totalUsers ?? "Total Users"}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-mosque/10">
            <span className="material-icons text-xl text-mosque dark:text-[#4db8a0]">group</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0a1a17] rounded-2xl p-5 border border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-white/40 mb-1">
              {d?.adminUsers ?? "Admin Users"}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{adminUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/20">
            <span className="material-icons text-xl text-amber-600 dark:text-amber-400">admin_panel_settings</span>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-[#0a1a17] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <UsersTable
          users={users}
          currentUserId={currentUser?.id ?? ""}
        />
      </div>
    </>
  );
}

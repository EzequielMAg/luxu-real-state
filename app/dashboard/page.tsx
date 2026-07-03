import { getProperties } from "@/app/actions/properties";
import { getDictionary, hasLocale, defaultLocale, Locale } from "@/app/dictionaries";
import { cookies } from "next/headers";
import PropertiesTable from "@/app/dashboard/components/PropertiesTable";

export const metadata = {
  title: "Dashboard — LuxeEstate Admin",
};

const PAGE_SIZE = 5;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search ?? "";

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = hasLocale(localeCookie) ? localeCookie : defaultLocale;
  const t = await getDictionary(locale);
  const d = (t as any).dashboard;

  const { properties, total, totalPages } = await getProperties({
    page: currentPage,
    limit: PAGE_SIZE,
    search,
  });

  // Stats: para las cards usamos getProperties sin filtro
  const { total: totalAll } = await getProperties({ page: 1, limit: 100 });
  const { properties: allForStats } = await getProperties({ page: 1, limit: 100 });
  const featuredCount = allForStats.filter((p) => p.is_featured).length;
  const buyCount = allForStats.filter((p) => p.action === "Buy").length;

  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {d?.propertiesTitle ?? "My Properties"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
            {d?.propertiesSubtitle ?? "Manage your portfolio and track performance."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-white/70 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
            <span className="material-icons text-base">tune</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mosque text-white text-sm font-semibold hover:bg-mosque/90 transition-all shadow-sm shadow-mosque/20">
            <span className="material-icons text-base">add</span>
            Add New Property
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon="grid_view"
          label={d?.totalProperties ?? "Total Listings"}
          value={totalAll}
          iconBg="bg-mosque/10"
          iconColor="text-mosque dark:text-[#4db8a0]"
        />
        <StatCard
          icon="check_circle"
          label={d?.featured ?? "Featured"}
          value={featuredCount}
          iconBg="bg-green-50 dark:bg-green-900/20"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon="sell"
          label="For Sale"
          value={buyCount}
          iconBg="bg-orange-50 dark:bg-orange-900/20"
          iconColor="text-orange-500 dark:text-orange-400"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#0a1a17] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <PropertiesTable properties={properties} />

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/5">
          <p className="text-sm text-gray-500 dark:text-white/40">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {from}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {to}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {total}
            </span>{" "}
            results
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={`/dashboard?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
              aria-disabled={currentPage <= 1}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                currentPage <= 1
                  ? "border-gray-100 dark:border-white/5 text-gray-300 dark:text-white/20 cursor-not-allowed pointer-events-none"
                  : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
              title="Previous page"
            >
              <span className="material-icons text-sm">chevron_left</span>
            </a>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <a
                key={pageNum}
                href={`/dashboard?page=${pageNum}${search ? `&search=${search}` : ""}`}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  pageNum === currentPage
                    ? "bg-mosque dark:bg-[#11302b] text-white shadow-sm shadow-mosque/20"
                    : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {pageNum}
              </a>
            ))}

            <a
              href={`/dashboard?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
              aria-disabled={currentPage >= totalPages}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                currentPage >= totalPages
                  ? "border-gray-100 dark:border-white/5 text-gray-300 dark:text-white/20 cursor-not-allowed pointer-events-none"
                  : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
              title="Next page"
            >
              <span className="material-icons text-sm">chevron_right</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: string;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-[#0a1a17] rounded-2xl p-5 border border-gray-200 dark:border-white/10 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
        <span className={`material-icons text-xl ${iconColor}`}>{icon}</span>
      </div>
    </div>
  );
}

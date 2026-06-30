import { Suspense } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedCard from "./components/FeaturedCard";
import PropertyCard from "./components/PropertyCard";
import PaginationControls from "./components/PaginationControls";
import ActionFilterClient from "./components/ActionFilter";
import { getProperties, getFeaturedProperties } from "./actions/properties";
import { Property, PropertyType, PropertyAction } from "./types/property";

// Force dynamic rendering so the page always re-fetches on every request.
// Without this, Next.js caches the server output and ignores URL query changes
// (e.g. ?page=2, ?type=Villa) — making pagination and filters appear broken.
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    action?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const type = (params.type as PropertyType | undefined) ?? "All";
  const action = (params.action as PropertyAction | undefined) ?? "All";
  const search = params.search ?? "";

  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const beds = params.beds ? parseInt(params.beds, 10) : undefined;
  const baths = params.baths ? parseFloat(params.baths) : undefined;
  const amenities = params.amenities ? params.amenities.split(",") : undefined;

  const isFilterOrSearchApplied =
    type !== "All" ||
    action !== "All" ||
    search !== "" ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    beds !== undefined ||
    baths !== undefined ||
    (amenities !== undefined && amenities.length > 0);

  // Fetch data server-side in parallel
  const [featuredProperties, { properties, total, totalPages }] =
    await Promise.all([
      isFilterOrSearchApplied ? Promise.resolve([] as Property[]) : getFeaturedProperties(),
      getProperties({
        page,
        type,
        action,
        search,
        minPrice,
        maxPrice,
        beds,
        baths,
        amenities,
      }),
    ]);

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section — Client Component (handles URL-based filters) */}
        <Suspense fallback={<div className="py-12 md:py-16" />}>
          <Hero />
        </Suspense>

        {/* Featured Collections Section */}
        {!isFilterOrSearchApplied && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-light text-nordic-dark">
                  Featured Collections
                </h2>
                <p className="text-nordic-muted mt-1 text-sm">
                  Curated properties for the discerning eye.
                </p>
              </div>
              <a
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
                href="#"
              >
                View all{" "}
                <span className="material-icons text-sm">arrow_forward</span>
              </a>
            </div>

            {featuredProperties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredProperties.slice(0, 2).map((property) => (
                  <FeaturedCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-card-bg rounded-xl border border-dashed border-nordic-dark/10">
                <span className="material-icons text-4xl text-nordic-muted mb-2">
                  find_in_page
                </span>
                <p className="text-nordic-muted">
                  No featured properties found.
                </p>
              </div>
            )}
          </section>
        )}

        {/* New in Market Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">
                New in Market
              </h2>
              <p className="text-nordic-muted mt-1 text-sm">
                Fresh opportunities added this week.
              </p>
            </div>

            {/* Top Pagination Controls (Compact & Centered) */}
            {properties.length > 0 && (
              <Suspense fallback={null}>
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  compact={true}
                  className="md:mx-auto"
                />
              </Suspense>
            )}

            {/* Transaction Type Filters (All, Buy, Rent) — URL-based Client Component */}
            <div className="flex justify-end">
              <Suspense fallback={null}>
                <ActionFilterClient currentAction={action} />
              </Suspense>
            </div>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-card-bg rounded-xl border border-dashed border-nordic-dark/10">
              <span className="material-icons text-4xl text-nordic-muted mb-2">
                search_off
              </span>
              <p className="text-nordic-muted">
                No properties found matching your criteria.
              </p>
            </div>
          )}

          {/* Server-side Pagination */}
          <Suspense fallback={null}>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={total}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

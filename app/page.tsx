"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedCard from "./components/FeaturedCard";
import PropertyCard from "./components/PropertyCard";
import { mockProperties } from "./data/properties";

export default function Home() {
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<"All" | "Buy" | "Rent">("All");
  const [showExtra, setShowExtra] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter logic for Featured Collections
  const filteredFeatured = mockProperties.filter((p) => {
    if (!p.isFeatured) return false;

    const matchesCategory = category === "All" || p.type === category;
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Filter logic for New in Market
  const filteredNewInMarket = mockProperties.filter((p) => {
    if (p.isFeatured) return false;
    
    // Hide extra properties if they haven't been loaded yet
    if (p.isExtra && !showExtra) return false;

    const matchesCategory = category === "All" || p.type === category;
    const matchesAction = actionFilter === "All" || p.action === actionFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesAction && matchesSearch;
  });

  // Simulating load more properties
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setShowExtra(true);
      setIsLoadingMore(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section */}
        <Hero
          selectedCategory={category}
          onCategoryChange={setCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Featured Collections Section */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">Featured Collections</h2>
              <p className="text-nordic-muted mt-1 text-sm">Curated properties for the discerning eye.</p>
            </div>
            <a
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
              href="#"
            >
              View all <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          {filteredFeatured.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredFeatured.map((property) => (
                <FeaturedCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-xl border border-dashed border-nordic-dark/10">
              <span className="material-icons text-4xl text-nordic-muted mb-2">find_in_page</span>
              <p className="text-nordic-muted">No featured properties found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* New in Market Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
              <p className="text-nordic-muted mt-1 text-sm">Fresh opportunities added this week.</p>
            </div>
            
            {/* Transaction Type Filters (All, Buy, Rent) */}
            <div className="hidden md:flex bg-white p-1 rounded-lg border border-nordic-dark/5">
              {(["All", "Buy", "Rent"] as const).map((filter) => {
                const isActive = actionFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActionFilter(filter)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-mosque text-white shadow-sm"
                        : "text-nordic-muted hover:text-nordic-dark"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredNewInMarket.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNewInMarket.map((property, idx) => {
                // Apply responsive hidden classes for elements 5 and 6 if they are part of the original layout flow
                let responsiveClass = "";
                if (property.id === "new-5") {
                  responsiveClass = "hidden xl:flex";
                } else if (property.id === "new-6") {
                  responsiveClass = "hidden lg:flex";
                }
                
                return (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    className={responsiveClass}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-xl border border-dashed border-nordic-dark/10">
              <span className="material-icons text-4xl text-nordic-muted mb-2">search_off</span>
              <p className="text-nordic-muted">No properties found matching your criteria.</p>
            </div>
          )}

          {/* Load More Button */}
          {!showExtra && filteredNewInMarket.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark font-medium rounded-lg transition-all hover:shadow-md active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
              >
                {isLoadingMore ? (
                  <>
                    <span className="material-icons animate-spin text-lg">sync</span>
                    Loading...
                  </>
                ) : (
                  "Load more properties"
                )}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

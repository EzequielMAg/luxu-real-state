import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import PropertyGallery from "@/app/components/PropertyGallery";
import PropertyMapClient from "@/app/components/PropertyMapClient";
import { getPropertyBySlug } from "@/app/actions/properties";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

// SEO y Open Graph dinámicos por propiedad
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return { title: "Property Not Found | LuxeEstate" };
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return {
    title: `${property.title} (${formattedPrice}) | LuxeEstate`,
    description: `Discover ${property.title} located at ${property.address}. Featuring ${property.beds} bedrooms, ${property.baths} bathrooms, and ${property.size} of premium living space.`,
    openGraph: {
      title: `${property.title} - ${formattedPrice}`,
      description: `Modern luxury real estate at ${property.address}.`,
      images: [
        {
          url: property.images[0],
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: "website",
    },
  };
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const isRent = property.action === "Rent";

  // Schema.org Rich Snippets JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: `Modern luxury ${property.type.toLowerCase()} located at ${property.address}.`,
    image: property.images,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
    },
    numberOfRooms: property.beds,
  };

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark transition-colors duration-300">
      <Navbar />

      {/* Rich Snippet Injected into DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Image Collection Gallery (col-span-8) */}
          <PropertyGallery
            images={property.images}
            title={property.title}
            badge={property.badge}
            action={property.action}
          />

          {/* Right Column: Sticky Sidebar Box (col-span-4) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              {/* Price & Agent Card */}
              <div className="bg-card-bg p-6 rounded-xl shadow-sm border border-nordic-dark/10">
                <div className="mb-4">
                  <h1 className="text-4xl font-display font-light text-nordic-dark mb-2">
                    {formattedPrice}
                    {isRent && <span className="text-lg font-normal text-nordic-muted">/mo</span>}
                  </h1>
                  <p className="text-nordic-muted font-medium flex items-center gap-1 text-sm">
                    <span className="material-icons text-mosque text-sm">location_on</span>
                    <span>{property.address}</span>
                  </p>
                </div>

                <div className="h-px bg-nordic-dark/10 my-6"></div>

                {/* Agent Profile */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-card-bg shadow-sm relative flex-shrink-0 bg-mosque/10">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w"
                      alt="Sarah Jenkins"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nordic-dark">Sarah Jenkins</h3>
                    <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                      <span className="material-icons text-[14px]">star</span>
                      <span>Top Rated Agent</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer">
                      <span className="material-icons text-sm">chat</span>
                    </button>
                    <button className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors cursor-pointer">
                      <span className="material-icons text-sm">call</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-mosque hover:bg-mosque/90 text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]">
                    <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                      calendar_today
                    </span>
                    <span>Schedule Visit</span>
                  </button>
                  <button className="w-full bg-transparent border border-nordic-dark/15 hover:border-mosque text-nordic-dark hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]">
                    <span className="material-icons text-xl">mail_outline</span>
                    <span>Contact Agent</span>
                  </button>
                </div>
              </div>

              {/* Map Box */}
              <div className="bg-card-bg p-2 rounded-xl shadow-sm border border-nordic-dark/10">
                <PropertyMapClient
                  lat={Number(property.lat) || 37.4419}
                  lng={Number(property.lng) || -122.1430}
                  title={property.title}
                  address={property.address}
                />
              </div>
            </div>
          </div>

          {/* Bottom Content Area (col-span-8 row-start-2 -mt-8 space-y-8) */}
          <div className="lg:col-span-8 lg:row-start-2 -mt-8 space-y-8">
            {/* Property Features */}
            <div className="bg-card-bg p-8 rounded-xl shadow-sm border border-nordic-dark/10">
              <h2 className="text-lg font-semibold mb-6 text-nordic-dark">
                Property Features
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">
                    square_foot
                  </span>
                  <span className="text-xl font-bold text-nordic-dark">{property.size}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-muted">
                    Total Area
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.beds}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-muted">
                    Bedrooms
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.baths}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-muted">
                    Bathrooms
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">
                    directions_car
                  </span>
                  <span className="text-xl font-bold text-nordic-dark">2</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-muted">
                    Garage
                  </span>
                </div>
              </div>
            </div>

            {/* About this home */}
            <div className="bg-card-bg p-8 rounded-xl shadow-sm border border-nordic-dark/10">
              <h2 className="text-lg font-semibold mb-4 text-nordic-dark">
                About this home
              </h2>
              <div className="prose prose-slate max-w-none text-nordic-muted leading-relaxed space-y-4">
                <p>
                  Experience modern luxury in this architecturally stunning {property.type.toLowerCase()} located in {property.address}. Designed with an emphasis on seamless indoor-outdoor living, the residence features refined proportions, custom finishes, and generous natural lighting throughout.
                </p>
                <p>
                  The open-concept living area integrates perfectly with state-of-the-art amenities, offering an effortless sanctuary for both private relaxation and sophisticated hosting.
                </p>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-card-bg p-8 rounded-xl shadow-sm border border-nordic-dark/10">
              <h2 className="text-lg font-semibold mb-6 text-nordic-dark">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  "Smart Home System",
                  "Swimming Pool",
                  "Central Heating & Cooling",
                  "Electric Vehicle Charging",
                  "Private Gym & Spa",
                  "Temperature Controlled Wine Cellar",
                  "24/7 Perimeter Security",
                  "High Speed Fiber Optic Ready",
                ].map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 text-nordic-dark/80">
                    <span className="material-icons text-mosque text-sm">check_circle</span>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Mortgage Payment Banner */}
            <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-card-bg rounded-full text-mosque shadow-sm flex items-center justify-center">
                  <span className="material-icons">calculate</span>
                </div>
                <div>
                  <h3 className="font-semibold text-nordic-dark">Estimated Payment</h3>
                  <p className="text-sm text-nordic-muted mt-0.5">
                    Starting from{" "}
                    <strong className="text-mosque font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(Math.round(property.price * 0.0045))}
                      /mo
                    </strong>{" "}
                    with 20% down
                  </p>
                </div>
              </div>
              <button className="whitespace-nowrap px-4 py-2.5 bg-card-bg border border-nordic-dark/15 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic-dark cursor-pointer">
                Calculate Mortgage
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-card-bg border-t border-nordic-dark/10 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-nordic-muted">
            © 2026 LuxeEstate Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

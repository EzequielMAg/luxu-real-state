import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import PropertyCard from "@/app/components/PropertyCard";
import { getFeaturedProperties } from "@/app/actions/properties";

export default async function PropertyNotFound() {
  const similarProperties = await getFeaturedProperties();

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="w-20 h-20 bg-mosque/10 rounded-full flex items-center justify-center mx-auto mb-6 text-mosque border border-mosque/20">
            <span className="material-icons text-4xl">home_work</span>
          </div>
          
          <h1 className="text-3xl font-display font-light text-nordic-dark mb-4">
            Propiedad no encontrada
          </h1>
          
          <p className="text-nordic-muted text-base leading-relaxed mb-8">
            Probablemente esta propiedad exclusiva ya se vendió o rentó. Sin embargo, en LuxeEstate mantenemos un catálogo selecto en constante actualización para satisfacer tus exigencias.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mosque text-white rounded-lg font-medium hover:bg-mosque/90 transition-all shadow-md"
          >
            <span className="material-icons text-sm">arrow_back</span>
            <span>Explorar todas las propiedades</span>
          </Link>
        </div>

        {similarProperties.length > 0 && (
          <section className="w-full border-t border-nordic-dark/10 pt-12">
            <h2 className="text-2xl font-light text-nordic-dark mb-2 text-center sm:text-left">
              Propiedades exclusivas similares en la zona
            </h2>
            <p className="text-nordic-muted text-sm mb-8 text-center sm:text-left">
              Oportunidades destacadas disponibles para visitar hoy mismo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.slice(0, 4).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

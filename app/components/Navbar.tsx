"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Al montar, leemos la preferencia del localStorage o del sistema
  useEffect(() => {
    setMounted(true);
    const localTheme = localStorage.getItem("theme");
    const isDark =
      localTheme === "dark" ||
      (!localTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Sincronizamos la clase "dark" en el html y body cada vez que el tema cambia
  useEffect(() => {
    if (!mounted) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">LuxeEstate</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="#">
              Buy
            </a>
            <a
              className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
              href="#"
            >
              Rent
            </a>
            <a
              className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
              href="#"
            >
              Sell
            </a>
            <a
              className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
              href="#"
            >
              Saved Homes
            </a>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <button className="text-nordic-dark hover:text-mosque transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="text-nordic-dark hover:text-mosque transition-colors flex items-center justify-center p-1.5 rounded-lg hover:bg-nordic-dark/5 transition-all active:scale-90"
              title="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <span className="material-icons">light_mode</span>
                ) : (
                  <span className="material-icons">dark_mode</span>
                )
              ) : (
                <span className="material-icons opacity-0">dark_mode</span>
              )}
            </button>
            
            {/* Profile */}
            <button className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2">
              <div className="w-9 h-9 rounded-full bg-nordic-dark/10 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all relative">
                <Image
                  alt="Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                  width={36}
                  height={36}
                />
              </div>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-nordic-dark hover:text-mosque transition-colors"
            >
              <span className="material-icons">{mobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-56" : "max-h-0"
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          <a className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10" href="#">
            Buy
          </a>
          <a
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-nordic-dark/5"
            href="#"
          >
            Rent
          </a>
          <a
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-nordic-dark/5"
            href="#"
          >
            Sell
          </a>
          <a
            className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-nordic-dark/5"
            href="#"
          >
            Saved Homes
          </a>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTranslation } from "../i18n/I18nProvider";

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
  address: string;
}

export default function PropertyMap({ lat, lng, title, address }: PropertyMapProps) {
  const { t } = useTranslation();
  const [showMapModal, setShowMapModal] = useState(false);
  const mapLabel = (t.properties as Record<string, any>).viewOnGoogleMaps || "View on Google Maps";
  const closeLabel = (t.properties as Record<string, any>).closeMap || "Cerrar mapa";
  const pf = (t.propertyForm as Record<string, any>) || {};
  const expandLabel = pf.geocodeExpand || "Ver mapa completo";

  useEffect(() => {
    if (showMapModal && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showMapModal]);

  // Custom HTML DivIcon matching the animated bouncing home design from code.html
  const customMarkerIcon = L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="width: 32px; height: 32px; background-color: #006655; border-radius: 9999px; border: 4px solid #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%); animation: bounce 1s infinite;">
        <span class="material-icons" style="color: #ffffff; font-size: 14px;">home</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-nordic-dark/40">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={customMarkerIcon}>
          <Popup>
            <div className="font-sans text-xs font-semibold text-nordic-dark">
              {title}
              <br />
              <span className="font-normal text-gray-500">{address}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Expand Map Button */}
      <button
        type="button"
        onClick={() => setShowMapModal(true)}
        title={expandLabel}
        className="absolute top-2 right-2 z-[400] flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 dark:bg-nordic/90 text-nordic dark:text-white shadow-md hover:bg-white dark:hover:bg-nordic/70 transition-all cursor-pointer backdrop-blur-sm"
      >
        <span className="material-icons text-base">fullscreen</span>
      </button>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-card-bg/90 backdrop-blur-md text-xs font-medium px-2.5 py-1 rounded shadow-sm text-nordic-dark hover:text-mosque transition-colors z-[400]"
      >
        {mapLabel}
      </a>

      {/* Fullscreen Map Modal via Portal */}
      {showMapModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setShowMapModal(false)}
          >
            <div
              className="bg-white dark:bg-[#0a1a17] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-2 overflow-hidden mr-4">
                  <span className="material-icons text-mosque text-xl flex-shrink-0">place</span>
                  <h3 className="font-bold text-nordic dark:text-white font-sf text-sm sm:text-base truncate">
                    {title} — <span className="font-normal text-gray-500 dark:text-white/60">{address}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  title={closeLabel}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 transition-colors cursor-pointer flex-shrink-0"
                >
                  <span className="material-icons text-lg">close</span>
                </button>
              </div>

              {/* Modal Map */}
              <div className="flex-1 w-full h-full relative">
                <MapContainer
                  center={[lat, lng]}
                  zoom={16}
                  scrollWheelZoom={true}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]} icon={customMarkerIcon}>
                    <Popup>
                      <div className="font-sans text-xs font-semibold text-nordic-dark">
                        {title}
                        <br />
                        <span className="font-normal text-gray-500">{address}</span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-gray-500 dark:text-white/60">
                <div>
                  <span className="font-bold text-mosque">Lat:</span> {lat.toFixed(6)} | <span className="font-bold text-mosque">Lng:</span> {lng.toFixed(6)}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded border border-gray-200 dark:border-white/10 text-nordic dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-sans font-medium transition-colors"
                  >
                    {mapLabel}
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowMapModal(false)}
                    className="px-4 py-1.5 rounded bg-mosque text-white font-sf font-semibold hover:bg-mosque/80 transition-colors cursor-pointer"
                  >
                    {pf.saveBtn || "Listo"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

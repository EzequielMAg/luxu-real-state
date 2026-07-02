"use client";

import { useEffect } from "react";
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
  const mapLabel = (t.properties as Record<string, string>).viewOnGoogleMaps || "View on Google Maps";

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
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-nordic-dark/40 z-0">
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

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-card-bg/90 backdrop-blur-md text-xs font-medium px-2.5 py-1 rounded shadow-sm text-nordic-dark hover:text-mosque transition-colors z-[400]"
      >
        {mapLabel}
      </a>
    </div>
  );
}

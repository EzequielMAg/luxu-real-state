"use client";

import { useEffect, useRef } from "react";

interface LeafletMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function LeafletMap({ lat, lng, zoom = 15, height = "100%", onLocationSelect }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onSelectRef = useRef(onLocationSelect);

  // Keep latest ref
  useEffect(() => {
    onSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon paths (Leaflet webpack issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) {
        // Map already exists → just update marker + view
        mapRef.current.setView([lat, lng], zoom);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        return;
      }

      // Create map
      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      // Listen to map clicks
      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        if (onSelectRef.current) {
          onSelectRef.current(clickLat, clickLng);
        }
      });

      // Listen to marker dragging
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        if (onSelectRef.current) {
          onSelectRef.current(pos.lat, pos.lng);
        }
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    // Inject Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker+view when lat/lng change without remounting
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    mapRef.current.setView([lat, lng], zoom);
    markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng, zoom]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height }} 
      className="cursor-crosshair"
      title="Haz clic o arrastra el marcador para seleccionar la ubicación"
    />
  );
}


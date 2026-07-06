import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationData, WorkerProfile } from '../drivers/DatabaseDriver';

interface MapSelectorProps {
  mode: 'select' | 'view';
  center: { lat: number; lng: number };
  workers?: WorkerProfile[];
  radius?: number; // in kilometers
  onLocationChange?: (location: Partial<LocationData>) => void;
  onWorkerSelect?: (worker: WorkerProfile) => void;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  mode,
  center,
  workers = [],
  radius = 5,
  onLocationChange,
  onWorkerSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const workerMarkersRef = useRef<L.Marker[]>([]);

  // Custom SVG Icons for markers to prevent default leaflet icon resolution errors in Vite
  const userIcon = L.divIcon({
    html: `<div class="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const workerIcon = (availability: string) => {
    const color = availability === 'Available' ? 'bg-secondary' : availability === 'Busy' ? 'bg-accent' : 'bg-red-500';
    return L.divIcon({
      html: `<div class="w-8 h-8 ${color} rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
             </div>`,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([center.lat, center.lng], 13);

      // Add zoom controls at custom position
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      // Setup beautiful light tile layers from OpenStreetMap / CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

      // If mode is 'select', allow user to click on map to move marker
      if (mode === 'select' && onLocationChange) {
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          // Query reverse geocoding mocks
          reverseGeocodeMock(lat, lng);
        });
      }
    } else {
      mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom());
    }

    const map = mapRef.current;

    // Manage Selection Marker
    if (mode === 'select') {
      if (markerRef.current) {
        markerRef.current.setLatLng([center.lat, center.lng]);
      } else {
        markerRef.current = L.marker([center.lat, center.lng], { icon: userIcon, draggable: true }).addTo(map);
        
        markerRef.current.on('dragend', () => {
          if (markerRef.current && onLocationChange) {
            const { lat, lng } = markerRef.current.getLatLng();
            reverseGeocodeMock(lat, lng);
          }
        });
      }
    }

    // Manage Radius Circle
    if (mode === 'view') {
      if (circleRef.current) {
        circleRef.current.setLatLng([center.lat, center.lng]);
        circleRef.current.setRadius(radius * 1000);
      } else {
        circleRef.current = L.circle([center.lat, center.lng], {
          radius: radius * 1000,
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
      }
    }

    // Geocoding simulation
    const reverseGeocodeMock = (lat: number, lng: number) => {
      // Simulate API call to geocode lat/lng to human-readable address
      setTimeout(() => {
        if (onLocationChange) {
          onLocationChange({
            lat,
            lng,
            city: "Hyderabad",
            state: "Telangana",
            village: lat > 17.4 ? "Ameerpet" : "Koti",
            pinCode: lat > 17.4 ? "500016" : "500095",
            address: `Pin dropped at Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
          });
        }
      }, 300);
    };

    // Clean up on unmount
    return () => {
      // Keep map reference cached or destroy depending on navigation
    };
  }, [center.lat, center.lng, mode]);

  // Redraw worker markers whenever workers list or map instance changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mode !== 'view') return;

    // Clear old worker markers
    workerMarkersRef.current.forEach(m => m.remove());
    workerMarkersRef.current = [];

    // Add new worker markers
    workers.forEach(w => {
      const marker = L.marker([w.location.lat, w.location.lng], { icon: workerIcon(w.availabilityStatus) })
        .addTo(map)
        .bindPopup(`
          <div class="p-1 font-sans">
            <h4 class="font-bold text-slate-800 text-sm">${w.name}</h4>
            <p class="text-xs text-primary font-medium">${w.primarySkill}</p>
            <p class="text-xs text-slate-600 mt-1">Wage: ₹${w.expectedWage}/Day</p>
            <p class="text-xs text-amber-500 font-semibold">★ ${w.rating}</p>
          </div>
        `);

      if (onWorkerSelect) {
        marker.on('click', () => {
          onWorkerSelect(w);
        });
      }

      workerMarkersRef.current.push(marker);
    });
  }, [workers, mode, onWorkerSelect]);

  // Watch for radius change
  useEffect(() => {
    if (circleRef.current && mode === 'view') {
      circleRef.current.setRadius(radius * 1000);
    }
  }, [radius, mode]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-premium border border-slate-100 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />
      {mode === 'select' && (
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md pointer-events-none text-slate-700 dark:text-slate-200 z-[1000]">
          📍 Drag the blue pin or click map to set location
        </div>
      )}
    </div>
  );
};

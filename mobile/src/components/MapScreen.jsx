import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Crosshair,
  ChevronRight,
  X,
  ShieldCheck,
  Navigation,
  ExternalLink,
  Plane,
  Search,
  Layers
} from 'lucide-react';
import L from 'leaflet';

export default function MapScreen({ properties = [], onSelectProperty }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [activeProperty, setActiveProperty] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchLocation, setSearchLocation] = useState('');

  // Parandur Airport Hub Coordinates (Kanchipuram District, Tamil Nadu)
  const parandurCenter = [12.9885, 79.7642];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(parandurCenter, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Parandur Airport Hub Golden Beacon
    const airportIcon = L.divIcon({
      className: 'airport-beacon',
      html: `
        <div style="background: linear-gradient(135deg, #064E3B 0%, #022C22 100%); color: #FDE68A; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 2px solid #D4AF37; box-shadow: 0 4px 14px rgba(6,78,59,0.4); display: flex; align-items: center; gap: 5px; white-space: nowrap;">
          <span style="display:inline-block; width:6px; height:6px; background:#10B981; border-radius:9999px;"></span>
          ✈️ Parandur Airport Hub
        </div>
      `,
      iconSize: [160, 32],
      iconAnchor: [80, 16]
    });
    L.marker([12.9920, 79.7680], { icon: airportIcon }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  // Sync Markers with Custom Emerald Price Badges
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const filtered = properties.filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (searchLocation) {
        const q = searchLocation.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.microMarket?.toLowerCase().includes(q)
        );
      }
      return true;
    });

    filtered.forEach((prop) => {
      if (!prop.coordinates?.lat || !prop.coordinates?.lng) return;

      const isSelected = activeProperty?.id === prop.id;

      // Elegant Emerald Price Tag Marker
      const priceText = prop.totalPrice || '₹21.75 L';
      const customIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div style="
            background: ${isSelected ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : 'linear-gradient(135deg, #064E3B 0%, #043828 100%)'};
            color: ${isSelected ? '#FDE68A' : '#FFFFFF'};
            border: 2px solid ${isSelected ? '#D4AF37' : 'rgba(212, 175, 55, 0.6)'};
            padding: 4px 9px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 4px 12px rgba(6,78,59,0.35);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.2s ease;
          ">
            <span>📍</span>
            <span>${priceText}</span>
          </div>
        `,
        iconSize: [85, 30],
        iconAnchor: [42, 15]
      });

      const marker = L.marker([prop.coordinates.lat, prop.coordinates.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveProperty(prop);
        map.panTo([prop.coordinates.lat, prop.coordinates.lng], { animate: true, duration: 0.5 });
      });

      markersRef.current.push(marker);
    });
  }, [properties, filterCategory, searchLocation, activeProperty]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(parandurCenter, 12, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col" style={{ minHeight: 'calc(100vh - 130px)' }}>
      {/* Top Floating Filter Bar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 20
        }}
        className="space-y-2 pointer-events-auto"
      >
        {/* Search Input Bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(197, 168, 128, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 12px'
          }}
        >
          <Search className="w-4 h-4 text-emerald-800 shrink-0" />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search Parandur, Sunguvarchatram, NH-48..."
            style={{
              height: '38px',
              paddingLeft: '10px',
              fontSize: '11px',
              color: '#0F172A',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%'
            }}
          />
          {searchLocation && (
            <button onClick={() => setSearchLocation('')} className="text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips Bar */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'All Markers' },
            { id: 'Residential Plots', label: 'Residential' },
            { id: 'Commercial Land', label: 'Commercial' },
            { id: 'Villa Community Plot', label: 'Villa' }
          ].map((c) => {
            const isActive = filterCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: '700',
                  background: isActive
                    ? 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)'
                    : 'rgba(255, 255, 255, 0.92)',
                  color: isActive ? '#FDE68A' : '#334155',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                className="active-press"
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        style={{
          position: 'absolute',
          top: '95px',
          right: '12px',
          zIndex: 20,
          padding: '8px 12px',
          borderRadius: '12px',
          background: '#FFFFFF',
          border: '1px solid rgba(197, 168, 128, 0.35)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '10px',
          fontWeight: '800',
          color: '#064E3B'
        }}
        className="active-press"
      >
        <Crosshair className="w-3.5 h-3.5 text-emerald-800" />
        <span>Recenter Hub</span>
      </button>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '620px', flex: 1, zIndex: 10 }} />

      {/* Selected Property Bottom Sheet Snapshot */}
      {activeProperty && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            left: '12px',
            right: '12px',
            zIndex: 30,
            borderRadius: '22px',
            background: '#FFFFFF',
            border: '1px solid rgba(197, 168, 128, 0.35)',
            boxShadow: '0 12px 36px rgba(6, 78, 59, 0.2)',
            padding: '14px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
          className="animate-in slide-in-from-bottom duration-200"
        >
          <img
            src={activeProperty.images?.[0] || activeProperty.image}
            alt={activeProperty.title}
            style={{ width: '70px', height: '70px', borderRadius: '14px', objectFit: 'cover' }}
            className="shrink-0 border border-slate-200"
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-[9px] font-extrabold uppercase text-emerald-800">
                {activeProperty.category}
              </span>
              <button onClick={() => setActiveProperty(null)} className="text-slate-400 p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">
              {activeProperty.title}
            </h4>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {activeProperty.location}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <span className="font-bold text-xs text-slate-900">
                {activeProperty.totalPrice}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeProperty.coordinates?.lat},${activeProperty.coordinates?.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    color: '#334155',
                    fontSize: '9px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    textDecoration: 'none'
                  }}
                  className="active-press"
                >
                  <Navigation className="w-2.5 h-2.5 text-blue-600" />
                  <span>Route</span>
                </a>

                <button
                  onClick={() => onSelectProperty(activeProperty)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}
                  className="active-press shadow-xs"
                >
                  View Plot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

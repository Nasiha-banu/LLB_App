import React from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Heart,
  Car,
  Sparkles,
  ChevronRight,
  Phone,
  MessageSquare,
  Plane,
  TrendingUp,
  Droplets,
  Route,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

export default function HomeScreen({
  currentUser,
  properties = [],
  favorites = [],
  onSelectProperty,
  onToggleFavorite,
  onNavigateTab,
  onOpenScheduleTour,
  onSearchChange
}) {
  const featured = properties.filter((p) => p.featured) || properties.slice(0, 4);

  const parandurHotspots = [
    { name: 'Airport North Gate', dist: '3.2 km', tag: 'AeroCity Hub', icon: '✈️', count: '14 Plots' },
    { name: 'Sunguvarchatram', dist: '9.5 km', tag: 'NH-48 Logistics', icon: '🏭', count: '100 Cents' },
    { name: 'Thandalam Junction', dist: '14.0 km', tag: 'Villa Enclave', icon: '🏡', count: '8 Plots' },
    { name: 'Podavur Agro View', dist: '8.8 km', tag: 'Farm Estates', icon: '🌳', count: '3 Parcels' },
    { name: 'Nelvoy Boulevard', dist: '6.5 km', tag: 'Affordable DTCP', icon: '🛣️', count: '22 Plots' }
  ];

  return (
    <div className="pb-20 bg-slate-50" style={{ minHeight: '100%' }}>
      {/* 1. Cinematic Imperial Emerald Hero Card */}
      <div style={{ padding: '16px 16px 20px' }}>
        <div
          style={{
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 16px 40px -8px rgba(6, 78, 59, 0.35)',
            padding: '20px 18px',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="text-white"
        >
          {/* Subtle Decorative Backdrop Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '9999px',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Top Tag & Welcome */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                fontSize: '9px',
                fontWeight: '800',
                letterSpacing: '0.05em',
                color: '#FDE68A'
              }}
            >
              <span>✈️</span>
              <span className="uppercase">Parandur Airport Corridor 2026</span>
            </div>
            {currentUser && (
              <span className="text-[11px] font-bold text-amber-200">
                Hi, {currentUser.name?.split(' ')[0]}
              </span>
            )}
          </div>

          <h2 className="font-editorial text-2xl font-bold leading-tight text-white">
            High-Yield Land & Plots <br />
            <span className="font-sans font-extrabold text-lg text-amber-300">
              at Parandur Greenfield Hub
            </span>
          </h2>

          <p className="text-xs text-emerald-100/90 leading-relaxed" style={{ marginTop: '6px' }}>
            DTCP & TN RERA sanctioned clear titles, 40-ft avenue roads, sweet groundwater, and 6-lane expressway connectivity.
          </p>

          {/* Search Bar Embedded in Hero */}
          <div style={{ marginTop: '16px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search AeroCity, Sunguvarchatram, DTCP..."
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onNavigateTab('properties')}
              style={{
                height: '46px',
                paddingLeft: '44px',
                paddingRight: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '16px',
                color: '#0F172A'
              }}
              className="w-full text-xs placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 block"
            />
            <Search className="w-4 h-4 text-emerald-800 pointer-events-none" style={{ position: 'absolute', left: '15px', top: '15px' }} />
          </div>

          {/* Macro Metrics Strip */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}
          >
            <div className="text-center">
              <span className="block text-amber-300 font-extrabold text-xs">₹40,000 Cr</span>
              <span className="block text-[9px] text-emerald-100 font-medium mt-0.5">Airport Hub Capex</span>
            </div>
            <div className="text-center border-x border-emerald-700/50">
              <span className="block text-emerald-300 font-extrabold text-xs">100% Clear</span>
              <span className="block text-[9px] text-emerald-100 font-medium mt-0.5">DTCP / TN RERA</span>
            </div>
            <div className="text-center">
              <span className="block text-amber-300 font-extrabold text-xs">30-40 Ft</span>
              <span className="block text-[9px] text-emerald-100 font-medium mt-0.5">Sweet Groundwater</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Micro-Market Location Pills */}
      <div style={{ padding: '0 16px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Strategic Airport Micro-Markets
            </h3>
            <span className="text-[10px] text-slate-500">Parandur Industrial & Metro Corridors</span>
          </div>
          <button
            onClick={() => onNavigateTab('map')}
            className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1"
          >
            <span>Live Map</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {parandurHotspots.map((spot, idx) => (
            <div
              key={idx}
              onClick={() => onSearchChange(spot.name)}
              style={{
                flexShrink: 0,
                padding: '10px 14px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                minWidth: '128px'
              }}
              className="active-press shadow-xs hover:border-emerald-700 transition-all"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="text-base">{spot.icon}</span>
                <span className="text-[9px] font-black text-emerald-800 px-1.5 py-0.5 bg-emerald-50 rounded-md">
                  {spot.dist}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">{spot.name}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{spot.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Featured Parandur Plot Collection */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Curated Parandur Plot Releases
              </h3>
            </div>
            <p className="text-[10px] text-slate-500">Vetted layouts with guaranteed title lineage</p>
          </div>
          <button
            onClick={() => onNavigateTab('properties')}
            className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
          >
            View All ({properties.length})
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {featured.map((prop) => {
            const isFav = favorites.includes(prop.id);
            return (
              <div
                key={prop.id}
                style={{
                  borderRadius: '22px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  overflow: 'hidden'
                }}
                className="shadow-luxury-card active-press transition-all"
              >
                {/* Photo & Floating Badges */}
                <div style={{ position: 'relative', height: '170px' }}>
                  <img
                    src={prop.images?.[0] || prop.image}
                    alt={prop.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Scrim Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
                    }}
                  />

                  {/* Top Approval Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: 'rgba(6, 78, 59, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#FDE68A',
                      fontSize: '9px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                    <span>{prop.approvalAuthority || 'DTCP Approved'}</span>
                  </div>

                  {/* Heart Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(prop.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isFav ? '#EF4444' : '#475569',
                      cursor: 'pointer'
                    }}
                    className="shadow-sm active-press"
                  >
                    <Heart className="w-4 h-4" fill={isFav ? '#EF4444' : 'none'} />
                  </button>

                  {/* Bottom Image Strip */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#FFFFFF'
                    }}
                  >
                    <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md">
                      {prop.distanceToAirport || 'Direct Express Link'}
                    </span>
                    <span className="text-xs font-black text-white">
                      ₹{prop.pricePerSqFt} <span className="text-[10px] font-normal text-slate-200">/ sq.ft</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">
                      {prop.category}
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {prop.availablePlots ? `${prop.availablePlots} Plots Left` : 'Available'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                    {prop.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {prop.location}
                  </p>

                  {/* Plot Specs Badges */}
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#334155'
                    }}
                  >
                    <span>📐 {prop.areaSqFt} Sq.Ft ({prop.areaCents} Cents)</span>
                    <span>🛣️ {prop.roadWidth || '40 Ft Road'}</span>
                    <span>💧 {prop.groundWater ? 'Sweet Water' : 'Clear Aquifer'}</span>
                  </div>

                  {/* Pricing & CTA Buttons */}
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Total Price</span>
                      <span className="font-editorial font-bold text-base text-slate-900">
                        {prop.totalPrice}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          onSelectProperty(prop);
                        }}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '12px',
                          background: '#FFFFFF',
                          border: '1px solid rgba(6, 78, 59, 0.4)',
                          color: '#064E3B',
                          fontSize: '11px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        className="active-press shadow-xs hover:bg-emerald-50"
                      >
                        <Car className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Site Visit</span>
                      </button>

                      <button
                        onClick={() => onSelectProperty(prop)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: '800',
                          boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)',
                          border: '1px solid rgba(212, 175, 55, 0.3)'
                        }}
                        className="active-press"
                      >
                        Explore Plot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Why LLB Real Estate — 4 Pillars of Land Security */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div
          style={{
            borderRadius: '22px',
            background: '#FFFFFF',
            border: '1px solid rgba(197, 168, 128, 0.35)',
            padding: '16px'
          }}
          className="shadow-luxury-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span className="text-base">🏛️</span>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Why LLB Real Estate
              </h3>
              <p className="text-[10px] text-slate-500">Parandur corridor transparency guarantee</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#064E3B', color: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>✓</div>
              <h4 className="font-bold text-xs text-slate-900">30-Year Title Search</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Vetted by Senior High Court Advocates with nil-encumbrance assurance.</p>
            </div>

            <div style={{ padding: '10px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#064E3B', color: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>🚗</div>
              <h4 className="font-bold text-xs text-slate-900">Free Chauffeur Pickup</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Toyota Innova Crysta pickup from MAA Airport or Guindy directly to plots.</p>
            </div>

            <div style={{ padding: '10px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#064E3B', color: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>⚡</div>
              <h4 className="font-bold text-xs text-slate-900">Instant Docket Booking</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Formal #LLB-PRD docket with n8n automated email and WhatsApp confirmation.</p>
            </div>

            <div style={{ padding: '10px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#064E3B', color: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>🔒</div>
              <h4 className="font-bold text-xs text-slate-900">0% Escalation Guarantee</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Locked agreement price with zero price hikes throughout registration.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Direct Investor Concierge Card */}
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            padding: '16px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          className="text-white"
        >
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300">
              Direct Advisory Desk
            </span>
            <h4 className="font-bold text-xs mt-0.5 text-white">+91 94441 23456</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Parandur Site Office • NH-48 Corridor</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href="tel:+919444123456"
              style={{
                padding: '7px 12px',
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: '800',
                textDecoration: 'none'
              }}
              className="active-press shadow-sm"
            >
              Call
            </a>
            <a
              href="https://wa.me/919444123456?text=Hi%20LLB%20Real%20Estate,%20I%20am%20interested%20in%20Parandur%20Airport%20Plots"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '7px 14px',
                borderRadius: '12px',
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                textDecoration: 'none'
              }}
              className="active-press shadow-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

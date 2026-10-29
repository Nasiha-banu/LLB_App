import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Heart,
  ArrowUpDown,
  X,
  LayoutGrid,
  List,
  Plane,
  ChevronRight,
  Filter,
  Car
} from 'lucide-react';

export default function ExploreScreen({
  properties = [],
  favorites = [],
  onSelectProperty,
  onToggleFavorite,
  searchTerm,
  setSearchTerm
}) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const categories = [
    { id: 'all', label: 'All Plots' },
    { id: 'Residential Plots', label: 'Residential Plots' },
    { id: 'Commercial Land', label: 'Commercial & Logistics' },
    { id: 'Villa Community Plot', label: 'Villa Communities' },
    { id: 'Farmland Acreage', label: 'Farm Estates' }
  ];

  const getNumericPrice = (p) => {
    if (typeof p.priceNumeric === 'number') return p.priceNumeric;
    if (p.totalPrice) {
      const match = p.totalPrice.match(/([\d\.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (p.totalPrice.includes('Cr')) return val * 10000000;
        if (p.totalPrice.includes('L') || p.totalPrice.includes('Lakh')) return val * 100000;
        return val;
      }
    }
    return 0;
  };

  const filtered = properties.filter((prop) => {
    if (selectedCategory !== 'all' && prop.category !== selectedCategory) return false;
    
    const price = getNumericPrice(prop);
    if (budgetFilter === 'under_25L') {
      if (price > 2500000) return false;
    } else if (budgetFilter === '25L_50L') {
      if (price < 2500000 || price > 5000000) return false;
    } else if (budgetFilter === '50L_1Cr') {
      if (price < 5000000 || price > 10000000) return false;
    } else if (budgetFilter === 'above_1Cr') {
      if (price < 10000000) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = prop.title?.toLowerCase().includes(q);
      const matchLoc = prop.location?.toLowerCase().includes(q);
      const matchMicro = prop.microMarket?.toLowerCase().includes(q);
      const matchId = prop.id?.toLowerCase().includes(q);
      const matchRera = prop.reraNumber?.toLowerCase().includes(q);
      return matchTitle || matchLoc || matchMicro || matchId || matchRera;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') return getNumericPrice(a) - getNumericPrice(b);
    if (sortBy === 'price_desc') return getNumericPrice(b) - getNumericPrice(a);
    if (sortBy === 'area_desc') return (b.areaSqFt || 0) - (a.areaSqFt || 0);
    return 0;
  });

  return (
    <div className="pb-24 bg-slate-50" style={{ minHeight: '100%' }}>
      {/* Header & Title */}
      <div
        style={{
          padding: '16px 16px 12px',
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(197, 168, 128, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              Verified Land Portfolio
            </span>
            <h2 className="font-editorial text-lg font-bold text-slate-900 leading-tight">
              Parandur Land Inventory
            </h2>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
              color: '#FDE68A',
              fontSize: '11px',
              fontWeight: '800'
            }}
          >
            {sorted.length} Available
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginTop: '6px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, road width, or RERA ID..."
            style={{
              height: '42px',
              paddingLeft: '38px',
              paddingRight: searchTerm ? '38px' : '14px',
              borderRadius: '14px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              color: '#0F172A'
            }}
            className="w-full focus:outline-none focus:ring-2 focus:ring-emerald-700 block"
          />
          <Search className="w-4 h-4 text-emerald-800 pointer-events-none" style={{ position: 'absolute', left: '12px', top: '13px' }} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '12px', top: '12px', color: '#94A3B8' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px', paddingBottom: '4px' }}>
          {categories.map((c) => {
            const isCatActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: isCatActive
                    ? 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)'
                    : '#FFFFFF',
                  color: isCatActive ? '#FDE68A' : '#475569',
                  border: isCatActive
                    ? '1px solid rgba(212, 175, 55, 0.4)'
                    : '1px solid #E2E8F0',
                  boxShadow: isCatActive ? '0 2px 8px rgba(6, 78, 59, 0.2)' : 'none'
                }}
                className="active-press transition-all"
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Budget Filters & View Mode Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid #F1F5F9'
          }}
        >
          {/* Budget Quick Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => setBudgetFilter('all')}
              style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '8px',
                background: budgetFilter === 'all' ? '#0F172A' : '#F1F5F9',
                color: budgetFilter === 'all' ? '#FFFFFF' : '#64748B'
              }}
            >
              All Budget
            </button>
            <button
              onClick={() => setBudgetFilter('under_25L')}
              style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '8px',
                background: budgetFilter === 'under_25L' ? '#0F172A' : '#F1F5F9',
                color: budgetFilter === 'under_25L' ? '#FFFFFF' : '#64748B'
              }}
            >
              &lt; ₹25L
            </button>
            <button
              onClick={() => setBudgetFilter('25L_50L')}
              style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '8px',
                background: budgetFilter === '25L_50L' ? '#0F172A' : '#F1F5F9',
                color: budgetFilter === '25L_50L' ? '#FFFFFF' : '#64748B'
              }}
            >
              ₹25L - ₹50L
            </button>
            <button
              onClick={() => setBudgetFilter('above_1Cr')}
              style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '4px 8px',
                borderRadius: '8px',
                background: budgetFilter === 'above_1Cr' ? '#0F172A' : '#F1F5F9',
                color: budgetFilter === 'above_1Cr' ? '#FFFFFF' : '#64748B'
              }}
            >
              ₹1 Cr+
            </button>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: '#F1F5F9',
                color: '#334155'
              }}
              title="Toggle View Mode"
            >
              {viewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards Listing */}
      <div style={{ padding: '16px' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '9999px',
                background: '#F1F5F9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '12px'
              }}
            >
              🔍
            </div>
            <h4 className="font-bold text-sm text-slate-900">No matching Parandur plots</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or budget filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setBudgetFilter('all');
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: '#064E3B',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800'
              }}
              className="active-press shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={
              viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }
                : { display: 'flex', flexDirection: 'column', gap: '16px' }
            }
          >
            {sorted.map((prop) => {
              const isFav = favorites.includes(prop.id);
              if (viewMode === 'grid') {
                return (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty(prop)}
                    style={{
                      borderRadius: '18px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(197, 168, 128, 0.3)',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    className="shadow-luxury-card active-press"
                  >
                    <div style={{ position: 'relative', height: '110px' }}>
                      <img
                        src={prop.images?.[0] || prop.image}
                        alt={prop.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(6, 78, 59, 0.9)',
                          color: '#FDE68A',
                          fontSize: '8px',
                          fontWeight: '800'
                        }}
                      >
                        DTCP
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(prop.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '9999px',
                          padding: '4px',
                          border: 'none',
                          color: isFav ? '#EF4444' : '#64748B'
                        }}
                      >
                        <Heart className="w-3 h-3" fill={isFav ? '#EF4444' : 'none'} />
                      </button>
                    </div>
                    <div style={{ padding: '10px' }}>
                      <span className="block text-[8px] font-extrabold uppercase text-emerald-800">
                        {prop.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-0.5 line-clamp-1">{prop.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{prop.location}</p>
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="font-bold text-xs text-slate-900">{prop.totalPrice}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">₹{prop.pricePerSqFt}/sq.ft</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // List View Card
              return (
                <div
                  key={prop.id}
                  style={{
                    borderRadius: '22px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(197, 168, 128, 0.3)',
                    overflow: 'hidden'
                  }}
                  className="shadow-luxury-card active-press"
                >
                  <div style={{ position: 'relative', height: '160px' }}>
                    <img
                      src={prop.images?.[0] || prop.image}
                      alt={prop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)'
                      }}
                    />

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
                        fontWeight: '800'
                      }}
                    >
                      {prop.approvalAuthority || 'DTCP Sanctioned'}
                    </div>

                    <button
                      onClick={() => onToggleFavorite(prop.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.9)',
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

                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800">
                        {prop.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {prop.availablePlots ? `${prop.availablePlots} Plots Available` : 'Active'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{prop.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{prop.location}</p>

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
                      <span>💧 {prop.groundWater ? 'Potable Water' : 'Clear Aquifer'}</span>
                    </div>

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

                      <button
                        onClick={() => onSelectProperty(prop)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: '800',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)'
                        }}
                        className="active-press"
                      >
                        View Plot Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

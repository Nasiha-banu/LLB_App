import React from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Settings,
  Phone,
  MessageSquare,
  FileText,
  LogOut,
  ChevronRight,
  Heart,
  Sliders,
  ExternalLink,
  Sparkles,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';
import { api } from '../services/api';

export default function ProfileScreen({
  user,
  onOpenAuth,
  onLogout,
  favorites = [],
  properties = [],
  onSelectProperty,
  onNavigateTab
}) {
  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="pb-24 bg-slate-50" style={{ minHeight: '100%' }}>
      {/* Screen Header */}
      <div
        style={{
          padding: '16px 16px 14px',
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(197, 168, 128, 0.25)'
        }}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
          Investor Portal
        </span>
        <h2 className="font-editorial text-lg font-bold text-slate-900 leading-tight">
          Investor Profile & Advisory
        </h2>
      </div>

      <div style={{ padding: '16px' }} className="space-y-4">
        {/* Investor Profile Card */}
        <div
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%)',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 16px 36px rgba(6, 78, 59, 0.25)',
            padding: '20px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: user
                  ? 'linear-gradient(135deg, #D4AF37 0%, #9E7D42 100%)'
                  : 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
                color: user ? '#064E3B' : '#FDE68A',
                fontSize: '20px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.4)'
              }}
              className="shrink-0"
            >
              {user ? user.name.charAt(0) : '🏛️'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 className="font-bold text-sm text-white truncate">
                  {user ? user.name : 'Guest Investor'}
                </h3>
                <span style={{ fontSize: '9px', fontWeight: '800', background: user ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.15)', color: user ? '#FDE68A' : '#E2E8F0', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  {user ? 'VIP HNWI' : 'Guest'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 truncate mt-0.5">
                {user ? user.email : 'Session not signed in'}
              </p>
              <p className="text-[10px] text-amber-300 font-bold mt-1">
                {user ? '⭐ Sovereign Parandur Corridor Tier • Tamil Nadu' : 'Sign in to access booked plot dockets & save properties'}
              </p>
            </div>
          </div>
        </div>

        {/* Saved Favorites Section */}
        <div style={{ padding: '16px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart className={`w-4 h-4 ${favoriteProperties.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
              <h4 className="font-bold text-xs text-slate-900">Saved Parandur Plots</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{favoriteProperties.length} saved</span>
          </div>

          {favoriteProperties.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {favoriteProperties.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProperty(p)}
                  style={{
                    width: '140px',
                    flexShrink: 0,
                    borderRadius: '14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  className="active-press"
                >
                  <img src={p.images?.[0] || p.image} alt={p.title} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px' }}>
                    <h5 className="font-bold text-[11px] text-slate-900 truncate">{p.title}</h5>
                    <span className="font-black text-xs text-emerald-800 mt-1 block">{p.totalPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px 8px', textAlign: 'center' }}>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You haven't saved any plots yet. Tap the heart icon <span className="text-rose-500 font-bold">❤️</span> on any property card to save it here for quick comparison.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('properties')}
                  style={{
                    marginTop: '10px',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    color: '#064E3B',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: '1px solid #CBD5E1'
                  }}
                  className="active-press"
                >
                  Browse Available Plots
                </button>
              )}
            </div>
          )}
        </div>

        {/* Real Estate Investor Advisory Desk */}
        <div style={{ padding: '16px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="text-sm">🏛️</span>
            <div>
              <h4 className="font-bold text-xs text-slate-900">LLB Real Estate Concierge</h4>
              <p className="text-[10px] text-slate-500">Parandur Airport Corridor Advisory</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <a
              href="tel:+919444123456"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 12px',
                borderRadius: '12px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
                fontSize: '11px',
                fontWeight: '800',
                textDecoration: 'none'
              }}
              className="active-press"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Advisory</span>
            </a>

            <a
              href="https://wa.me/919444123456?text=Hello%20LLB%20Real%20Estate,%20I%20am%20interested%20in%20Parandur%20Airport%20plots."
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 12px',
                borderRadius: '12px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '11px',
                fontWeight: '800',
                textDecoration: 'none'
              }}
              className="active-press"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="text-[10px] text-slate-600">
              <span className="font-bold text-slate-900 block">Site Office:</span>
              <span>Sunguvarchatram Hub & Parandur North Gate Office, Tamil Nadu</span>
            </div>
          </div>
        </div>

        {/* Parandur Buying & Legal Due Diligence */}
        <div style={{ padding: '16px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-xs text-slate-900">Legal Due Diligence Guarantee</h4>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            All plots listed by LLB Real Estate are pre-vetted with 30-year encumbrance search (EC), DTCP/TNCMP sanction approvals, and direct revenue patta lineage outside the acquired airport perimeter.
          </p>
        </div>

        {/* Sign In or Sign Out Action */}
        {user ? (
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              background: '#FFFFFF',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              fontSize: '11px',
              fontWeight: '800'
            }}
            className="active-press hover:bg-rose-50"
          >
            Sign Out of Investor Session
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#FDE68A',
              fontSize: '12px',
              fontWeight: '800',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
            }}
            className="active-press"
          >
            Sign In or Register New Account
          </button>
        )}
      </div>
    </div>
  );
}

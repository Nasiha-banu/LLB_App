import React from 'react';
import { Bell, User, Sparkles } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onOpenNotifications, unreadCount, liveConnected }) {
  return (
    <header
      style={{
        height: '66px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(197, 168, 128, 0.25)'
      }}
      className="sticky top-0 z-40 w-full shadow-xs shrink-0"
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)'
          }}
          className="flex items-center justify-center shrink-0"
        >
          <span className="font-serif-luxury text-xs font-black tracking-wider text-amber-300">
            LLB
          </span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 className="font-serif-luxury text-xs font-black tracking-wider text-slate-900">
              LLB REAL ESTATE
            </h1>
            <span
              style={{
                fontSize: '8px',
                fontWeight: '800',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #FDF8F0 0%, #FEF3C7 100%)',
                color: '#92400E',
                border: '1px solid rgba(217, 119, 6, 0.3)'
              }}
            >
              TN RERA
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="text-[10px] text-slate-500 font-medium">
            <span className="font-semibold text-slate-700">Parandur Airport Corridor</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="text-emerald-700 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${liveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}`}></span>
              <span>{liveConnected ? 'Live' : 'Verified'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            padding: '8px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#334155'
          }}
          className="active-press shadow-xs hover:border-emerald-700 transition-colors"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: '800',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)'
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {user ? (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px 4px 5px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid rgba(197, 168, 128, 0.4)'
            }}
            className="active-press shadow-xs"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
                color: '#FDE68A',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {user.name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-800 max-w-[70px] truncate">
              {user.name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
            className="active-press hover:opacity-95 transition-all"
          >
            <User className="w-3.5 h-3.5 text-amber-300" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

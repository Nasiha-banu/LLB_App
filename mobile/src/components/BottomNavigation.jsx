import React from 'react';
import { Home, Compass, MapPin, CalendarCheck, User } from 'lucide-react';

export default function BottomNavigation({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'properties', label: 'Explore', icon: Compass },
    { id: 'map', label: 'Corridor Map', icon: MapPin },
    { id: 'bookings', label: 'My Bookings', icon: CalendarCheck },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '66px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(197, 168, 128, 0.25)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.04)'
      }}
      className="sticky bottom-0 z-40 w-full px-2 py-1 safe-bottom shrink-0"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1
            }}
            className="active-press transition-all duration-200"
          >
            <div
              style={{
                padding: '6px',
                borderRadius: '14px',
                background: isActive
                  ? 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)'
                  : 'transparent',
                color: isActive ? '#FDE68A' : '#64748B',
                boxShadow: isActive ? '0 4px 12px rgba(6, 78, 59, 0.25)' : 'none',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              style={{
                fontSize: '10px',
                marginTop: '3px',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#064E3B' : '#64748B'
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <span
                style={{
                  width: '12px',
                  height: '2.5px',
                  background: 'linear-gradient(90deg, #D4AF37 0%, #C5A880 100%)',
                  borderRadius: '9999px',
                  marginTop: '2px'
                }}
              ></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

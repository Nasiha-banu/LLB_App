import React, { useState, useEffect } from 'react';
import MobileFrame from './components/MobileFrame';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import HomeScreen from './components/HomeScreen';
import ExploreScreen from './components/ExploreScreen';
import MapScreen from './components/MapScreen';
import MyBookingsScreen from './components/MyBookingsScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminDashboardScreen from './components/AdminDashboardScreen';
import PropertyDetailModal from './components/PropertyDetailModal';
import AuthModal from './components/AuthModal';
import NotificationDrawer from './components/NotificationDrawer';
import { api } from './services/api';
import { socketService } from './services/socket';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'properties', 'map', 'bookings', 'profile'
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('llb_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // UI Drawers & Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('login');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      type: 'price_alert',
      title: 'Parandur Airport City Phase 1',
      message: 'DTCP Layout sanction renewed. New plots released in Phase 1.',
      tag: '₹21.75 Lakhs',
      time: '15m ago'
    },
    {
      id: 'n2',
      type: 'tour_confirmed',
      title: 'Complimentary Site Inspection Escort',
      message: 'Chauffeur vehicle assigned for Sunguvarchatram visit slot.',
      tag: 'NH-48 Hub',
      time: '1h ago'
    }
  ]);

  // Load user & properties on startup
  useEffect(() => {
    async function init() {
      try {
        const user = await api.getMe();
        if (user) {
          setCurrentUser(user);
          if (user.favorites) setFavorites(user.favorites);
        }
      } catch (e) {
        console.warn('User session check:', e.message);
      }

      try {
        const props = await api.getProperties();
        setProperties(props);
      } catch (e) {
        console.warn('Properties load:', e.message);
      }
    }

    init();

    // Setup Socket connection
    const socket = socketService.connect();
    socket.on('connect', () => setLiveConnected(true));
    socket.on('disconnect', () => setLiveConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggleFavorite = async (propertyId) => {
    let nextFavorites;
    if (favorites.includes(propertyId)) {
      nextFavorites = favorites.filter((id) => id !== propertyId);
    } else {
      nextFavorites = [...favorites, propertyId];
    }
    setFavorites(nextFavorites);
    try {
      localStorage.setItem('llb_favorites', JSON.stringify(nextFavorites));
    } catch {}

    if (currentUser) {
      try {
        const updated = await api.toggleFavorite(propertyId);
        if (updated) setFavorites(updated);
      } catch (e) {
        console.warn('Favorite sync:', e.message);
      }
    }
  };

  const handleAuthSuccess = (userData) => {
    const user = userData.user || userData;
    setCurrentUser(user);
    if (user.favorites) {
      setFavorites(user.favorites);
      try {
        localStorage.setItem('llb_favorites', JSON.stringify(user.favorites));
      } catch {}
    }
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAdminMode(false);
    setFavorites([]);
    try {
      localStorage.removeItem('llb_favorites');
    } catch {}
    setActiveTab('home');
  };

  const handleSearchNavigate = (term) => {
    setSearchTerm(term);
    setActiveTab('properties');
  };

  return (
    <MobileFrame>
      {/* Top Mobile Navbar */}
      <Navbar
        user={currentUser}
        onOpenAuth={() => {
          setAuthInitialView('login');
          setIsAuthOpen(true);
        }}
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadCount={notifications.length}
        liveConnected={liveConnected}
      />

      {/* Main Tab Screen Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {isAdminMode ? (
          <AdminDashboardScreen onExit={() => setIsAdminMode(false)} />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                currentUser={currentUser}
                properties={properties}
                favorites={favorites}
                onSelectProperty={setSelectedProperty}
                onToggleFavorite={handleToggleFavorite}
                onNavigateTab={setActiveTab}
                onOpenScheduleTour={() => {
                  if (properties.length > 0) setSelectedProperty(properties[0]);
                }}
                onSearchChange={handleSearchNavigate}
              />
            )}

            {activeTab === 'properties' && (
              <ExploreScreen
                properties={properties}
                favorites={favorites}
                onSelectProperty={setSelectedProperty}
                onToggleFavorite={handleToggleFavorite}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )}

            {activeTab === 'map' && (
              <MapScreen
                properties={properties}
                onSelectProperty={setSelectedProperty}
              />
            )}

            {activeTab === 'bookings' && (
              <MyBookingsScreen
                user={currentUser}
                onOpenAuth={() => {
                  setAuthInitialView('login');
                  setIsAuthOpen(true);
                }}
                onSelectProperty={setSelectedProperty}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                user={currentUser}
                onOpenAuth={() => {
                  setAuthInitialView('login');
                  setIsAuthOpen(true);
                }}
                onLogout={handleLogout}
                favorites={favorites}
                properties={properties}
                onSelectProperty={setSelectedProperty}
                onNavigateTab={setActiveTab}
                onOpenAdminConsole={() => setIsAdminMode(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Mobile Navigation Tabs (Hidden when in Admin Mode) */}
      {!isAdminMode && (
        <BottomNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {/* Fullscreen Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={handleToggleFavorite}
          currentUser={currentUser}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* Authentication Modal (Register / Login / Forgot / Reset Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialView={authInitialView}
      />

      {/* Push Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onClear={() => setNotifications([])}
      />
    </MobileFrame>
  );
}

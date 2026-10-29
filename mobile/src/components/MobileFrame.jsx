import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Wifi, Battery, Signal, Sparkles } from 'lucide-react';

export default function MobileFrame({ children }) {
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const [deviceMode, setDeviceMode] = useState('iphone'); // 'iphone', 'samsung', 'fullscreen'
  const [time, setTime] = useState('09:41');

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobileScreen(window.innerWidth < 768);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearInterval(timer);
    };
  }, []);

  // When on a physical mobile device or viewport < 768px:
  // Render 100% EDGE-TO-EDGE NATIVE MOBILE APP with fixed top header & bottom tab bar
  if (isMobileScreen) {
    return (
      <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col bg-white overflow-hidden text-slate-900 select-none">
        {children}
      </div>
    );
  }

  // When on a Desktop / Laptop screen (>= 768px):
  // Provide the interactive phone chassis simulator with device mode toggles
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-start py-6 px-4">
      {/* Desktop Mode Switcher Bar */}
      <div className="flex items-center justify-between w-full max-w-md mb-4 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LLB Mobile Simulator</span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setDeviceMode('iphone')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              deviceMode === 'iphone'
                ? 'bg-black text-white shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Apple iOS</span>
          </button>
          <button
            onClick={() => setDeviceMode('samsung')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              deviceMode === 'samsung'
                ? 'bg-black text-white shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Tablet className="w-3 h-3" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setDeviceMode('fullscreen')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
              deviceMode === 'fullscreen'
                ? 'bg-black text-white shadow-sm'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Full</span>
          </button>
        </div>
      </div>

      {/* Simulated Mobile Device Chassis */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden ${
          deviceMode === 'fullscreen'
            ? 'max-w-2xl min-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl bg-white'
            : deviceMode === 'samsung'
            ? 'max-w-[420px] h-[890px] rounded-[48px] border-[10px] border-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.18)] bg-white'
            : 'max-w-[400px] h-[860px] rounded-[48px] border-[10px] border-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.18)] bg-white'
        }`}
      >
        {/* Desktop Status Bar Mockup */}
        {deviceMode !== 'fullscreen' && (
          <div className="w-full h-8 px-6 flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white select-none shrink-0 border-b border-slate-100">
            <span>{time}</span>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
            <div className="flex items-center space-x-1 text-slate-700">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        )}

        {/* Inner App Container with Smooth Touch Scroll */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-white">
          {children}
        </div>

        {/* Desktop iOS Home Indicator Mockup */}
        {deviceMode === 'iphone' && (
          <div className="w-full h-4 bg-white flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-500 font-medium text-center flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>Physical phone view opens 100% full-screen native automatically with zero chassis bezels.</span>
      </p>
    </div>
  );
}

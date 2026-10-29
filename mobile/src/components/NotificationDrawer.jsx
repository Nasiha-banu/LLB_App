import React from 'react';
import { X, Bell, TrendingDown, Calendar, CheckCircle2 } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onClear }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[80vh] bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)', color: '#FDE68A', border: '1px solid rgba(212, 175, 55, 0.4)', flexShrink: 0 }}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">VIP Notifications & Alerts</h3>
              <p className="text-[10px] text-slate-500 font-medium">Real-time alerts via n8n & WebSockets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((notif, idx) => (
              <div
                key={notif.id || idx}
                style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                className="bg-slate-50 border border-slate-200 rounded-xl hover:border-black transition-colors"
              >
                <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: '#0A0A0A', color: '#FFFFFF', flexShrink: 0, marginTop: '2px' }}>
                  {notif.type === 'price_alert' ? (
                    <TrendingDown className="w-3.5 h-3.5 text-white" />
                  ) : notif.type === 'tour_confirmed' ? (
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-black truncate">{notif.title}</h4>
                    <span className="text-[9px] text-slate-400 ml-1 shrink-0">{notif.time || 'Just now'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  {notif.tag && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 border border-slate-300 text-black">
                      {notif.tag}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-black" />
              <p className="text-xs font-bold text-black">No new notifications</p>
              <p className="text-[10px] text-slate-500 mt-1">
                You will receive alerts when property prices change or your site tour is confirmed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={onClear}
              style={{ height: '38px' }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
            >
              Clear All Alerts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

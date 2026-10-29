import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Sliders,
  Send,
  Zap,
  ChevronDown,
  Layers,
  MapPin,
  TrendingUp,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardScreen({ onExit }) {
  const [activeTab, setActiveTab] = useState('automations'); // 'automations', 'bookings', 'properties'
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [previewingEmail, setPreviewingEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, b, p, l, e] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminBookings().catch(() => []),
        api.getProperties().catch(() => []),
        api.getAutomationLogs().catch(() => []),
        api.getAllSentEmails().catch(() => [])
      ]);
      setStats(s);
      setBookings(b || []);
      setProperties(p || []);
      setAutomationLogs(l?.logs || l || []);
      setSentEmails(e || []);
    } catch (err) {
      console.warn('Admin data load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus, adminNotes);
      await fetchData();
      setSelectedBooking(null);
      setAdminNotes('');
    } catch (err) {
      alert('Failed to update booking status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 pb-20">
      {/* Top Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
        }}
        className="text-white px-4 pt-5 pb-4 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Return to customer app"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] tracking-widest text-amber-300 uppercase font-mono block">
                MANAGEMENT & OWNER AUDIT
              </span>
              <h1 className="text-base font-black tracking-tight text-white">Owner & Investor Email Hub</h1>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-lg font-black block text-white">{stats?.totalBookings ?? bookings.length}</span>
            <span className="text-[10px] text-emerald-200">Total Bookings</span>
          </div>
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-lg font-black block text-emerald-300">{stats?.availablePlots ?? 52}</span>
            <span className="text-[10px] text-emerald-200">Plots Available</span>
          </div>
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-lg font-black block text-amber-300">{automationLogs.length}</span>
            <span className="text-[10px] text-emerald-200">n8n Triggers</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mt-4 bg-black/30 p-1 rounded-xl border border-white/10">
          {[
            { id: 'automations', label: `Sent Emails (${sentEmails.length})` },
            { id: 'bookings', label: `Bookings (${bookings.length})` },
            { id: 'properties', label: `Listings (${properties.length})` }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === t.id
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* TAB 1: BOOKING REQUESTS */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', padding: '0 4px' }}>
              <span>Customer Booking Requests</span>
              <span>Total: {bookings.length}</span>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                <p className="text-xs text-slate-500">No active bookings recorded yet.</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id || b.bookingReference}
                  style={{
                    padding: '16px',
                    borderRadius: '20px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(197, 168, 128, 0.35)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-black block">
                        #{b.bookingReference}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'Approved' || b.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'Cancellation Requested'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : b.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-black text-white'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-black">{b.propertyTitle}</h4>
                    <p className="text-[11px] text-slate-500">{b.plotUnit} • {b.priceFormatted}</p>
                    <div className="mt-1 bg-slate-50 p-2 rounded-lg text-xs space-y-0.5">
                      <p className="font-semibold text-black">{b.userName}</p>
                      <p className="text-slate-600 text-[11px]">{b.userEmail} | {b.userPhone}</p>
                      {b.siteVisitDate && (
                        <p className="text-slate-700 text-[11px] font-medium pt-1">
                          🚗 Site Visit: {b.siteVisitDate} at {b.siteVisitTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-[10px] bg-slate-50 p-2 rounded text-slate-600 italic">
                      Client Notes: "{b.notes}"
                    </p>
                  )}

                  {/* Status Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleStatusChange(b.id, 'Approved')}
                      disabled={updatingId === b.id}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Approve & Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'Cancelled')}
                      disabled={updatingId === b.id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded-lg transition-colors"
                    >
                      Reject / Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PARANDUR LISTINGS */}
        {activeTab === 'properties' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase px-1">
              <span>Parandur Plot Developments</span>
              <span>{properties.length} Active Parcels</span>
            </div>

            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center gap-3"
              >
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200'}
                  alt={p.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">{p.id}</span>
                  <h4 className="text-xs font-bold text-black truncate">{p.title}</h4>
                  <p className="text-[11px] text-slate-600 font-semibold">{p.totalPrice} ({p.pricePerSqFt}/sq.ft)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {p.availablePlots} of {p.totalPlots} Plots Available
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-black">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: n8n AUTOMATION AUDIT */}
        {activeTab === 'automations' && (
          <div className="space-y-4">
            {/* Outbox of Dispatched Registration Emails */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase px-1 mb-2">
                <span>📧 Registered Users Email Outbox ({sentEmails.length})</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                  n8n Delivery Active
                </span>
              </div>

              {sentEmails.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-200 text-xs text-slate-500">
                  No registration emails logged yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {sentEmails.map((email) => (
                    <div
                      key={email.id}
                      className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <span className="text-emerald-700">✉️</span>
                          <span className="truncate max-w-[200px]">{email.recipient}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {email.status || 'DELIVERED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-semibold">{email.subject}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(email.timestamp).toLocaleTimeString()} • {email.n8nWorkflow}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewingEmail(email)}
                            className="px-2.5 py-1 bg-emerald-900 text-amber-300 font-bold text-[10px] rounded-lg shadow"
                          >
                            Preview Email
                          </button>
                          {email.previewUrl && (
                            <a
                              href={email.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-300 hover:bg-slate-200"
                            >
                              Web Inbox
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* n8n Live Webhooks */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase px-1 mb-2">
                <span>⚡ n8n Webhook Live Execution Feed</span>
                <span>Port: 5678</span>
              </div>

              {automationLogs.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                  <Zap className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No automation logs captured yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {automationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-black flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-black" />
                          {log.workflow}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        Endpoint: {log.webhookPath} • {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                      {log.payload && (
                        <div className="bg-slate-50 p-2 rounded-lg font-mono text-[10px] text-slate-600 overflow-x-auto">
                          {JSON.stringify(log.payload, null, 1)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL: ADMIN EMAIL INSPECTION */}
      {previewingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-slate-300">
            <div
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #043828 50%, #02241A 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
              }}
              className="p-4 text-white flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
                  ADMIN AUDIT • n8n Email Record
                </span>
                <h3 className="text-sm font-bold text-white">{previewingEmail.subject}</h3>
              </div>
              <button
                onClick={() => setPreviewingEmail(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 text-xs">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-700">
                  <div><strong>To:</strong> {previewingEmail.recipient}</div>
                  <div><strong>ID:</strong> {previewingEmail.id}</div>
                  <div><strong>Workflow:</strong> {previewingEmail.n8nWorkflow}</div>
                  <div><strong>Time:</strong> {new Date(previewingEmail.timestamp).toLocaleString()}</div>
                </div>

                {previewingEmail.html ? (
                  <div
                    className="border border-slate-100 rounded-xl p-2 bg-white overflow-x-hidden"
                    dangerouslySetInnerHTML={{ __html: previewingEmail.html }}
                  />
                ) : (
                  <div className="p-4 text-center text-slate-500">No HTML payload available.</div>
                )}
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewingEmail(null)}
                className="px-4 py-2 bg-emerald-950 text-amber-300 rounded-xl text-xs font-bold shadow hover:bg-emerald-900"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

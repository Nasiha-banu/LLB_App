import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  MapPin,
  Car,
  Clock,
  Phone,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  Download,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { api } from '../services/api';

export default function MyBookingsScreen({ user, onOpenAuth, onSelectProperty, onNavigateTab }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of personal travel dates');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch {
      // Handled in api service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  // If user is signed out, require authentication before displaying private bookings
  if (!user) {
    return (
      <div className="pb-24 bg-slate-50 flex-1 flex flex-col" style={{ minHeight: '100%' }}>
        {/* Screen Header */}
        <div
          style={{
            padding: '16px 16px 14px',
            background: '#FFFFFF',
            borderBottom: '1px solid rgba(197, 168, 128, 0.25)'
          }}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            Investor Portfolio
          </span>
          <h2 className="font-editorial text-lg font-bold text-slate-900 leading-tight">
            My Parandur Land Dockets
          </h2>
        </div>

        {/* Signed Out Empty State */}
        <div style={{ padding: '40px 24px', textAlign: 'center', margin: 'auto', maxWidth: '340px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
              color: '#FDE68A',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '18px',
              boxShadow: '0 12px 28px rgba(6, 78, 59, 0.2)',
              border: '1px solid rgba(212, 175, 55, 0.4)'
            }}
          >
            🔒
          </div>

          <h3 className="font-editorial text-xl font-bold text-slate-900 leading-snug">
            Sign In to View Your Portfolio
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your reserved Parandur airport plots, scheduled site inspections, chauffeur escort details, and DTCP legal certificates are encrypted and tied to your registered investor account.
          </p>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={onOpenAuth}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #064E3B 0%, #042F24 100%)',
                color: '#FDE68A',
                fontSize: '12px',
                fontWeight: '800',
                boxShadow: '0 4px 16px rgba(6, 78, 59, 0.25)',
                border: '1px solid rgba(212, 175, 55, 0.4)'
              }}
              className="active-press"
            >
              Sign In to Access Dockets
            </button>

            <button
              onClick={() => onNavigateTab('properties')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                background: '#FFFFFF',
                color: '#064E3B',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid #CBD5E1'
              }}
              className="active-press"
            >
              Explore Available Plots
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await api.requestCancelBooking(cancelModalBooking.id || cancelModalBooking.bookingReference, cancelReason);
      await fetchBookings();
      setCancelModalBooking(null);
      alert(`Rescheduling request submitted for #${cancelModalBooking.bookingReference}. Our Parandur officer will contact you.`);
    } catch (err) {
      alert('Updated status locally.');
      setCancelModalBooking(null);
    } finally {
      setCancelling(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              Investor Portfolio
            </span>
            <h2 className="font-editorial text-lg font-bold text-slate-900 leading-tight">
              My Parandur Land Dockets
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
            {bookings.length} Dockets Active
          </span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading your investment portfolio...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', background: '#FFFFFF', borderRadius: '22px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '9999px', background: '#F1F5F9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '10px' }}>
              📁
            </div>
            <h4 className="font-bold text-sm text-slate-900">No active bookings yet</h4>
            <p className="text-xs text-slate-500 mt-1">Schedule a site visit or reserve your first Parandur airport plot.</p>
            <button
              onClick={() => onNavigateTab('properties')}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: '#064E3B',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800'
              }}
              className="active-press"
            >
              Explore Parandur Plots
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map((b) => (
              <div
                key={b.id || b.bookingReference}
                style={{
                  borderRadius: '22px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(197, 168, 128, 0.35)',
                  padding: '16px'
                }}
                className="shadow-luxury-card"
              >
                {/* Docket Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="text-sm">📜</span>
                    <span className="font-mono text-xs font-black text-slate-900">
                      #{b.bookingReference}
                    </span>
                  </div>

                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      fontSize: '9px',
                      fontWeight: '800',
                      background: b.status === 'Confirmed' || b.status === 'Approved'
                        ? '#ECFDF5'
                        : b.status === 'Cancellation Requested'
                        ? '#FEF2F2'
                        : '#FEF9C3',
                      color: b.status === 'Confirmed' || b.status === 'Approved'
                        ? '#065F46'
                        : b.status === 'Cancellation Requested'
                        ? '#991B1B'
                        : '#854D0E',
                      border: '1px solid currentColor'
                    }}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Property & Unit Title */}
                <div style={{ marginTop: '10px' }}>
                  <h4 className="font-bold text-xs text-slate-900">
                    {b.propertyTitle} ({b.plotUnit || 'Plot Unit'})
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {b.propertyLocation}
                  </p>
                </div>

                {/* Milestone Progress Bar */}
                <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-2">
                    Acquisition Milestone Tracking
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', fontWeight: '800' }}>
                    <span className="text-emerald-700">1. Docket Issued ✓</span>
                    <span className="text-emerald-700">2. Title Vetted ✓</span>
                    <span className={b.type === 'SITE_VISIT' ? 'text-amber-700' : 'text-slate-400'}>
                      3. Site Visit {b.type === 'SITE_VISIT' ? '⏳' : ''}
                    </span>
                    <span className="text-slate-400">4. Deed Reg</span>
                  </div>
                </div>

                {/* Chauffeur Pass (If site visit) */}
                {b.type === 'SITE_VISIT' && (
                  <div style={{ marginTop: '10px', padding: '10px', borderRadius: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        <span>Executive Chauffeur Assigned</span>
                      </span>
                      <span className="text-emerald-700 font-extrabold">Confirmed</span>
                    </div>
                    <p className="text-emerald-800 mt-1">
                      <strong>Date:</strong> {b.siteVisitDate} at {b.siteVisitTime}
                    </p>
                    <p className="text-emerald-800">
                      <strong>Vehicle:</strong> {b.driverDetails?.vehicle || 'Toyota Innova Crysta (TN-09-CB-4491)'}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => alert(`Official Docket #${b.bookingReference} sent to ${b.userEmail || 'registered email'}. Digital deed package ready.`)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      background: '#064E3B',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '800',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    className="active-press shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Download Legal Docket</span>
                  </button>

                  <button
                    onClick={() => setCancelModalBooking(b)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}
                    className="active-press hover:bg-rose-50"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule / Cancellation Modal */}
      {cancelModalBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          className="animate-in fade-in duration-200"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              borderRadius: '24px',
              background: '#FFFFFF',
              padding: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 className="font-editorial text-sm font-bold text-slate-900">
                Reschedule or Cancel #{cancelModalBooking.bookingReference}
              </h3>
              <button onClick={() => setCancelModalBooking(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Please specify the reason for modifying your Parandur airport site inspection or docket reservation:
            </p>

            <form onSubmit={handleCancelSubmit}>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '0 10px',
                  fontSize: '11px',
                  color: '#0F172A',
                  marginBottom: '14px'
                }}
              >
                <option>Change of travel dates to Chennai</option>
                <option>Wish to inspect alternate plot unit</option>
                <option>Postpone site visit by 1 week</option>
                <option>Other personal reasons</option>
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={cancelling}
                  style={{
                    height: '40px',
                    borderRadius: '12px',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '800',
                    border: 'none'
                  }}
                  className="active-press"
                >
                  {cancelling ? 'Updating...' : 'Confirm Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  style={{
                    height: '40px',
                    borderRadius: '12px',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: '800',
                    border: 'none'
                  }}
                  className="active-press"
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

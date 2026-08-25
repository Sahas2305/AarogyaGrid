/**
 * Page Name: BedBooking
 * Props: None
 * Description: Patient-facing bed booking page. Shows live ward availability,
 *   booking form, current/past bookings, and notifications on confirm/cancel.
 * Used on: App.jsx (guarded route /patient/beds)
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import {
  Bed, CheckCircle2, XCircle, Calendar, Clock, ChevronRight,
  MapPin, Stethoscope, Loader2, AlertTriangle, Info, RefreshCw
} from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useHospital } from '../../context/HospitalContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

// ── API helpers ───────────────────────────────────────────────────────────────
import { getWards, getBedBookings as getBookings, createBedBooking as bookBed, cancelBedBooking as cancelBooking } from '../../api/api';

// ── Ward color map ────────────────────────────────────────────────────────────
const WARD_COLORS = {
  cyan:    { border: 'border-brand-cyan/30',   bg: 'bg-brand-cyan/5',    text: 'text-brand-cyan',    badge: 'cyan'    },
  purple:  { border: 'border-brand-purple/30', bg: 'bg-brand-purple/5',  text: 'text-brand-purple',  badge: 'purple'  },
  blue:    { border: 'border-blue-400/30',      bg: 'bg-blue-500/5',      text: 'text-blue-400',      badge: 'cyan'    },
  danger:  { border: 'border-brand-danger/30', bg: 'bg-brand-danger/5',  text: 'text-brand-danger',  badge: 'danger'  },
  warning: { border: 'border-amber-400/30',    bg: 'bg-amber-500/5',     text: 'text-amber-400',     badge: 'warning' },
  success: { border: 'border-brand-success/30',bg: 'bg-brand-success/5', text: 'text-brand-success', badge: 'success' },
};

// ── Availability ring ─────────────────────────────────────────────────────────
const AvailBar = ({ available, total, color }) => {
  const pct = Math.round((available / total) * 100);
  const barColor =
    pct === 0 ? 'bg-brand-danger' :
    pct < 30  ? 'bg-amber-400' :
    'bg-brand-success';
  return (
    <div className="space-y-1">
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div className={`${barColor} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-text-secondary">
        <span>{available} available</span>
        <span>{total} total</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const BedBooking = () => {
  useRoleGuard(['patient']);
  const { currentUser } = useAuth();
  const { selectedHospital } = useHospital();

  const [wards, setWards]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingW, setLoadingW] = useState(true);
  const [loadingB, setLoadingB] = useState(true);

  // Booking modal state
  const [bookOpen, setBookOpen]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [admDate, setAdmDate]     = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [discDate, setDiscDate]   = useState(format(addDays(new Date(), 4), 'yyyy-MM-dd'));
  const [reason, setReason]       = useState('');
  const [booking, setBooking]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [newBooking, setNewBooking] = useState(null);

  // Cancel confirm
  const [cancelId, setCancelId]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchAll = async () => {
    setLoadingW(true); setLoadingB(true);
    try {
      const [w, b] = await Promise.all([getWards(), getBookings()]);
      setWards(Array.isArray(w) ? w : []);
      setBookings(Array.isArray(b) ? b : []);
    } catch {
      toast.error('Failed to load bed data.');
    } finally {
      setLoadingW(false); setLoadingB(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Duration in days
  const duration = admDate && discDate
    ? Math.max(1, Math.round((new Date(discDate) - new Date(admDate)) / 86400000))
    : 1;

  const handleOpenBook = (ward) => {
    setSelected(ward);
    setReason('');
    setSuccess(false);
    setNewBooking(null);
    setBookOpen(true);
  };

  const handleBook = async () => {
    if (!reason.trim()) { toast.error('Please describe the reason for admission.'); return; }
    if (admDate < today) { toast.error('Admission date cannot be in the past.'); return; }
    if (discDate <= admDate) { toast.error('Expected discharge must be after admission date.'); return; }

    setBooking(true);
    try {
      const result = await bookBed({
        ward_type:          selected.ward_type,
        admission_date:     admDate,
        expected_discharge: discDate,
        reason:             reason.trim(),
      });

      setNewBooking(result);
      setSuccess(true);
      setBookings(prev => [result, ...prev]);

      // Update availability count locally
      setWards(prev => prev.map(w =>
        w.ward_type === selected.ward_type
          ? { ...w, available: Math.max(0, w.available - 1), booked: w.booked + 1 }
          : w
      ));

      // 🔔 Toast notification
      toast.success(
        `🛏️ Bed booked in ${selected.ward_type}! Admission: ${admDate}`,
        {
          duration: 6000,
          style: { background: '#0d2044', border: '1px solid rgba(0,229,255,0.3)', color: '#fff' },
          icon: '🏥',
        }
      );

    } catch (e) {
      if (e.message?.includes('not set up') || e.message?.includes('migration')) {
        toast.error('Bed booking table not found. Run the DB setup script.');
      } else {
        toast.error(e.message || 'Booking failed. Try again.');
      }
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      setBookings(prev => prev.map(b =>
        b.booking_id === cancelId ? { ...b, status: 'Cancelled' } : b
      ));
      // Restore availability
      const cancelled = bookings.find(b => b.booking_id === cancelId);
      if (cancelled) {
        setWards(prev => prev.map(w =>
          w.ward_type === cancelled.ward_type
            ? { ...w, available: w.available + 1, booked: Math.max(0, w.booked - 1) }
            : w
        ));
      }
      toast.success('Bed booking cancelled successfully.');
      setCancelId(null);
    } catch (e) {
      toast.error(e.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Active');
  const pastBookings   = bookings.filter(b => b.status === 'Discharged' || b.status === 'Cancelled');

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 text-left select-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Bed Booking</h2>
            <p className="text-xs text-text-secondary mt-1">Reserve an inpatient bed at {selectedHospital.name}</p>
          </div>
        </div>
        <Button variant="outline" className="text-xs py-2 px-4 flex items-center space-x-2" onClick={fetchAll}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Availability</span>
        </Button>
      </div>

      {/* Active Booking Banner */}
      {activeBookings.length > 0 && (
        <div className="p-4 bg-brand-success/10 border border-brand-success/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">You have an active bed booking</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {activeBookings[0].ward_type} · Admission: {activeBookings[0].admission_date}
                {activeBookings[0].expected_discharge && ` · Est. Discharge: ${activeBookings[0].expected_discharge}`}
              </p>
            </div>
          </div>
          <Button variant="outline"
            className="text-xs py-1.5 px-3 text-brand-danger border-brand-danger/40 hover:bg-brand-danger/10"
            onClick={() => setCancelId(activeBookings[0].booking_id)}>
            Cancel Booking
          </Button>
        </div>
      )}

      {/* Ward Cards Grid */}
      <div>
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary mb-4">
          Available Ward Types
        </h3>
        {loadingW ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonLoader key={i} variant="card" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wards.map((ward) => {
              const c = WARD_COLORS[ward.color] || WARD_COLORS.cyan;
              const full = ward.available === 0;
              return (
                <Card key={ward.ward_type}
                  className={`p-5 border ${c.border} ${c.bg} hover:border-opacity-60 transition-all duration-200 flex flex-col justify-between`}>
                  <div className="space-y-3">
                    {/* Ward name + floor */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`text-sm font-extrabold ${c.text}`}>{ward.ward_type}</h4>
                        <div className="flex items-center space-x-1 text-[10px] text-text-secondary mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{ward.floor}</span>
                        </div>
                      </div>
                      <Badge variant={full ? 'danger' : c.badge} className="text-[9px] flex-shrink-0">
                        {full ? 'Full' : `${ward.available} Free`}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-2xl font-black ${c.text}`}>
                        ₹{ward.price_per_day.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-text-secondary font-mono">/ day</span>
                    </div>

                    {/* Availability bar */}
                    <AvailBar available={ward.available} total={ward.total_capacity} color={ward.color} />

                    {/* Facilities */}
                    <ul className="space-y-1">
                      {ward.facilities.slice(0, 3).map(f => (
                        <li key={f} className="flex items-center space-x-2 text-[10px] text-text-secondary">
                          <div className={`w-1.5 h-1.5 rounded-full ${c.text.replace('text-', 'bg-')}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                      {ward.facilities.length > 3 && (
                        <li className="text-[9px] text-text-secondary/50 pl-3.5">
                          +{ward.facilities.length - 3} more amenities
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button
                    className={`mt-5 w-full py-2 text-xs font-bold flex items-center justify-center space-x-2
                      ${full ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={full}
                    onClick={() => !full && handleOpenBook(ward)}
                  >
                    <Bed className="w-3.5 h-3.5" />
                    <span>{full ? 'No Beds Available' : 'Book This Ward'}</span>
                    {!full && <ChevronRight className="w-3.5 h-3.5" />}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* My Bookings */}
      {!loadingB && bookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">My Bookings</h3>
          <div className="space-y-3">
            {[...activeBookings, ...pastBookings].map(b => {
              const isActive = b.status === 'Confirmed' || b.status === 'Active';
              return (
                <div key={b.booking_id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3
                    ${isActive ? 'bg-brand-cyan/5 border-brand-cyan/20' : 'bg-white/[0.02] border-white/5'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        b.status === 'Confirmed' ? 'cyan' :
                        b.status === 'Active'    ? 'success' :
                        b.status === 'Discharged'? 'purple' : 'danger'
                      } className="text-[9px]">
                        {b.status}
                      </Badge>
                      <span className="text-xs font-bold text-white">{b.ward_type}</span>
                      <span className="text-[9px] text-text-secondary font-mono">#{b.booking_id}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] text-text-secondary">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Admit: {b.admission_date}</span>
                      </span>
                      {b.expected_discharge && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Discharge: {b.expected_discharge}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-secondary/70 italic">"{b.reason}"</p>
                    {b.price_per_day && b.expected_discharge && (
                      <p className="text-[10px] text-brand-cyan font-bold font-mono">
                        Est. Cost: ₹{(b.price_per_day * Math.max(1,
                          Math.round((new Date(b.expected_discharge) - new Date(b.admission_date)) / 86400000)
                        )).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <Button variant="outline"
                      className="text-xs py-1.5 px-3 text-brand-danger border-brand-danger/30 hover:bg-brand-danger/10 flex-shrink-0"
                      onClick={() => setCancelId(b.booking_id)}>
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Cancel
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hospital Info */}
      <div className="p-4 bg-[#112255]/30 border border-white/5 rounded-2xl flex items-start space-x-3">
        <Info className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />
        <div className="text-[10px] text-text-secondary space-y-0.5">
          <p className="font-bold text-white text-xs">{selectedHospital.name}</p>
          <p>{selectedHospital.address} · 📞 {selectedHospital.phone} · 🚨 Emergency: {selectedHospital.emergency}</p>
          <p>Bed bookings must be confirmed at the admission desk with a valid ID and doctor's referral.</p>
          <p className="text-[9px] text-text-secondary/50 mt-1">
            Admission timings: 9:00 AM – 5:00 PM · Emergency admissions: 24/7
          </p>
        </div>
      </div>

      {/* ── Booking Modal ─────────────────────────────────────────────────────── */}
      {selected && (
        <Modal isOpen={bookOpen} onClose={() => !booking && setBookOpen(false)}
          title={success ? 'Booking Confirmed!' : `Book: ${selected?.ward_type}`} size="md">

          {success && newBooking ? (
            /* Success screen */
            <div className="flex flex-col items-center py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-success/20 border-2 border-brand-success flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-brand-success" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Bed Reserved!</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Your booking ID is <span className="text-brand-cyan font-mono font-bold">#{newBooking.booking_id}</span>
                </p>
              </div>
              <div className="w-full p-4 bg-brand-success/10 border border-brand-success/20 rounded-xl text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Ward:</span>
                  <span className="text-white font-bold">{newBooking.ward_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Admission:</span>
                  <span className="text-white font-mono">{newBooking.admission_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Est. Discharge:</span>
                  <span className="text-white font-mono">{newBooking.expected_discharge}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-text-secondary">Est. Total Cost:</span>
                  <span className="text-brand-cyan font-bold font-mono">
                    ₹{(newBooking.price_per_day * duration).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary">
                🏥 Please report to the Admission Desk at {selectedHospital.name} with a doctor's referral.
              </p>
              <Button className="w-full py-2.5 text-xs font-bold" onClick={() => setBookOpen(false)}>
                Done
              </Button>
            </div>

          ) : (
            /* Booking form */
            <div className="space-y-5 text-left">
              {/* Summary */}
              <div className="p-4 bg-[#112255]/50 border border-white/8 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-white">{selected.ward_type}</p>
                    <p className="text-[10px] text-text-secondary">{selected.floor} · {selected.available} beds available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-brand-cyan">₹{selected.price_per_day?.toLocaleString('en-IN')}</p>
                    <p className="text-[9px] text-text-secondary">per day</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Admission Date</label>
                  <input type="date" min={today} value={admDate}
                    onChange={(e) => setAdmDate(e.target.value)}
                    className="w-full bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Expected Discharge</label>
                  <input type="date" min={admDate} value={discDate}
                    onChange={(e) => setDiscDate(e.target.value)}
                    className="w-full bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                </div>
              </div>

              {/* Duration + Est. cost */}
              <div className="flex items-center justify-between p-3 bg-brand-cyan/5 border border-brand-cyan/15 rounded-xl text-xs">
                <span className="text-text-secondary">Duration: <span className="text-white font-bold">{duration} day{duration !== 1 ? 's' : ''}</span></span>
                <span className="text-brand-cyan font-bold font-mono">
                  Est. ₹{(selected.price_per_day * duration).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Reason for Admission</label>
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Post-operative recovery after knee surgery..."
                  className="w-full bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none resize-none" />
              </div>

              {/* Doctor referral notice */}
              <div className="flex items-start space-x-2 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>A valid doctor's referral / prescription is required at the time of admission at {selectedHospital.name}.</span>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2 border-t border-white/5">
                <Button variant="outline" className="flex-1 py-2.5 text-xs"
                  onClick={() => setBookOpen(false)} disabled={booking}>
                  Cancel
                </Button>
                <Button className="flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-2"
                  onClick={handleBook} disabled={booking}>
                  {booking ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Reserving...</span></>
                  ) : (
                    <><Bed className="w-4 h-4" /><span>Confirm Booking</span></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── Cancel Confirm Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={!!cancelId} onClose={() => !cancelling && setCancelId(null)}
        title="Cancel Bed Booking" size="sm">
        <div className="space-y-5 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-brand-danger/20 border border-brand-danger/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-brand-danger" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Cancel this bed reservation?</p>
            <p className="text-xs text-text-secondary mt-1">This action cannot be undone. The bed will be released immediately.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1 py-2.5 text-xs"
              onClick={() => setCancelId(null)} disabled={cancelling}>
              Keep Booking
            </Button>
            <Button className="flex-1 py-2.5 text-xs font-bold bg-brand-danger border-brand-danger hover:bg-brand-danger/80"
              onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default BedBooking;

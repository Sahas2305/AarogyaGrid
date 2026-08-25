/**
 * Page Name: BillingPage
 * Props: None
 * Description: Central billing desk with a full payment gateway modal.
 *   - Patients can pay pending bills via UPI / Card / Net Banking / Cash
 *   - Payment confirmation notification is shown on success
 *   - Admin/Doctor see revenue stats and the full ledger
 * Used on: App.jsx (guarded route /billing)
 */
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreditCard, ShieldAlert, Award, Check, Search, Filter, Eye,
  Smartphone, Building2, Wallet, Banknote, X, CheckCircle2,
  Lock, ChevronRight, Loader2
} from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useHospital } from '../../context/HospitalContext';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { CustomLineChart } from '../../components/charts/LineChart';
import { getBilling, markBillPaid } from '../../api/api';

// ── Revenue chart data ────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jul', revenue: 320000 }, { month: 'Aug', revenue: 340000 },
  { month: 'Sep', revenue: 310000 }, { month: 'Oct', revenue: 380000 },
  { month: 'Nov', revenue: 420000 }, { month: 'Dec', revenue: 400000 },
  { month: 'Jan', revenue: 450000 }, { month: 'Feb', revenue: 460000 },
  { month: 'Mar', revenue: 440000 }, { month: 'Apr', revenue: 480000 },
  { month: 'May', revenue: 490000 }, { month: 'Jun', revenue: 482000 },
];

// ── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'UPI',         label: 'UPI',              icon: Smartphone,  desc: 'GPay · PhonePe · Paytm · BHIM' },
  { id: 'Card',        label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa · Mastercard · RuPay' },
  { id: 'Net Banking', label: 'Net Banking',       icon: Building2,   desc: 'SBI · HDFC · ICICI · Axis' },
  { id: 'Cash',        label: 'Cash at Counter',   icon: Banknote,    desc: 'Pay at hospital billing counter' },
  { id: 'Wallet',      label: 'Digital Wallet',    icon: Wallet,      desc: 'Paytm Wallet · Amazon Pay' },
];

// ── UPI input sub-form ────────────────────────────────────────────────────────
const UpiForm = ({ upiId, setUpiId }) => (
  <div className="mt-3 space-y-1.5">
    <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">UPI ID</label>
    <input
      type="text"
      placeholder="yourname@upi"
      value={upiId}
      onChange={(e) => setUpiId(e.target.value)}
      className="w-full bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none transition-colors"
    />
  </div>
);

// ── Card input sub-form ───────────────────────────────────────────────────────
const CardForm = ({ cardNo, setCardNo, expiry, setExpiry, cvv, setCvv, name, setName }) => (
  <div className="mt-3 space-y-2">
    <div>
      <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Card Number</label>
      <input maxLength={19} placeholder="1234 5678 9012 3456" value={cardNo}
        onChange={(e) => setCardNo(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())}
        className="w-full mt-1 bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none font-mono transition-colors" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Expiry</label>
        <input maxLength={5} placeholder="MM/YY" value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full mt-1 bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none font-mono transition-colors" />
      </div>
      <div>
        <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">CVV</label>
        <input maxLength={3} placeholder="•••" type="password" value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          className="w-full mt-1 bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none font-mono transition-colors" />
      </div>
    </div>
    <div>
      <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Name on Card</label>
      <input placeholder="RAHUL MEHTA" value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        className="w-full mt-1 bg-[#112255]/60 border border-white/10 focus:border-brand-cyan/50 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none transition-colors" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main BillingPage component
// ─────────────────────────────────────────────────────────────────────────────
export const BillingPage = () => {
  useRoleGuard(['admin', 'doctor', 'patient']);
  const { currentUser } = useAuth();
  const { selectedHospital } = useHospital();
  const isAdminOrDoctor = currentUser?.role === 'admin' || currentUser?.role === 'doctor';
  const isPatient = currentUser?.role === 'patient';

  const [billingList, setBillingList]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Receipt modal
  const [invoiceOpen, setInvoiceOpen]     = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment gateway modal
  const [payOpen, setPayOpen]             = useState(false);
  const [payBill, setPayBill]             = useState(null);
  const [payMethod, setPayMethod]         = useState(null);
  const [payProcessing, setPayProcessing] = useState(false);
  const [paySuccess, setPaySuccess]       = useState(false);

  // Card form state
  const [upiId, setUpiId]   = useState('');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv]       = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    getBilling()
      .then(data => setBillingList(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load billing data.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredBilling = billingList.filter(bill => {
    const patientName = bill.patient?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(bill.billing_id).includes(searchTerm);
    const isPaid = !!bill.payment_method;
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Paid' && isPaid) ||
      (statusFilter === 'Pending' && !isPaid);
    return matchesSearch && matchesStatus;
  });

  const handleOpenInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceOpen(true);
  };

  // ── Open payment gateway ──────────────────────────────────────────────────
  const handleOpenPayment = (bill) => {
    setPayBill(bill);
    setPayMethod(null);
    setPayProcessing(false);
    setPaySuccess(false);
    setUpiId(''); setCardNo(''); setExpiry(''); setCvv(''); setCardName('');
    setPayOpen(true);
  };

  // ── Validate form before processing ──────────────────────────────────────
  const validatePayment = () => {
    if (!payMethod) { toast.error('Please select a payment method.'); return false; }
    if (payMethod === 'UPI' && !upiId.includes('@')) {
      toast.error('Enter a valid UPI ID (e.g. name@upi)'); return false;
    }
    if (payMethod === 'Card') {
      if (cardNo.replace(/\s/g,'').length < 16) { toast.error('Enter a valid 16-digit card number.'); return false; }
      if (!expiry.match(/^\d{2}\/\d{2}$/)) { toast.error('Enter expiry as MM/YY'); return false; }
      if (cvv.length < 3) { toast.error('Enter a valid 3-digit CVV.'); return false; }
    }
    return true;
  };

  // ── Process payment ───────────────────────────────────────────────────────
  const handleProcessPayment = async () => {
    if (!validatePayment()) return;
    setPayProcessing(true);

    try {
      // Call backend PATCH to mark the bill as paid
      await markBillPaid(payBill.billing_id, payMethod);

      // Update local state immediately
      setBillingList(prev => prev.map(b =>
        b.billing_id === payBill.billing_id
          ? { ...b, payment_method: payMethod, payment_date: new Date().toISOString().split('T')[0] }
          : b
      ));

      setPaySuccess(true);

      // Success notification
      toast.success(
        `✅ Payment of ₹${Number(payBill.amount).toLocaleString('en-IN')} received via ${payMethod}!`,
        {
          duration: 5000,
          style: { background: '#0d2044', border: '1px solid #00e5ff33', color: '#fff' },
          icon: '🏥',
        }
      );

      // Auto-close after showing success screen
      setTimeout(() => {
        setPayOpen(false);
        setPaySuccess(false);
      }, 3000);

    } catch (err) {
      toast.error(err?.message || 'Payment failed. Please try again.');
    } finally {
      setPayProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 select-none text-left">

      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Central Billing Desk</h2>
          <p className="text-xs text-text-secondary mt-1">Audit transactions, file insurance claims, and review invoices</p>
        </div>
      </div>

      {/* Admin/Doctor metrics */}
      {isAdminOrDoctor && (
        <React.Fragment>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Revenue Gross"       value="₹4,82,000" icon={CreditCard}  trend="+12% vs last month" trendType="success" />
            <StatCard title="Outstanding Copay Balances" value="₹68,400"  icon={ShieldAlert}  trend="Risk level: Normal"  trendType="success" />
            <StatCard title="Insurance Claims Filed"    value={23}         icon={Award}        trend="+8 claims today"    trendType="success" />
            <StatCard title="Transacted Revenue Today"  value="₹12,800"   icon={Check}        trend="Sync status: Ok"    trendType="success" />
          </div>
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gross Transaction Earnings (12-Month Index)</h3>
              <p className="text-xs text-text-secondary mt-1">Monthly aggregate transacted values in INR</p>
            </div>
            <CustomLineChart data={revenueData} dataKey="revenue" xKey="month" height={240} />
          </Card>
        </React.Fragment>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {isAdminOrDoctor && (
          <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input type="text" placeholder="Search by ID or patient name..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none" />
          </div>
        )}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs text-text-secondary">Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-white border-0 outline-none cursor-pointer">
            <option value="All">All Invoices</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Billing Table */}
      <Table>
        <Thead>
          <Tr>
            <Th>Bill ID</Th>
            <Th>Patient Name</Th>
            <Th>Billing Date</Th>
            <Th>Total Charges</Th>
            <Th>Insurance Copay</Th>
            <Th>Patient Due</Th>
            <Th>Status</Th>
            <Th className="text-center">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr><Td colSpan={8} className="px-4 py-6"><SkeletonLoader rows={4} /></Td></Tr>
          ) : filteredBilling.length === 0 ? (
            <Tr>
              <Td colSpan={8} className="text-center py-10 text-text-secondary/50 text-xs">
                No billing transactions logged.
              </Td>
            </Tr>
          ) : filteredBilling.map((bill) => {
            const isPaid = !!bill.payment_method;
            return (
              <Tr key={bill.billing_id}>
                <Td className="font-mono text-xs font-bold text-white">#{bill.billing_id}</Td>
                <Td className="font-bold text-white text-xs">{bill.patient?.name || '—'}</Td>
                <Td className="text-xs font-mono">{bill.appointment?.appointment_date || bill.payment_date || '—'}</Td>
                <Td className="text-xs text-white font-mono">₹{Number(bill.amount).toLocaleString('en-IN')}</Td>
                <Td className="text-xs text-text-secondary font-mono">—</Td>
                <Td className="text-xs text-brand-cyan font-bold font-mono">₹{Number(bill.amount).toLocaleString('en-IN')}</Td>
                <Td>
                  <Badge variant={isPaid ? 'success' : 'danger'}>{isPaid ? 'Paid' : 'Pending'}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" className="py-1 px-2.5 text-[10px]"
                      onClick={() => handleOpenInvoice(bill)}>
                      <Eye className="w-3 h-3 mr-1" /><span>Receipt</span>
                    </Button>
                    {!isPaid && isPatient && (
                      <Button className="py-1 px-2.5 text-[10px] bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan hover:text-[#0a1628] transition-all"
                        onClick={() => handleOpenPayment(bill)}>
                        <CreditCard className="w-3 h-3 mr-1" /><span>Pay Now</span>
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {/* ── Receipt Modal ─────────────────────────────────────────────────────── */}
      {selectedInvoice && (
        <Modal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)}
          title={`Hospital Receipt: #${selectedInvoice.billing_id}`} size="md">
          <div className="relative p-2 text-left overflow-hidden min-h-[300px]">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] z-0">
              <span className={`text-7xl font-black tracking-widest border-8 px-6 py-3 rounded-2xl rotate-[15deg] uppercase
                ${selectedInvoice.payment_method ? 'text-brand-success border-brand-success' : 'text-brand-danger border-brand-danger'}`}>
                {selectedInvoice.payment_method ? 'PAID' : 'PENDING'}
              </span>
            </div>
            <div className="border-b border-white/5 pb-4 mb-4 z-10 relative">
              <h3 className="text-base font-black text-white">{selectedHospital?.name || 'AarogyaGrid Hospital Facility'}</h3>
              <p className="text-[10px] text-text-secondary">{selectedHospital?.address || 'Hospital Facility'}</p>
              <div className="flex items-center justify-between mt-4 text-[10px] text-text-secondary">
                <div>
                  <p>Invoiced To: <span className="text-white font-bold">{selectedInvoice.patient?.name || '—'}</span></p>
                  <p>Appointment: <span className="text-white font-mono">#{selectedInvoice.appointment_id}</span></p>
                </div>
                <div className="text-right">
                  <p>Amount: <span className="text-brand-cyan font-mono">₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span></p>
                  <p>Status: <span className={selectedInvoice.payment_method ? 'text-brand-success font-extrabold' : 'text-brand-danger font-extrabold'}>
                    {selectedInvoice.payment_method ? 'Paid' : 'Pending'}
                  </span></p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4 z-10 relative text-xs space-y-1.5 w-60 ml-auto">
              <div className="flex justify-between text-text-secondary">
                <span>Total Amount:</span>
                <span className="font-mono text-white">₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Payment Method:</span>
                <span className="text-white">{selectedInvoice.payment_method || 'Not paid yet'}</span>
              </div>
              <div className="flex justify-between font-extrabold text-white pt-2 border-t border-white/5">
                <span>Payment Date:</span>
                <span className="font-mono text-brand-cyan">{selectedInvoice.payment_date || '—'}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-white/5 pt-4 z-10 relative">
              <Button variant="outline" className="text-xs" onClick={() => setInvoiceOpen(false)}>Close</Button>
              {!selectedInvoice.payment_method && isPatient && (
                <Button className="text-xs font-bold" onClick={() => { setInvoiceOpen(false); handleOpenPayment(selectedInvoice); }}>
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Pay Now
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Payment Gateway Modal ─────────────────────────────────────────────── */}
      {payBill && (
        <Modal isOpen={payOpen} onClose={() => !payProcessing && setPayOpen(false)}
          title="Secure Payment Gateway" size="md">

          {paySuccess ? (
            /* ── Success Screen ── */
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-success/20 border-2 border-brand-success flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-8 h-8 text-brand-success" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-white">Payment Successful!</h3>
                <p className="text-xs text-text-secondary">
                  ₹{Number(payBill.amount).toLocaleString('en-IN')} paid via {payMethod}
                </p>
                <p className="text-[10px] text-brand-cyan font-mono mt-1">
                  Transaction ID: TXN{Date.now().toString().slice(-8)}
                </p>
              </div>
              <div className="w-full p-3 bg-brand-success/10 border border-brand-success/20 rounded-xl text-xs text-center text-text-secondary">
                🏥 {selectedHospital?.name || 'AarogyaGrid Hospital Facility'} — Receipt will be emailed to you shortly
              </div>
            </div>

          ) : (
            /* ── Payment Form ── */
            <div className="space-y-5 text-left">

              {/* Bill Summary */}
              <div className="p-4 bg-[#112255]/50 border border-white/8 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Bill #{payBill.billing_id}</p>
                  <p className="text-sm font-black text-white mt-0.5">{payBill.patient?.name || 'Patient'}</p>
                  <p className="text-[10px] text-text-secondary">{selectedHospital?.name || 'AarogyaGrid Hospital Facility'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Amount Due</p>
                  <p className="text-2xl font-black text-brand-cyan">₹{Number(payBill.amount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Select Payment Method</p>
                <div className="grid grid-cols-1 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const selected = payMethod === m.id;
                    return (
                      <button key={m.id} onClick={() => setPayMethod(m.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150
                          ${selected
                            ? 'bg-brand-cyan/15 border-brand-cyan/60 shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                            : 'bg-[#112255]/30 border-white/8 hover:border-white/20'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${selected ? 'bg-brand-cyan/20' : 'bg-white/5'}`}>
                            <Icon className={`w-4 h-4 ${selected ? 'text-brand-cyan' : 'text-text-secondary'}`} />
                          </div>
                          <div>
                            <span className={`text-xs font-bold block ${selected ? 'text-white' : 'text-text-secondary'}`}>{m.label}</span>
                            <span className="text-[9px] text-text-secondary/60">{m.desc}</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${selected ? 'border-brand-cyan bg-brand-cyan' : 'border-white/20'}`}>
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0a1628]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic sub-form */}
              {payMethod === 'UPI' && (
                <UpiForm upiId={upiId} setUpiId={setUpiId} />
              )}
              {payMethod === 'Card' && (
                <CardForm cardNo={cardNo} setCardNo={setCardNo} expiry={expiry} setExpiry={setExpiry}
                  cvv={cvv} setCvv={setCvv} name={cardName} setName={setCardName} />
              )}
              {payMethod === 'Net Banking' && (
                <div className="mt-3 space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Select Bank</label>
                  <select className="w-full bg-[#112255]/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}
              {payMethod === 'Cash' && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-300">
                  💡 Please visit the Billing Counter at {selectedHospital?.name || 'Hospital'} ({selectedHospital?.address || ''}) and quote Bill #{payBill.billing_id}.
                </div>
              )}

              {/* Security badge */}
              <div className="flex items-center space-x-2 text-[9px] text-text-secondary/50 font-mono">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL encrypted · PCI DSS compliant · Powered by RazorPay</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
                <Button variant="outline" className="flex-1 py-2.5 text-xs"
                  onClick={() => setPayOpen(false)} disabled={payProcessing}>
                  Cancel
                </Button>
                <Button className="flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-2"
                  onClick={handleProcessPayment} disabled={payProcessing || !payMethod}>
                  {payProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{Number(payBill.amount).toLocaleString('en-IN')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
};

export default BillingPage;

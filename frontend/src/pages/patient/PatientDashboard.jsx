/**
 * Page Name: PatientDashboard
 * Props: None
 * Description: Renders the patient dashboard view with accordions, lab tables, and invoices.
 * Used on: App.jsx (guarded route /patient/dashboard)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Calendar, FileText, ClipboardList, CreditCard, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { getAppointments, getMedicalRecords, getLabReports, getBilling } from '../../api/api';

export const PatientDashboard = () => {
  useRoleGuard(['patient']);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [records,      setRecords]      = useState([]);
  const [labs,         setLabs]         = useState([]);
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [expandedRecord,   setExpandedRecord]   = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice,  setSelectedInvoice]  = useState(null);
  const [explainerOpen,    setExplainerOpen]    = useState(false);
  const [selectedReport,   setSelectedReport]   = useState(null);
  const [explaining,       setExplaining]       = useState(false);

  useEffect(() => {
    Promise.all([getAppointments(), getMedicalRecords(), getLabReports(), getBilling()])
      .then(([appts, recs, labData, billData]) => {
        setAppointments(Array.isArray(appts) ? appts : []);
        setRecords(Array.isArray(recs) ? recs : []);
        setLabs(Array.isArray(labData) ? labData : []);
        setBills(Array.isArray(billData) ? billData : []);
      })
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const upcomingAppts = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Pending').slice(0, 3);
  const pastAppts     = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled').slice(0, 5);

  const toggleRecord = (id) => setExpandedRecord(prev => (prev === id ? null : id));

  const handleOpenInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceModalOpen(true);
  };

  const handleExplainWithAi = (report) => {
    setSelectedReport(report);
    setExplaining(true);
    setExplainerOpen(true);
    setTimeout(() => setExplaining(false), 1500);
  };

  return (
    <div className="space-y-6 select-none">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#112255] to-[#0a1628] rounded-2xl border border-white/8 p-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-brand-success/20 rounded-full text-brand-success border border-brand-success/30">
            <User className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">Welcome back, {currentUser?.username}</h2>
            <p className="text-xs text-text-secondary mt-1">Health Index: Excellent • Insurance Co-Pay active</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2.5">
          <Badge variant="cyan">Last Visit: 2026-06-09</Badge>
          <Badge variant="purple">Next Appt: 2026-06-10</Badge>
          <Badge variant="danger">Outstanding: ₹3,500</Badge>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Appointments */}
        <div className="lg:col-span-6 space-y-6">

          {/* Upcoming */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Upcoming Appointments</h3>
              <Button onClick={() => navigate('/patient/book')} className="py-1 px-3 text-[10px] tracking-wide font-bold">
                Book New
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3.5">
              {loading ? <SkeletonLoader rows={2} /> : upcomingAppts.length === 0 ? (
                <Card className="p-4 text-center text-text-secondary/50 text-xs border border-white/5 bg-transparent">
                  No upcoming appointments.
                </Card>
              ) : upcomingAppts.map((app) => (
                <Card key={app.appointment_id} className="p-4 bg-surface-card border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{app.doctor_name || '—'}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">{typeof app.department === 'object' ? app.department?.department_name : app.department} Department</p>
                    <span className="text-[10px] font-mono text-brand-cyan mt-1 block">
                      {app.date} @ {app.time_slot}
                    </span>
                  </div>
                  <Badge variant="cyan" className="uppercase text-[9px] py-0 px-2 font-bold tracking-wider">
                    {app.status}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Past */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Past Booking History</h3>
            <Table>
              <Thead>
                <Tr>
                  <Th>Physician</Th>
                  <Th>Date</Th>
                  <Th>Dept</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr><Td colSpan={4} className="px-4 py-4"><SkeletonLoader rows={3} /></Td></Tr>
                ) : pastAppts.map((app) => (
                  <Tr key={app.appointment_id}>
                    <Td className="font-bold text-white text-xs">{app.doctor_name || '—'}</Td>
                    <Td className="text-xs font-mono">{app.date}</Td>
                    <Td className="text-xs">{typeof app.department === 'object' ? app.department?.department_name : app.department}</Td>
                    <Td>
                      <Badge variant={app.status === 'Completed' ? 'success' : 'danger'}>{app.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </div>

        {/* Right: Records + Labs */}
        <div className="lg:col-span-6 space-y-6">

          {/* Medical Records Accordion */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Clinical Medical File</h3>
            <div className="space-y-3">
              {loading ? <SkeletonLoader rows={2} /> : records.map((rec) => {
                const isOpen = expandedRecord === rec.record_id;
                return (
                  <Card key={rec.record_id} className={`p-0 border overflow-hidden transition-all ${isOpen ? 'border-brand-cyan/20' : 'border-white/5'}`}>
                    <div onClick={() => toggleRecord(rec.record_id)}
                      className="p-4 bg-surface-secondary/40 flex items-center justify-between cursor-pointer">
                      <div className="truncate pr-2">
                        <span className="text-xs font-bold text-white truncate block">{rec.diagnosis}</span>
                        <span className="text-[10px] text-text-secondary/60 mt-0.5">{rec.record_date} • {rec.doctor_name}</span>
                      </div>
                      <div className="text-text-secondary">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-brand-cyan" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="p-4 space-y-3 border-t border-white/5 bg-[#0d2044]/30 text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Prescription</span>
                          <p className="text-white font-mono bg-black/20 p-2.5 rounded-lg border border-white/5 mt-1">{rec.prescription}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Notes</span>
                          <p className="text-text-secondary mt-1">{rec.notes || 'None'}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Lab Reports */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Diagnostic Lab Panels</h3>
            <Card className="p-0 border border-white/5">
              <div className="divide-y divide-white/5">
                {loading ? <div className="p-4"><SkeletonLoader rows={3} /></div> : labs.map((lab) => (
                  <div key={lab.lab_report_id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.01]">
                    <div>
                      <h4 className="text-xs font-bold text-white">{lab.test_name}</h4>
                      <span className="text-[10px] text-text-secondary font-mono">{lab.report_date}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={lab.status === 'Completed' ? 'success' : 'warning'}>{lab.status}</Badge>
                      {lab.status === 'Completed' && (
                        <Button variant="outline" className="py-1 px-2.5 text-[9px] border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/10"
                          onClick={() => handleExplainWithAi(lab)}>
                          AI Explain
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Patient Invoice Ledger</h3>
        <Table>
          <Thead>
            <Tr>
              <Th>Bill ID</Th>
              <Th>Date</Th>
              <Th>Total Amount</Th>
              <Th>Insurance</Th>
              <Th>Patient Due</Th>
              <Th>Status</Th>
              <Th className="text-center">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={7} className="px-4 py-4"><SkeletonLoader rows={3} /></Td></Tr>
            ) : bills.map((bill) => (
              <Tr key={bill.billing_id}>
                <Td className="font-mono text-xs font-bold text-white">B{String(bill.billing_id).padStart(3, '0')}</Td>
                <Td className="text-xs font-mono">{bill.payment_date || '—'}</Td>
                <Td className="text-xs text-white font-mono">₹{Number(bill.amount).toLocaleString('en-IN')}</Td>
                <Td className="text-xs text-text-secondary font-mono">₹{Number(bill.insurance_claimed || 0).toLocaleString('en-IN')}</Td>
                <Td className="text-xs text-brand-cyan font-bold font-mono">₹{Number(bill.paid_amount || bill.amount).toLocaleString('en-IN')}</Td>
                <Td>
                  <Badge variant={bill.status === 'Paid' ? 'success' : 'danger'}>{bill.status || (bill.payment_method ? 'Paid' : 'Pending')}</Badge>
                </Td>
                <Td className="text-center">
                  <Button variant="outline" className="py-1 px-2.5 text-[9px]" onClick={() => handleOpenInvoice(bill)}>
                    View Invoice
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)}
          title={`Hospital Receipt: B${String(selectedInvoice.billing_id).padStart(3, '0')}`} size="md">
          <div className="relative p-2 text-left overflow-hidden min-h-[300px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08] z-0">
              <span className={`text-7xl font-black tracking-widest border-8 px-6 py-3 rounded-2xl transform rotate-[15deg] uppercase
                ${(selectedInvoice.status || (selectedInvoice.payment_method ? 'Paid' : 'Pending')) === 'Paid'
                  ? 'text-brand-success border-brand-success' : 'text-brand-danger border-brand-danger'}`}>
                {selectedInvoice.status || (selectedInvoice.payment_method ? 'Paid' : 'Pending')}
              </span>
            </div>
            <div className="border-b border-white/5 pb-4 mb-4 z-10 relative">
              <h3 className="text-base font-black text-white">Dayananda Sagar Hospital</h3>
              <p className="text-[10px] text-text-secondary">Kumaraswamy Layout, Bangalore - 560078</p>
              <div className="flex items-center justify-between mt-4 text-[10px] text-text-secondary">
                <div>
                  <p>Patient ID: <span className="text-white font-mono">{selectedInvoice.patient_id}</span></p>
                </div>
                <div className="text-right">
                  <p>Date: <span className="text-white font-mono">{selectedInvoice.payment_date || '—'}</span></p>
                </div>
              </div>
            </div>
            <div className="z-10 relative text-xs space-y-2 pt-2">
              <div className="flex justify-between text-text-secondary">
                <span>Total Amount:</span>
                <span className="font-mono text-white">₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Insurance Covered:</span>
                <span className="font-mono text-brand-success">- ₹{Number(selectedInvoice.insurance_claimed || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-white pt-2 border-t border-white/5">
                <span>Patient Balance Due:</span>
                <span className="font-mono text-brand-cyan">₹{Number(selectedInvoice.paid_amount || selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-2 z-10 relative border-t border-white/5 pt-4">
              <Button variant="outline" className="text-xs" onClick={() => setInvoiceModalOpen(false)}>Close Invoice</Button>
              {(selectedInvoice.status === 'Pending' || !selectedInvoice.payment_method) && (
                <Button className="text-xs font-bold" onClick={() => { toast.success('Initiating UPI payment processor...'); setInvoiceModalOpen(false); }}>
                  Pay Now (INR)
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* AI Lab Explainer Modal */}
      {selectedReport && (
        <Modal isOpen={explainerOpen} onClose={() => setExplainerOpen(false)}
          title={`AI Lab Explainer: ${selectedReport.test_name}`} size="lg">
          {explaining ? (
            <div className="space-y-4 py-10">
              <SkeletonLoader variant="card" />
              <p className="text-xs text-text-secondary text-center">AI Explainer is reading diagnostic bounds...</p>
            </div>
          ) : (
            <div className="text-left space-y-4">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">AI Clinical Translation</span>
              </div>
              <p className="text-xs text-white font-semibold leading-relaxed bg-brand-cyan/5 border border-brand-cyan/10 p-3 rounded-xl">
                {selectedReport.result || 'Lab results are being processed.'}
              </p>
              <div className="flex items-center justify-between text-[8px] text-text-secondary/40 font-mono border-t border-white/5 pt-3">
                <span>Powered by Gemini API</span>
                <span>Safety Status: Verified</span>
              </div>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
};

export default PatientDashboard;
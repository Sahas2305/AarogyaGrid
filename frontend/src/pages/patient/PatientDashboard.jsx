/**
 * Page Name: PatientDashboard
 * Props: None
 * Description: Renders the patient dashboard view with accordions, lab tables, and invoices.
 * Used on: App.jsx (guarded route /patient/dashboard)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Calendar, FileText, ClipboardList, CreditCard, ChevronDown, ChevronUp, FileHeart, HelpCircle, Eye, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockPatients } from '../../data/mockPatients';
import { mockAppointments } from '../../data/mockAppointments';
import { mockMedicalRecords } from '../../data/mockMedicalRecords';
import { mockLabReports } from '../../data/mockLabReports';
import { mockBilling } from '../../data/mockBilling';

export const PatientDashboard = () => {
  useRoleGuard(['patient']);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Accordion state
  const [expandedRecord, setExpandedRecord] = useState(null);
  
  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [explaining, setExplaining] = useState(false);

  // Filter patient specific data (Rahul Mehta - P01)
  const patientId = 'P01';
  const appointments = mockAppointments.filter(app => app.patientId === patientId);
  const records = mockMedicalRecords.filter(rec => rec.patientId === patientId);
  const labs = mockLabReports.filter(lab => lab.patientId === patientId);
  const bills = mockBilling.filter(bill => bill.patientId === patientId);

  const upcomingAppts = appointments.filter(app => app.status === 'Scheduled').slice(0, 3);
  const pastAppts = appointments.filter(app => app.status === 'Completed' || app.status === 'Cancelled').slice(0, 5);

  const toggleRecord = (id) => {
    setExpandedRecord(prev => (prev === id ? null : id));
  };

  const handleOpenInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceModalOpen(true);
  };

  const handleExplainWithAi = (report) => {
    setSelectedReport(report);
    setExplaining(true);
    setExplainerOpen(true);
    setTimeout(() => {
      setExplaining(false);
    }, 1500);
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
            <h2 className="text-xl md:text-2xl font-black text-white">Welcome back, {currentUser?.name}</h2>
            <p className="text-xs text-text-secondary mt-1">Health Index: Excellent • Insurance Co-Pay active</p>
          </div>
        </div>

        {/* Health summary strip */}
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2.5">
          <Badge variant="cyan">Last Visit: 2026-06-09</Badge>
          <Badge variant="purple">Next Appt: 2026-06-10</Badge>
          <Badge variant="danger">Outstanding: ₹3,500</Badge>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Appointments */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Upcoming appointments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Upcoming Appointments</h3>
              <Button onClick={() => navigate('/patient/book')} className="py-1 px-3 text-[10px] tracking-wide font-bold">
                Book New
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-3.5">
              {upcomingAppts.length === 0 ? (
                <Card className="p-4 text-center text-text-secondary/50 text-xs border border-white/5 bg-transparent">
                  No upcoming appointments.
                </Card>
              ) : (
                upcomingAppts.map((app) => (
                  <Card key={app.appointmentId} className="p-4 bg-surface-card border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{app.doctorName}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">{app.department} Department</p>
                      <span className="text-[10px] font-mono text-brand-cyan mt-1 block">
                        {app.date} @ {app.timeSlot}
                      </span>
                    </div>
                    <Badge variant={app.type === 'In-Person' ? 'cyan' : 'purple'} className="uppercase text-[9px] py-0 px-2 font-bold tracking-wider">
                      {app.type}
                    </Badge>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Past Appointments */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Past Booking History</h3>
            <Table>
              <Thead>
                <Tr>
                  <Th>Physician</Th>
                  <Th>Date</Th>
                  <Th>Specialty</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pastAppts.map((app) => (
                  <Tr key={app.appointmentId}>
                    <Td className="font-bold text-white text-xs">{app.doctorName}</Td>
                    <Td className="text-xs font-mono">{app.date}</Td>
                    <Td className="text-xs">{app.department}</Td>
                    <Td>
                      <Badge variant={app.status === 'Completed' ? 'success' : 'danger'}>
                        {app.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>

        </div>

        {/* Right Column: Medical History Accordion & Labs */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Medical Records Accordion */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Clinical Medical File</h3>
            <div className="space-y-3">
              {records.map((rec) => {
                const isOpen = expandedRecord === rec.recordId;
                return (
                  <Card
                    key={rec.recordId}
                    className={`p-0 border overflow-hidden transition-all ${
                      isOpen ? 'border-brand-cyan/20' : 'border-white/5'
                    }`}
                  >
                    {/* Header bar click toggle */}
                    <div
                      onClick={() => toggleRecord(rec.recordId)}
                      className="p-4 bg-surface-secondary/40 flex items-center justify-between cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="text-xs font-bold text-white truncate block">{rec.diagnosis}</span>
                        <span className="text-[10px] text-text-secondary/60 mt-0.5">{rec.date} • {rec.doctorName}</span>
                      </div>
                      <div className="text-text-secondary">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-brand-cyan" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expandable Vitals and Notes */}
                    {isOpen && (
                      <div className="p-4 space-y-4 border-t border-white/5 bg-[#0d2044]/30">
                        {/* Vitals metrics */}
                        <div className="grid grid-cols-4 gap-2">
                          <StatCard small title="BP (mmHg)" value={rec.vitals.bp} icon={Heart} />
                          <StatCard small title="HR (bpm)" value={rec.vitals.hr} icon={Heart} />
                          <StatCard small title="Temp (°F)" value={rec.vitals.temp} icon={Heart} />
                          <StatCard small title="SpO2 (%)" value={rec.vitals.spo2} icon={Heart} />
                        </div>
                        
                        <div className="text-xs space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Recommended Treatment</span>
                            <p className="text-text-secondary mt-1 font-medium">{rec.treatment}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Prescriptions</span>
                            <p className="text-white font-mono bg-black/20 p-2.5 rounded-lg border border-white/5 whitespace-pre-line mt-1">
                              {rec.prescription}
                            </p>
                          </div>
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
                {labs.map((lab) => (
                  <div key={lab.reportId} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.01]">
                    <div>
                      <h4 className="text-xs font-bold text-white">{lab.testName}</h4>
                      <span className="text-[10px] text-text-secondary font-mono">{lab.date} • {lab.doctorName}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={lab.status === 'Completed' ? 'success' : 'warning'}>{lab.status}</Badge>
                      {lab.status === 'Completed' && (
                        <Button
                          variant="outline"
                          className="py-1 px-2.5 text-[9px] border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/10"
                          onClick={() => handleExplainWithAi(lab)}
                        >
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

      {/* Bills / Invoices */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Patient Invoice Ledger</h3>
        <Table>
          <Thead>
            <Tr>
              <Th>Bill ID</Th>
              <Th>Invoiced Date</Th>
              <Th>Total Amount</Th>
              <Th>Insurance Copay</Th>
              <Th>Patient Due</Th>
              <Th>Status</Th>
              <Th className="text-center">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bills.map((bill) => (
              <Tr key={bill.billId}>
                <Td className="font-mono text-xs font-bold text-white">{bill.billId}</Td>
                <Td className="text-xs font-mono">{bill.date}</Td>
                <Td className="text-xs text-white">₹{bill.totalAmount.toLocaleString('en-IN')}</Td>
                <Td className="text-xs text-text-secondary">₹{bill.insuranceClaimed.toLocaleString('en-IN')}</Td>
                <Td className="text-xs text-brand-cyan font-bold">₹{bill.paidAmount.toLocaleString('en-IN')}</Td>
                <Td>
                  <Badge variant={bill.status === 'Paid' ? 'success' : 'danger'}>{bill.status}</Badge>
                </Td>
                <Td className="text-center">
                  <Button
                    variant="outline"
                    className="py-1 px-2.5 text-[9px]"
                    onClick={() => handleOpenInvoice(bill)}
                  >
                    View Invoice
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Invoice Modal with paid/pending stamp watermark */}
      {selectedInvoice && (
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title={`Hospital Receipt: ${selectedInvoice.billId}`}
          size="md"
        >
          {/* Stamp watermark overlay */}
          <div className="relative p-2 text-left select-none overflow-hidden min-h-[380px]">
            {/* stamp wrapper */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08] z-0">
              <span
                className={`
                  text-7xl font-black tracking-widest border-8 px-6 py-3 rounded-2xl transform rotate-[15deg] uppercase
                  ${selectedInvoice.status === 'Paid' ? 'text-brand-success border-brand-success' : 'text-brand-danger border-brand-danger'}
                `}
              >
                {selectedInvoice.status}
              </span>
            </div>

            {/* Invoice Header */}
            <div className="border-b border-white/5 pb-4 mb-4 z-10 relative">
              <h3 className="text-base font-black text-white">Dayananda Sagar Hospital</h3>
              <p className="text-[10px] text-text-secondary">Kumaraswamy Layout, Bangalore - 560078</p>
              <div className="flex items-center justify-between mt-4 text-[10px] text-text-secondary">
                <div>
                  <p>Invoiced To: <span className="text-white font-bold">{selectedInvoice.patientName}</span></p>
                  <p>Patient ID: <span className="text-white font-mono">{selectedInvoice.patientId}</span></p>
                </div>
                <div className="text-right">
                  <p>Date: <span className="text-white font-mono">{selectedInvoice.date}</span></p>
                  <p>Status: <span className={selectedInvoice.status === 'Paid' ? 'text-brand-success font-extrabold' : 'text-brand-danger font-extrabold'}>{selectedInvoice.status}</span></p>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="z-10 relative space-y-3">
              <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest">Itemized Charges</span>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-text-secondary text-[10px] font-bold">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-text-secondary hover:text-white transition-colors">{item.description}</td>
                      <td className="py-2 text-right font-mono">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">₹{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-white/5 pt-4 mt-6 z-10 relative text-xs space-y-1.5 w-60 ml-auto">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal Charges:</span>
                <span className="font-mono text-white">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Insurance Coverage:</span>
                <span className="font-mono text-brand-success">- ₹{selectedInvoice.insuranceClaimed.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/5">
                <span>Total Due:</span>
                <span className="font-mono text-brand-cyan">₹{selectedInvoice.paidAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex justify-end space-x-2 z-10 relative border-t border-white/5 pt-4">
              <Button variant="outline" className="text-xs" onClick={() => setInvoiceModalOpen(false)}>
                Close Invoice
              </Button>
              {selectedInvoice.status === 'Pending' && (
                <Button
                  className="text-xs font-bold"
                  onClick={() => {
                    toast.success('Initiating Indian UPI payment processor...');
                    setInvoiceModalOpen(false);
                  }}
                >
                  Pay Now (INR)
                </Button>
              )}
            </div>

          </div>
        </Modal>
      )}

      {/* AI Explainer Modal overlay */}
      {selectedReport && (
        <Modal
          isOpen={explainerOpen}
          onClose={() => setExplainerOpen(false)}
          title={`AI Lab Report Explainer: ${selectedReport.testName}`}
          size="lg"
        >
          {explaining ? (
            <div className="space-y-4 py-10">
              <SkeletonLoader variant="card" />
              <p className="text-xs text-text-secondary text-center">AI Explainer is reading diagnostic bounds...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left select-none">
              
              {/* Left Column values */}
              <div className="md:col-span-6 space-y-4">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold block">Lab Measurements</span>
                <div className="p-4 bg-surface-secondary/40 border border-white/5 rounded-2xl space-y-3">
                  {selectedReport.results.map((res, i) => (
                    <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="text-white font-bold block">{res.parameter}</span>
                        <span className="text-[9px] text-text-secondary font-mono">Ref: {res.referenceRange} {res.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-mono block">{res.value} {res.unit}</span>
                        <Badge variant={res.status === 'High' || res.status === 'Low' ? 'warning' : 'success'} className="text-[8px] py-0">
                          {res.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column AI explanation */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
                  <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">AI Clinical Translation</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <p className="text-white leading-relaxed font-semibold">
                    {selectedReport.aiExplanation?.summary}
                  </p>
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Key Findings</span>
                    <ul className="list-disc pl-4 text-text-secondary space-y-1 leading-relaxed">
                      {selectedReport.aiExplanation?.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Suggested Actions</span>
                    <ol className="list-decimal pl-4 text-text-secondary space-y-1 leading-relaxed">
                      {selectedReport.aiExplanation?.actions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] text-text-secondary/40 font-mono border-t border-white/5 pt-3 mt-4">
                  <span>Powered by Gemini API</span>
                  <span>Safety Status: Verified</span>
                </div>
              </div>

            </div>
          )}
        </Modal>
      )}

    </div>
  );
};

export default PatientDashboard;

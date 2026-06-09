/**
 * Page Name: LabReports
 * Props: None
 * Description: Shared lab reports directory detailing test files and order registers.
 * Used on: App.jsx (guarded route /labs)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardList, Search, Plus, Sparkles, ShieldAlert, Award, FileText, Check } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockLabReports as initialLabReports } from '../../data/mockLabReports';
import { mockPatients } from '../../data/mockPatients';
import { mockDoctors } from '../../data/mockDoctors';

export const LabReports = () => {
  useRoleGuard(['admin', 'doctor', 'patient']);
  const { currentUser } = useAuth();
  const isAdminOrDoctor = currentUser?.role === 'admin' || currentUser?.role === 'doctor';

  const [labList, setLabList] = useState(initialLabReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Drawer & Modal States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);

  // Order lab form states
  const [wPatId, setWPatId] = useState('');
  const [wDocId, setWDocId] = useState('D01');
  const [wTestName, setWTestName] = useState('Complete Blood Count (CBC)');

  // Role based filtering
  const filteredLabs = labList.filter(lab => {
    // If patient, only view Rahul Mehta (P01) reports
    const matchesRole = isAdminOrDoctor || lab.patientId === 'P01';
    
    const matchesSearch = lab.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lab.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lab.reportId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lab.status === statusFilter;

    return matchesRole && matchesSearch && matchesStatus;
  });

  const handleOpenExplainer = (report) => {
    setSelectedReport(report);
    setLoadingExplainer(true);
    setExplainerOpen(true);

    setTimeout(() => {
      setLoadingExplainer(false);
    }, 1500);
  };

  const handleOrderLab = (e) => {
    e.preventDefault();
    if (!wPatId || !wTestName) {
      toast.error('Please complete all order fields.');
      return;
    }

    const pat = mockPatients.find(p => p.patientId === wPatId);
    const doc = mockDoctors.find(d => d.doctorId === wDocId);

    const newLabOrder = {
      reportId: `L${labList.length + 1 < 10 ? '0' + (labList.length + 1) : labList.length + 1}`,
      patientId: wPatId,
      patientName: pat?.name || 'Walk-In Patient',
      doctorId: wDocId,
      doctorName: doc?.name || 'Dr. Priya Sharma',
      testName: wTestName,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      results: [],
      aiExplanation: null
    };

    setLabList([newLabOrder, ...labList]);
    setDrawerOpen(false);
    toast.success(`Lab Test ordered successfully for ${newLabOrder.patientName}`);

    // Reset
    setWPatId('');
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
            <ClipboardList className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Diagnostic Laboratory Registry</h2>
            <p className="text-xs text-text-secondary mt-1">Audit lab orders, view measurements, and explain reports via AI translations</p>
          </div>
        </div>

        {isAdminOrDoctor && (
          <Button
            onClick={() => setDrawerOpen(true)}
            className="mt-4 sm:mt-0 flex items-center space-x-1.5 text-xs font-bold py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Order Lab Test</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {isAdminOrDoctor && (
          <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search by ID, test name, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
            />
          </div>
        )}

        <div className="flex items-center space-x-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          <span className="text-xs text-text-secondary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-white border-0 outline-none focus:ring-0 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>Report ID</Th>
              <Th>Patient Name</Th>
              <Th>Panel Test Name</Th>
              <Th>Order Date</Th>
              <Th>Ordering Doctor</Th>
              <Th>Status</Th>
              <Th className="text-center">Results</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredLabs.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-10 text-text-secondary/50 text-xs">
                  No laboratory records registered in DB.
                </Td>
              </Tr>
            ) : (
              filteredLabs.map((lab) => (
                <Tr key={lab.reportId}>
                  <Td className="font-mono text-xs font-bold text-white">{lab.reportId}</Td>
                  <Td className="font-bold text-white text-xs">{lab.patientName}</Td>
                  <Td className="text-xs font-semibold text-white">{lab.testName}</Td>
                  <Td className="font-mono text-xs">{lab.date}</Td>
                  <Td className="text-xs">{lab.doctorName}</Td>
                  <Td>
                    <Badge variant={lab.status === 'Completed' ? 'success' : 'warning'}>{lab.status}</Badge>
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={lab.status === 'Pending'}
                        className="py-1 px-3 text-[10px]"
                        onClick={() => handleOpenExplainer(lab)}
                      >
                        View Results
                      </Button>
                      
                      {lab.status === 'Completed' && (
                        <Button
                          onClick={() => handleOpenExplainer(lab)}
                          className="py-1 px-3 text-[10px] font-bold border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-cyan" />
                          <span>AI Explain</span>
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>

      {/* AI Explainer Modal Overlay */}
      {selectedReport && (
        <Modal
          isOpen={explainerOpen}
          onClose={() => setExplainerOpen(false)}
          title={`AI Diagnostics Explainer: ${selectedReport.testName}`}
          size="lg"
        >
          {loadingExplainer ? (
            <div className="space-y-4 py-8">
              <SkeletonLoader variant="card" />
              <p className="text-xs text-text-secondary text-center">AI translation engine is processing metrics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left select-none">
              
              {/* Measurements details */}
              <div className="md:col-span-6 space-y-4">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold block">Report Parameters</span>
                <div className="p-4 bg-surface-secondary/40 border border-white/5 rounded-2xl space-y-3">
                  {selectedReport.results.map((res, i) => (
                    <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="text-white font-bold block">{res.parameter}</span>
                        <span className="text-[9px] text-text-secondary font-mono">Range: {res.referenceRange} {res.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-mono block">{res.value} {res.unit}</span>
                        <Badge variant={res.status === 'High' || res.status === 'Low' ? 'warning' : 'success'} className="text-[8px] py-0 px-1 font-bold">
                          {res.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanations summary */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">AI Clinical Translation</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <p className="text-white font-medium leading-relaxed bg-brand-cyan/5 border border-brand-cyan/10 p-3 rounded-xl">
                    {selectedReport.aiExplanation?.summary}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Main Findings</span>
                    <ul className="list-disc pl-4 text-text-secondary space-y-1">
                      {selectedReport.aiExplanation?.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Suggested Actions</span>
                    <ol className="list-decimal pl-4 text-text-secondary space-y-1">
                      {selectedReport.aiExplanation?.actions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] text-text-secondary/40 font-mono pt-3 border-t border-white/5">
                  <span>Powered by Gemini API</span>
                  <span>Safety Status: Verified</span>
                </div>

              </div>

            </div>
          )}
        </Modal>
      )}

      {/* Order Lab Test Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Order Diagnostic Lab Test"
        size="sm"
      >
        <form onSubmit={handleOrderLab} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Select Patient File</label>
            <select
              value={wPatId}
              onChange={(e) => setWPatId(e.target.value)}
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
              required
            >
              <option value="">-- Choose Patient --</option>
              {mockPatients.map(p => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Select Lab Test Panel</label>
            <select
              value={wTestName}
              onChange={(e) => setWTestName(e.target.value)}
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
            >
              <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
              <option value="Lipid Profile">Lipid Profile</option>
              <option value="Thyroid Profile (T3, T4, TSH)">Thyroid Profile (T3, T4, TSH)</option>
              <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
              <option value="Kidney Function Test (KFT)">Kidney Function Test (KFT)</option>
              <option value="HbA1c & Fasting Glucose">HbA1c & Fasting Glucose</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Ordering Clinician</label>
            <select
              value={wDocId}
              onChange={(e) => setWDocId(e.target.value)}
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
            >
              {mockDoctors.map(d => (
                <option key={d.doctorId} value={d.doctorId}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#112255]/60 border border-white/5 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-brand-cyan flex-shrink-0 mt-0.5" />
            <span className="text-[9px] text-text-secondary leading-relaxed font-semibold">
              Warning: Creating a lab order initializes a new LAB_REPORT record in PENDING state. Triggers register audit events automatically.
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 text-xs py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-xs py-2.5"
            >
              Confirm Order
            </Button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default LabReports;

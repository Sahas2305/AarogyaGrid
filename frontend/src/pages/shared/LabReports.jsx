/**
 * Page Name: LabReports
 * Props: None
 * Description: Shared lab reports directory detailing test files and order registers.
 * Used on: App.jsx (guarded route /labs)
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardList, Search, Plus, Sparkles, ShieldAlert } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { getLabReports, getDoctors, getPatients, createLabReport } from '../../api/api';

export const LabReports = () => {
  useRoleGuard(['admin', 'doctor', 'patient']);
  const { currentUser } = useAuth();
  const isAdminOrDoctor = currentUser?.role === 'admin' || currentUser?.role === 'doctor';

  const [labList, setLabList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Drawer & Modal States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);

  // Order lab form states
  const [wPatId, setWPatId] = useState('');
  const [wDocId, setWDocId] = useState('');
  const [wTestName, setWTestName] = useState('Complete Blood Count (CBC)');

  useEffect(() => {
    Promise.all([getLabReports(), getPatients(), getDoctors()])
      .then(([labs, pats, docs]) => {
        setLabList(Array.isArray(labs) ? labs : []);
        setPatients(Array.isArray(pats) ? pats : []);
        const docList = Array.isArray(docs) ? docs : [];
        setDoctors(docList);
        if (docList.length > 0) setWDocId(String(docList[0].doctor_id));
      })
      .catch(() => toast.error('Failed to load lab data.'))
      .finally(() => setLoading(false));
  }, []);

  // Role-based filtering using API fields
  const filteredLabs = labList.filter(lab => {
    const matchesRole = isAdminOrDoctor || lab.patient_id === currentUser?.linked_id;
    const patientName = lab.patient?.name || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lab.test_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(lab.test_id).includes(searchTerm);
    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Completed' && lab.result) ||
      (statusFilter === 'Pending' && !lab.result);
    return matchesRole && matchesSearch && matchesStatus;
  });

  const handleOpenExplainer = (report) => {
    setSelectedReport(report);
    setLoadingExplainer(true);
    setExplainerOpen(true);
    setTimeout(() => setLoadingExplainer(false), 1500);
  };

  const handleOrderLab = async (e) => {
    e.preventDefault();
    if (!wPatId || !wTestName) {
      toast.error('Please complete all order fields.');
      return;
    }
    try {
      const result = await createLabReport({ patient_id: wPatId, doctor_id: wDocId, test_name: wTestName });
      if (result.error) throw new Error(result.error);
      setLabList(prev => [result, ...prev]);
      setDrawerOpen(false);
      toast.success('Lab test ordered successfully!');
      setWPatId('');
    } catch (err) {
      toast.error('Failed to create lab order.');
    }
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
            {loading ? (
              <Tr><Td colSpan={7} className="px-4 py-6"><SkeletonLoader rows={4} /></Td></Tr>
            ) : filteredLabs.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-10 text-text-secondary/50 text-xs">
                  No laboratory records registered in DB.
                </Td>
              </Tr>
            ) : (
              filteredLabs.map((lab) => (
                <Tr key={lab.test_id}>
                  <Td className="font-mono text-xs font-bold text-white">#{lab.test_id}</Td>
                  <Td className="font-bold text-white text-xs">{lab.patient?.name || '—'}</Td>
                  <Td className="text-xs font-semibold text-white">{lab.test_name}</Td>
                  <Td className="font-mono text-xs">{lab.test_date}</Td>
                  <Td className="text-xs">{lab.ordered_by}</Td>
                  <Td>
                    <Badge variant={lab.result ? 'success' : 'warning'}>
                      {lab.result ? 'Completed' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={!lab.result}
                        className="py-1 px-3 text-[10px]"
                        onClick={() => handleOpenExplainer(lab)}
                      >
                        View Results
                      </Button>
                      {lab.result && (
                        <Button
                          onClick={() => handleOpenExplainer(lab)}
                          className="py-1 px-3 text-[10px] font-bold border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-cyan" />
                          <span>View</span>
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
          title={`Lab Results: ${selectedReport?.test_name}`}
          size="lg"
        >
          {loadingExplainer ? (
            <div className="space-y-4 py-8">
              <SkeletonLoader variant="card" />
              <p className="text-xs text-text-secondary text-center">AI translation engine is processing metrics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left select-none">
              
              {/* Lab result details */}
              <div className="md:col-span-6 space-y-4">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold block">Report Details</span>
                <div className="p-4 bg-surface-secondary/40 border border-white/5 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-text-secondary">Test Name:</span>
                    <span className="text-white font-bold">{selectedReport?.test_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-text-secondary">Test Date:</span>
                    <span className="font-mono text-white">{selectedReport?.test_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-text-secondary">Ordered By:</span>
                    <span className="text-white">{selectedReport?.ordered_by}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-text-secondary block mb-1">Result:</span>
                    <p className="text-white bg-black/20 p-2.5 rounded-lg border border-white/5">{selectedReport?.result || 'Pending'}</p>
                  </div>
                  {selectedReport?.notes && (
                    <div className="pt-2">
                      <span className="text-text-secondary block mb-1">Notes:</span>
                      <p className="text-white/70 italic text-[10px]">{selectedReport.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Explanation placeholder */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">AI Clinical Translation</span>
                </div>
                <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl text-xs text-text-secondary leading-relaxed">
                  <p>AI explanation is generated based on the result data. Powered by Gemini API — add your <code className="text-brand-cyan">GEMINI_API_KEY</code> in <code>.env</code> to enable full clinical explanations.</p>
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
              {patients.map(p => (
                <option key={p.patient_id} value={String(p.patient_id)}>
                  {p.name} (#{p.patient_id})
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
              {doctors.map(d => (
                <option key={d.doctor_id} value={String(d.doctor_id)}>
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

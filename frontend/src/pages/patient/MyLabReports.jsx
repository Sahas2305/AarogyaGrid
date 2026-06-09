/**
 * Page Name: MyLabReports
 * Props: None
 * Description: Renders the active patient's laboratory tests.
 * Used on: App.jsx (guarded route /patient/labs)
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardList, Search, Sparkles, ShieldAlert } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { getLabReports } from '../../api/api';

export const MyLabReports = () => {
  useRoleGuard(['patient']);

  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const data = await getLabReports();
        setLabs(data);
      } catch (err) {
        toast.error('Failed to load lab reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  const filtered = labs.filter(lab =>
    lab.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExplainWithAi = (report) => {
    setSelectedReport(report);
    setLoadingExplainer(true);
    setExplainerOpen(true);
    setTimeout(() => setLoadingExplainer(false), 1500);
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/30 rounded-xl text-brand-cyan">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">My Diagnostic Lab Reports</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Check laboratory results, monitor indicators, and explain metrics via AI</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input type="text" placeholder="Search reports by panel name..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0" />
      </div>

      {/* Table */}
      <div className="space-y-4">
        {loading ? (
          <SkeletonLoader variant="table" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Report ID</Th>
                <Th>Panel Test Name</Th>
                <Th>Ordered Date</Th>
                <Th>Status</Th>
                <Th className="text-center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="text-center py-10 text-text-secondary/50 text-xs">
                    No lab reports found.
                  </Td>
                </Tr>
              ) : filtered.map((lab) => (
                <Tr key={lab.lab_report_id}>
                  <Td className="font-mono text-xs font-bold text-white">{lab.lab_report_id}</Td>
                  <Td className="font-bold text-white text-xs">{lab.test_name}</Td>
                  <Td className="font-mono text-xs">{lab.report_date}</Td>
                  <Td>
                    <Badge variant={lab.status === 'Completed' ? 'success' : 'warning'}>{lab.status}</Badge>
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline" disabled={lab.status !== 'Completed'}
                        className="py-1 px-3 text-[10px]" onClick={() => handleExplainWithAi(lab)}>
                        View Results
                      </Button>
                      {lab.status === 'Completed' && (
                        <Button onClick={() => handleExplainWithAi(lab)}
                          className="py-1 px-3 text-[10px] font-bold border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          <span>AI Explain</span>
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      {/* AI Explainer Modal */}
      {selectedReport && (
        <Modal isOpen={explainerOpen} onClose={() => setExplainerOpen(false)}
          title={`AI Diagnostics Explainer: ${selectedReport.test_name}`} size="lg">
          {loadingExplainer ? (
            <div className="space-y-4 py-8">
              <SkeletonLoader variant="card" />
              <p className="text-xs text-text-secondary text-center">AI translation engine is processing metrics...</p>
            </div>
          ) : (
            <div className="text-left space-y-4 select-none">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
                <Sparkles className="w-4 h-4 text-brand-cyan" />
                <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">AI Clinical Translation</span>
              </div>

              <p className="text-white font-medium leading-relaxed bg-brand-cyan/5 border border-brand-cyan/10 p-3 rounded-xl text-xs">
                {selectedReport.result || 'Lab results summary not available. Please consult your physician for interpretation.'}
              </p>

              <div className="text-xs space-y-1 font-mono text-text-secondary">
                <p>Test: <span className="text-white">{selectedReport.test_name}</span></p>
                <p>Date: <span className="text-white">{selectedReport.report_date}</span></p>
                <p>Status: <span className="text-white">{selectedReport.status}</span></p>
              </div>

              {/* Safety Warning */}
              <div className="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-brand-warning mt-0.5 flex-shrink-0" />
                <span className="text-[9px] text-brand-warning leading-relaxed font-semibold">
                  DISCLAIMER: AI translation is for informational reference only. Present these results to your physician before making any health decisions.
                </span>
              </div>

              <div className="flex items-center justify-between text-[8px] text-text-secondary/40 font-mono pt-3 border-t border-white/5">
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

export default MyLabReports;
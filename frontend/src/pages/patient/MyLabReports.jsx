/**
 * Page Name: MyLabReports
 * Props: None
 * Description: Renders the active patient's laboratory tests and links to explanations.
 * Used on: App.jsx (guarded route /patient/labs)
 */
import React, { useState } from 'react';
import { ClipboardList, Search, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockLabReports } from '../../data/mockLabReports';

export const MyLabReports = () => {
  useRoleGuard(['patient']);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);

  // Filter lab reports for patient Rahul Mehta (P01)
  const patientLabs = mockLabReports.filter(lab =>
    lab.patientId === 'P01' &&
    lab.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExplainWithAi = (report) => {
    setSelectedReport(report);
    setLoadingExplainer(true);
    setExplainerOpen(true);
    
    setTimeout(() => {
      setLoadingExplainer(false);
    }, 1500);
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
          <p className="text-xs md:text-sm text-text-secondary mt-1">Check laboratory results, monitor indicators, and explain metrics via AI translations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input
          type="text"
          placeholder="Search reports by panel name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Lab Reports table */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Tr>
                <Th>Report ID</Th>
                <Th>Panel Test Name</Th>
                <Th>Ordered Date</Th>
                <Th>Ordering Physician</Th>
                <Th>Status</Th>
                <Th className="text-center">Explanation Actions</Th>
              </Tr>
            </Tr>
          </Thead>
          <Tbody>
            {patientLabs.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-10 text-text-secondary/50 text-xs">
                  No lab reports found matching criteria.
                </Td>
              </Tr>
            ) : (
              patientLabs.map((lab) => (
                <Tr key={lab.reportId}>
                  <Td className="font-mono text-xs font-bold text-white">{lab.reportId}</Td>
                  <Td className="font-bold text-white text-xs">{lab.testName}</Td>
                  <Td className="font-mono text-xs">{lab.date}</Td>
                  <Td className="text-xs text-white">{lab.doctorName}</Td>
                  <Td>
                    <Badge variant={lab.status === 'Completed' ? 'success' : 'warning'}>{lab.status}</Badge>
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        disabled={lab.status === 'Pending'}
                        className="py-1 px-3 text-[10px]"
                        onClick={() => handleExplainWithAi(lab)}
                      >
                        View Results
                      </Button>
                      
                      {lab.status === 'Completed' && (
                        <Button
                          onClick={() => handleExplainWithAi(lab)}
                          className="py-1 px-3 text-[10px] font-bold border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
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

                {/* Safety Warning */}
                <div className="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-brand-warning mt-0.5 flex-shrink-0" />
                  <span className="text-[9px] text-brand-warning leading-relaxed font-semibold">
                    DISCLAIMER: AI translation is for instructional reference only. Present these metrics to Dr. Priya Sharma before self-prescribing.
                  </span>
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

    </div>
  );
};

export default MyLabReports;

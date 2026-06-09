/**
 * Page Name: AIReportExplainer
 * Props: None
 * Description: Patient portal page to explain laboratory metrics in plain language.
 * Used on: App.jsx (guarded route /patient/report-explainer)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Brain, Search, Sparkles, AlertTriangle, ShieldAlert, FileDigit } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockLabReports } from '../../data/mockLabReports';

export const AIReportExplainer = () => {
  useRoleGuard(['patient']);

  // Filter completed labs for patient Rahul Mehta (P01)
  const completedLabs = mockLabReports.filter(lab => lab.patientId === 'P01' && lab.status === 'Completed');
  const [selectedReportId, setSelectedReportId] = useState(completedLabs[0]?.reportId || '');
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const activeReport = completedLabs.find(l => l.reportId === selectedReportId) || completedLabs[0];

  const handleRunExplainer = (e) => {
    e.preventDefault();
    setLoading(true);
    setShowExplanation(false);
    toast.loading('Analyzing test indicators and mapping reference ranges...');
    
    setTimeout(() => {
      toast.dismiss();
      setLoading(false);
      setShowExplanation(true);
      toast.success('Lab report explanation generated!');
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/30 rounded-xl text-brand-cyan">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">AI Medical Report Explainer</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Translate laboratory jargon and values into plain language instructions</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Selector and parameters table */}
        <div className="lg:col-span-6 space-y-5">
          <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-2.5">
              <FileDigit className="w-4.5 h-4.5 text-brand-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Laboratory Record</h3>
            </div>

            <form onSubmit={handleRunExplainer} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Completed Reports</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => {
                    setSelectedReportId(e.target.value);
                    setShowExplanation(false);
                  }}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
                >
                  {completedLabs.map(l => (
                    <option key={l.reportId} value={l.reportId}>
                      {l.testName} ({l.date})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                className="py-2 px-4 text-xs font-bold border border-brand-cyan/20 animate-pulse-cyan flex items-center space-x-1.5 flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Explain Report</span>
              </Button>
            </form>
          </Card>

          {/* Parameters values grid */}
          {activeReport && (
            <Card className="p-5 bg-surface-card border border-white/5 space-y-3.5">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">Lab Result Panel Details</span>
              <Table>
                <Thead>
                  <Tr>
                    <Th className="text-[10px] py-2">Parameter</Th>
                    <Th className="text-[10px] py-2 text-right">Value</Th>
                    <Th className="text-[10px] py-2">Reference</Th>
                    <Th className="text-[10px] py-2 text-center">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeReport.results.map((res, i) => (
                    <Tr key={i}>
                      <td className="py-2 text-white font-bold text-xs">{res.parameter}</td>
                      <td className="py-2 text-right font-mono text-xs text-white">{res.value} {res.unit}</td>
                      <td className="py-2 font-mono text-[10px] text-text-secondary">{res.referenceRange} {res.unit}</td>
                      <td className="py-2 text-center">
                        <Badge variant={res.status === 'High' || res.status === 'Low' ? 'warning' : 'success'} className="text-[8px] py-0 px-1 font-bold">
                          {res.status}
                        </Badge>
                      </td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Card>
          )}
        </div>

        {/* Right Column: AI Explanations */}
        <div className="lg:col-span-6">
          {loading && (
            <Card className="p-5 space-y-4 bg-surface-card border border-white/5 h-full">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                <Brain className="w-5 h-5 text-brand-cyan animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Explainer is reading...</h3>
              </div>
              <SkeletonLoader variant="card" />
              <SkeletonLoader variant="text" lines={4} />
            </Card>
          )}

          {!loading && !showExplanation && (
            <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 h-full">
              <Brain className="w-12 h-12 text-white/10 mb-4" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">AI Translation Panel</h3>
              <p className="text-xs text-text-secondary max-w-xs mt-2 leading-relaxed">
                Click "Explain Report" on the left to trigger the Gemini clinical explainer.
              </p>
            </Card>
          )}

          {showExplanation && !loading && activeReport && (
            <Card className="p-5 bg-surface-card border border-white/5 space-y-5">
              
              <div className="flex items-center space-x-2 border-b border-white/5 pb-2.5">
                <Sparkles className="w-4 h-4 text-brand-cyan" />
                <span className="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">AI Clinical Translation</span>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-white font-semibold leading-relaxed p-3.5 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl">
                  {activeReport.aiExplanation?.summary}
                </p>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Key Findings Breakdown</span>
                  <ul className="list-disc pl-4 text-text-secondary space-y-1 leading-relaxed">
                    {activeReport.aiExplanation?.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Recommended Preventive Actions</span>
                  <ol className="list-decimal pl-4 text-text-secondary space-y-1 leading-relaxed">
                    {activeReport.aiExplanation?.actions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Safety banner */}
              <div className="p-3.5 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start space-x-2.5">
                <ShieldAlert className="w-4.5 h-4.5 text-brand-warning flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-brand-warning leading-relaxed font-semibold">
                  DISCLAIMER: AI medical explanations are for general information reference purposes only. Consult Dr. Priya Sharma before making any modification to medications.
                </p>
              </div>

              {/* Model version footer */}
              <div className="flex items-center justify-between text-[8px] text-text-secondary/35 font-mono pt-2 border-t border-white/5">
                <span>Model Engine: Gemini API v1.5</span>
                <span>Audit Safety: Verified</span>
              </div>

            </Card>
          )}
        </div>

      </div>

    </div>
  );
};

export default AIReportExplainer;

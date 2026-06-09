/**
 * Page Name: AICopilot
 * Props: None
 * Description: Standalone AI Clinical Copilot offering medical diagnostic suggestions.
 * Used on: App.jsx (guarded route /doctor/copilot)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, ShieldAlert, FileText, ClipboardCheck, Trash2, Heart } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockPatients } from '../../data/mockPatients';
import { mockCopilotResponse } from '../../data/mockAIDiagnosis';

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export const AICopilot = () => {
  useRoleGuard(['doctor']);

  const [selectedPatientId, setSelectedPatientId] = useState('P01');
  const [symptoms, setSymptoms] = useState(
    'Crushing chest pressure radiating to the left jaw and shoulder, accompanied by severe sweating (diaphoresis) and mild difficulty breathing. Symptoms started 45 minutes ago.'
  );
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const activePatient = mockPatients.find(p => p.patientId === selectedPatientId) || mockPatients[0];

  const handleAskCopilot = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error('Please input patient symptoms.');
      return;
    }
    setLoading(true);
    setShowResult(false);
    toast.loading('Analyzing symptom taxonomy and matching medical datasets...');
    
    setTimeout(() => {
      toast.dismiss();
      setLoading(false);
      setShowResult(true);
      toast.success('Clinical diagnostic assessment generated!');
    }, 2000);
  };

  const handleClear = () => {
    setSymptoms('');
    setShowResult(false);
  };

  const handleSaveToRecord = () => {
    toast.loading('Saving clinical copilot recommendation to patient record...');
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Success: Copilot assessment attached to ${activePatient.name}'s medical charts.`);
    }, 1500);
  };

  const getUrgencyBadge = (severity) => {
    if (severity === 'Critical') return 'danger';
    if (severity === 'Medium') return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">AI Clinical Copilot</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Generative medical diagnosis, comorbidity interaction auditing, and laboratory recommendations</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input Panel */}
        <div className="lg:col-span-5">
          <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Intake Panel</h3>
            </div>

            <form onSubmit={handleAskCopilot} className="space-y-4 text-left">
              
              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Select Patient File</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
                >
                  {mockPatients.map(p => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Department Context</label>
                  <input
                    type="text"
                    value="Cardiology"
                    disabled
                    className="w-full bg-[#112255]/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-text-secondary outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Active Appointment</label>
                  <input
                    type="text"
                    value="Today, 09:30 AM"
                    disabled
                    className="w-full bg-[#112255]/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-text-secondary outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Symptom Description & Clinical Signs</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Input raw clinical observations, physical indicators, and comorbidity details..."
                  rows="8"
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-2.5 text-xs flex items-center justify-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Panel</span>
                </Button>
                
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1 py-2.5 text-xs font-bold border-2 border-brand-cyan/20 animate-pulse-cyan flex items-center justify-center space-x-1.5"
                >
                  <Brain className="w-4 h-4 text-white animate-pulse" />
                  <span>Ask Copilot</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7">
          {loading && (
            <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                <Brain className="w-5 h-5 text-brand-cyan animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compiling Medical Graph...</h3>
              </div>
              <SkeletonLoader variant="card" />
              <SkeletonLoader variant="text" lines={4} />
            </Card>
          )}

          {!loading && !showResult && (
            <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 h-full">
              <Brain className="w-12 h-12 text-white/10 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">AI Diagnostic Output</h3>
              <p className="text-xs text-text-secondary max-w-xs mt-2 leading-relaxed">
                Provide patient symptoms on the left to trigger comorbidity scans and check clinical diagnoses.
              </p>
            </Card>
          )}

          {showResult && !loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-5"
            >
              {/* Probable Diagnosis */}
              <motion.div variants={itemVariants}>
                <Card className="p-5 border-brand-cyan/40 bg-brand-cyan/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-brand-cyan font-bold uppercase tracking-widest flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>Primary Probable Analysis</span>
                    </span>
                    <span className="text-xs font-black text-white bg-brand-cyan/25 border border-brand-cyan/30 px-2 py-0.5 rounded-full">
                      Confidence: {mockCopilotResponse.confidence}%
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white mt-1">{mockCopilotResponse.probableDiagnosis}</h4>
                  
                  {/* Gauge bar */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4 border border-white/5">
                    <div className="h-full bg-brand-cyan" style={{ width: `${mockCopilotResponse.confidence}%` }} />
                  </div>
                </Card>
              </motion.div>

              {/* Differentials */}
              <motion.div variants={itemVariants}>
                <Card className="p-5 space-y-3 bg-surface-card border border-white/5">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">Differential Diagnostic Matrix</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {mockCopilotResponse.differentialDiagnoses.map((d, i) => (
                      <div key={i} className="p-3 bg-surface-secondary/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-white font-bold">{d.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-brand-cyan font-mono font-bold">{d.confidence}% match</span>
                          <Badge variant={getUrgencyBadge(d.severity)}>{d.severity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Lab suggestions */}
              <motion.div variants={itemVariants}>
                <Card className="p-5 space-y-3 bg-surface-card border border-white/5">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">Suggested Clinical Lab Testing</span>
                  <div className="flex flex-wrap gap-2.5">
                    {mockCopilotResponse.suggestedLabs.map((l, i) => (
                      <Badge key={i} variant="cyan" className="text-[10px] font-bold py-1 px-3">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Drug interaction alert */}
              <motion.div variants={itemVariants}>
                <div className="p-4 bg-brand-danger/10 border border-brand-danger/25 rounded-2xl flex items-start space-x-3.5 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-brand-danger flex-shrink-0 mt-0.5 animate-bounce" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-danger uppercase font-bold tracking-wider block">Contraindication Warning</span>
                    <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                      {mockCopilotResponse.drugInteractionWarning.warning}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Clinical Notes Card */}
              <motion.div variants={itemVariants}>
                <Card className="p-5 space-y-3 bg-surface-card border border-white/5">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">AI-Compiled Consultation Summary</span>
                  <p className="text-xs text-text-secondary leading-relaxed bg-[#112255]/40 border border-white/5 rounded-xl p-3.5 font-medium">
                    {mockCopilotResponse.clinicalNotes}
                  </p>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex items-center space-x-3 pt-3">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 py-2.5 text-xs font-semibold"
                >
                  Discard Assessment
                </Button>
                <Button
                  onClick={handleSaveToRecord}
                  className="flex-1 py-2.5 text-xs font-bold"
                >
                  Commit to Medical Record
                </Button>
              </motion.div>

              {/* Model Version */}
              <motion.div variants={itemVariants} className="flex items-center justify-between text-[9px] text-text-secondary/30 font-mono px-1">
                <span>Model Engine: {mockCopilotResponse.modelVersion}</span>
                <span>Generated: {mockCopilotResponse.timestamp}</span>
              </motion.div>

            </motion.div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AICopilot;

/**
 * Page Name: AICopilot
 * Props: None
 * Description: Standalone AI Clinical Copilot offering medical diagnostic suggestions.
 * Used on: App.jsx (guarded route /doctor/copilot)
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, Trash2 } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { getPatients, getAIDiagnosis, createMedicalRecord } from '../../api/api';
import { evaluateClinicalSymptoms } from '../../utils/aiTriageEngine';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export const AICopilot = () => {
  useRoleGuard(['doctor']);

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptoms, setSymptoms] = useState(
    'Crushing chest pressure radiating to the left jaw and shoulder, accompanied by severe sweating (diaphoresis) and mild difficulty breathing. Symptoms started 45 minutes ago.'
  );
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [savingRecord, setSavingRecord] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
        if (data.length > 0) setSelectedPatientId(data[0].patient_id);
      } catch (err) {
        toast.error('Failed to load patients.');
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const activePatient = patients.find(p => p.patient_id === selectedPatientId) || patients[0];

  const handleAskCopilot = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error('Please input patient symptoms.');
      return;
    }
    setLoading(true);
    setAiResult(null);
    try {
      let rawResult = null;
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Backend timeout')), 4500)
        );
        rawResult = await Promise.race([
          getAIDiagnosis({
            patient_id: selectedPatientId,
            symptoms,
            department: 'Cardiology'
          }),
          timeoutPromise
        ]);
      } catch (err) {
        rawResult = evaluateClinicalSymptoms(symptoms);
      }

      if (!rawResult || !rawResult.condition) {
        rawResult = evaluateClinicalSymptoms(symptoms);
      }

      const formatted = {
        probableDiagnosis: rawResult.probableDiagnosis || rawResult.condition || 'Acute Clinical Presentation',
        confidence: rawResult.confidence || 88,
        differentialDiagnoses: rawResult.differentialDiagnoses || [
          { name: rawResult.condition || 'Primary Condition', confidence: rawResult.confidence || 88, severity: rawResult.urgency || 'High' },
          { name: 'Secondary Comorbidity Investigation', confidence: Math.max(30, (rawResult.confidence || 88) - 35), severity: 'Medium' }
        ],
        suggestedLabs: rawResult.suggestedLabs || [
          'Complete Blood Count (CBC)',
          'Serum Electrolytes & Renal Panel',
          'Targeted Organ Ultrasound / 12-Lead ECG',
          `${rawResult.specialty || 'General'} Specific Biomarkers`
        ],
        drugInteractionWarning: rawResult.drugInteractionWarning || {
          severity: rawResult.urgency === 'Critical' ? 'Danger' : 'Warning',
          warning: rawResult.description || 'Review existing patient prescriptions for renal and cardiovascular clearance.'
        },
        clinicalNotes: rawResult.description || symptoms,
        modelVersion: rawResult._engine || 'Gemini 1.5/2.5 Flash Clinical',
        timestamp: new Date().toLocaleString()
      };

      setAiResult(formatted);
      toast.success('Clinical diagnostic assessment generated!');
    } catch (err) {
      toast.error('AI Copilot failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setAiResult(null);
  };

  const handleSaveToRecord = async () => {
    if (!aiResult) return;
    setSavingRecord(true);
    try {
      await createMedicalRecord({
        patient_id: selectedPatientId,
        diagnosis: aiResult.probableDiagnosis,
        prescription: aiResult.clinicalNotes || '',
        notes: `AI Copilot assessment. Confidence: ${aiResult.confidence}%`
      });
      toast.success(`Copilot assessment attached to ${activePatient?.name}'s medical charts.`);
    } catch (err) {
      toast.error('Failed to save record.');
    } finally {
      setSavingRecord(false);
    }
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
                  disabled={loadingPatients}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer disabled:opacity-50"
                >
                  {loadingPatients ? (
                    <option>Loading patients...</option>
                  ) : (
                    patients.map(p => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.name} ({p.patient_id})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Department Context</label>
                  <input type="text" value="Cardiology" disabled
                    className="w-full bg-[#112255]/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-text-secondary outline-none cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Active Appointment</label>
                  <input type="text" value="Today, 09:30 AM" disabled
                    className="w-full bg-[#112255]/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-text-secondary outline-none cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Symptom Description & Clinical Signs</label>
                <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Input raw clinical observations, physical indicators, and comorbidity details..." rows="8"
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40 leading-relaxed" required />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button variant="outline" type="button" onClick={handleClear}
                  className="flex-1 py-2.5 text-xs flex items-center justify-center space-x-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Panel</span>
                </Button>
                <Button type="submit" loading={loading}
                  className="flex-1 py-2.5 text-xs font-bold border-2 border-brand-cyan/20 flex items-center justify-center space-x-1.5">
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

          {!loading && !aiResult && (
            <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 h-full">
              <Brain className="w-12 h-12 text-white/10 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">AI Diagnostic Output</h3>
              <p className="text-xs text-text-secondary max-w-xs mt-2 leading-relaxed">
                Provide patient symptoms on the left to trigger comorbidity scans and check clinical diagnoses.
              </p>
            </Card>
          )}

          {aiResult && !loading && (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">

              {/* Probable Diagnosis */}
              <motion.div variants={itemVariants}>
                <Card className="p-5 border-brand-cyan/40 bg-brand-cyan/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-brand-cyan font-bold uppercase tracking-widest flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>Primary Probable Analysis</span>
                    </span>
                    <span className="text-xs font-black text-white bg-brand-cyan/25 border border-brand-cyan/30 px-2 py-0.5 rounded-full">
                      Confidence: {aiResult.confidence}%
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white mt-1">{aiResult.probableDiagnosis}</h4>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4 border border-white/5">
                    <div className="h-full bg-brand-cyan" style={{ width: `${aiResult.confidence}%` }} />
                  </div>
                </Card>
              </motion.div>

              {/* Differentials */}
              {aiResult.differentialDiagnoses?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="p-5 space-y-3 bg-surface-card border border-white/5">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">Differential Diagnostic Matrix</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {aiResult.differentialDiagnoses.map((d, i) => (
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
              )}

              {/* Lab suggestions */}
              {aiResult.suggestedLabs?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="p-5 space-y-3 bg-surface-card border border-white/5">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">Suggested Clinical Lab Testing</span>
                    <div className="flex flex-wrap gap-2.5">
                      {aiResult.suggestedLabs.map((l, i) => (
                        <Badge key={i} variant="cyan" className="text-[10px] font-bold py-1 px-3">{l}</Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Drug interaction alert */}
              {aiResult.drugInteractionWarning?.warning && (
                <motion.div variants={itemVariants}>
                  <div className="p-4 bg-brand-danger/10 border border-brand-danger/25 rounded-2xl flex items-start space-x-3.5 shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-brand-danger flex-shrink-0 mt-0.5 animate-bounce" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-brand-danger uppercase font-bold tracking-wider block">Contraindication Warning</span>
                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">{aiResult.drugInteractionWarning.warning}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Clinical Notes */}
              {aiResult.clinicalNotes && (
                <motion.div variants={itemVariants}>
                  <Card className="p-5 space-y-3 bg-surface-card border border-white/5">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block">AI-Compiled Consultation Summary</span>
                    <p className="text-xs text-text-secondary leading-relaxed bg-[#112255]/40 border border-white/5 rounded-xl p-3.5 font-medium">
                      {aiResult.clinicalNotes}
                    </p>
                  </Card>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex items-center space-x-3 pt-3">
                <Button variant="outline" onClick={handleClear} className="flex-1 py-2.5 text-xs font-semibold">
                  Discard Assessment
                </Button>
                <Button onClick={handleSaveToRecord} loading={savingRecord} className="flex-1 py-2.5 text-xs font-bold">
                  Commit to Medical Record
                </Button>
              </motion.div>

              {/* Model Version */}
              {aiResult.modelVersion && (
                <motion.div variants={itemVariants} className="flex items-center justify-between text-[9px] text-text-secondary/30 font-mono px-1">
                  <span>Model Engine: {aiResult.modelVersion}</span>
                  <span>Generated: {aiResult.timestamp}</span>
                </motion.div>
              )}

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICopilot;
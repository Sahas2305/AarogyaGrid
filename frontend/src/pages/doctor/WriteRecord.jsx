/**
 * Page Name: WriteRecord
 * Props: None
 * Description: Clinician form to write medical record encounters.
 * Used on: App.jsx (guarded route /doctor/records)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FilePen, Save, Heart, ShieldAlert } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockPatients } from '../../data/mockPatients';

export const WriteRecord = () => {
  useRoleGuard(['doctor']);

  const [selectedPatId, setSelectedPatId] = useState('P01');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Vitals State
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [spo2, setSpo2] = useState('98');

  const handleSave = (e) => {
    e.preventDefault();
    if (!diagnosis || !treatment || !prescription) {
      toast.error('Please complete all clinical fields.');
      return;
    }

    toast.loading('Writing patient record to secure database index...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Medical Record successfully committed to Patient Charts!');
      
      // Reset form
      setDiagnosis('');
      setTreatment('');
      setPrescription('');
      setNotes('');
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
          <FilePen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Create Clinical Medical Record</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Write patient encounters, prescriptions, and vital parameters</p>
        </div>
      </div>

      {/* Write Record Card */}
      <Card className="max-w-2xl mx-auto p-6 bg-surface-card border border-white/5">
        <form onSubmit={handleSave} className="space-y-5 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Select Patient File</label>
            <select
              value={selectedPatId}
              onChange={(e) => setSelectedPatId(e.target.value)}
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
            >
              {mockPatients.map(p => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Clinical Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension / Type-2 Diabetes Mellitus"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Physiologic Treatment Plan</label>
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="e.g. Low sodium diet and pharmacological therapy"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Prescriptions Dosing (Sig)</label>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="e.g. Tab. Telmisartan 40mg - once daily after breakfast (30 days)"
              rows="3"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40 leading-relaxed"
              required
            />
          </div>

          {/* Vitals */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
              <span>Patient Vital Signs readings</span>
            </span>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">BP (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">HR (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">Temp (°F)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Physician Clinical Notes (Internal)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes on compliance, warnings, etc."
              rows="3"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40 leading-relaxed"
            />
          </div>

          <div className="p-3 bg-[#112255]/60 border border-white/5 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
            <span className="text-[10px] text-text-secondary leading-relaxed font-semibold">
              Warning: Committing this file writes directly to the MEDICAL_RECORD schema and logs audit triggers in real-time.
            </span>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-white/5">
            <Button
              type="submit"
              className="w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Commit Encounter Record</span>
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
};

export default WriteRecord;

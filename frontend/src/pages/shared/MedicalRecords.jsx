/**
 * Page Name: MedicalRecords
 * Props: None
 * Description: Renders the clinical chart database for Admin and Doctors.
 * Used on: App.jsx (guarded route /records)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileHeart, Search, Plus, Heart, Activity, Thermometer, Wind, ShieldAlert, Save } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { StatCard } from '../../components/ui/StatCard';
import { mockMedicalRecords as initialRecords } from '../../data/mockMedicalRecords';
import { mockPatients } from '../../data/mockPatients';
import { mockDoctors } from '../../data/mockDoctors';

export const MedicalRecords = () => {
  useRoleGuard(['admin', 'doctor']);
  const { currentUser } = useAuth();

  const [records, setRecords] = useState(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form State
  const [wPatId, setWPatId] = useState('');
  const [wDocId, setWDocId] = useState('D01');
  const [wDiag, setWDiag] = useState('');
  const [wTreat, setWTreat] = useState('');
  const [wPresc, setWPresc] = useState('');
  const [wNotes, setWNotes] = useState('');
  const [wBp, setWBp] = useState('120/80');
  const [wHr, setWHr] = useState('72');
  const [wTemp, setWTemp] = useState('98.6');
  const [wSpo2, setWSpo2] = useState('98');

  // Filter records
  const filteredRecords = records.filter(rec =>
    rec.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.recordId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!wPatId || !wDiag || !wTreat || !wPresc) {
      toast.error('Please complete all required fields.');
      return;
    }

    const pat = mockPatients.find(p => p.patientId === wPatId);
    const doc = mockDoctors.find(d => d.doctorId === wDocId);

    const newRecord = {
      recordId: `R0${records.length + 1 < 10 ? '0' + (records.length + 1) : records.length + 1}`,
      patientId: wPatId,
      patientName: pat?.name || 'Walk-In Patient',
      doctorId: wDocId,
      doctorName: doc?.name || 'Dr. Priya Sharma',
      department: doc?.department || 'Cardiology',
      date: new Date().toISOString().split('T')[0],
      diagnosis: wDiag,
      treatment: wTreat,
      prescription: wPresc,
      notes: wNotes,
      vitals: { bp: wBp, hr: parseInt(wHr), temp: parseFloat(wTemp), spo2: parseInt(wSpo2) }
    };

    setRecords([newRecord, ...records]);
    setDrawerOpen(false);
    toast.success(`Encounter Record committed successfully for ${newRecord.patientName}`);

    // Reset Form
    setWPatId('');
    setWDiag('');
    setWTreat('');
    setWPresc('');
    setWNotes('');
  };

  // Border colors based on department
  const getDeptBorderColor = (dept) => {
    if (dept === 'Cardiology') return 'border-l-4 border-brand-cyan';
    if (dept === 'Neurology') return 'border-l-4 border-brand-purple';
    if (dept === 'Orthopedics') return 'border-l-4 border-brand-warning';
    if (dept === 'Pediatrics') return 'border-l-4 border-brand-success';
    return 'border-l-4 border-white/30';
  };

  return (
    <div className="space-y-6 select-none text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
            <FileHeart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Clinical Records Database</h2>
            <p className="text-xs text-text-secondary mt-1">Audit, register, and check comorbidity patient files</p>
          </div>
        </div>

        <Button
          onClick={() => setDrawerOpen(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-1.5 text-xs font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Commit Record</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input
          type="text"
          placeholder="Search by ID, diagnosis, or patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Accordion Cards Grid */}
      <div className="space-y-4 max-w-4xl">
        {filteredRecords.length === 0 ? (
          <Card className="p-10 border border-white/5 border-dashed text-center text-text-secondary/50 text-xs">
            No medical encounter records found in DB.
          </Card>
        ) : (
          filteredRecords.map((rec) => {
            const isOpen = expandedId === rec.recordId;
            return (
              <Card
                key={rec.recordId}
                className={`p-0 overflow-hidden transition-all duration-200 bg-surface-card ${
                  isOpen ? 'border-white/15 animate-pulse-cyan' : 'border-white/5'
                } ${getDeptBorderColor(rec.department)}`}
              >
                {/* Header Section */}
                <div
                  onClick={() => toggleExpand(rec.recordId)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01]"
                >
                  <div className="truncate pr-2">
                    <span className="text-sm font-bold text-white block truncate">{rec.diagnosis}</span>
                    <span className="text-[10px] text-text-secondary/60 mt-1 block">
                      ID: {rec.recordId} • Patient: <span className="text-white font-bold">{rec.patientName}</span> • Date: {rec.date}
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center space-x-3 flex-shrink-0">
                    <Badge variant="cyan" className="text-[9px] font-bold uppercase tracking-wider py-0 px-2.5">
                      {rec.department}
                    </Badge>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isOpen && (
                  <div className="p-5 bg-black/15 border-t border-white/5 space-y-5">
                    
                    {/* Vitals metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard small title="Blood Pressure" value={rec.vitals.bp} icon={Heart} />
                      <StatCard small title="Heart Rate" value={`${rec.vitals.hr} bpm`} icon={Activity} />
                      <StatCard small title="Temperature" value={`${rec.vitals.temp} °F`} icon={Thermometer} />
                      <StatCard small title="Oxygen Saturation" value={`${rec.vitals.spo2} %`} icon={Wind} />
                    </div>

                    <div className="space-y-3.5 text-xs leading-relaxed">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Attending Clinician</span>
                          <span className="text-white font-bold block mt-1">{rec.doctorName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Consulting Department</span>
                          <span className="text-brand-cyan font-bold block mt-1">{rec.department} Clinic</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Recommended Treatment</span>
                        <p className="text-text-secondary mt-1 font-medium">{rec.treatment}</p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Dosing Prescription Details</span>
                        <pre className="text-white font-mono bg-[#070f1a] border border-white/5 rounded-lg p-3 mt-1 whitespace-pre-line leading-relaxed">
                          {rec.prescription}
                        </pre>
                      </div>

                      {rec.notes && (
                        <div>
                          <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Physician Annotations</span>
                          <p className="text-text-secondary mt-1 bg-white/[0.01] border border-white/5 rounded-lg p-3 italic">
                            "{rec.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Add Record Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Commit Clinical Record"
        size="md"
      >
        <form onSubmit={handleAddRecord} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Select Patient File</label>
            <select
              value={wPatId}
              onChange={(e) => setWPatId(e.target.value)}
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
              required
            >
              <option value="">-- Choose Patient File --</option>
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
              value={wDiag}
              onChange={(e) => setWDiag(e.target.value)}
              placeholder="e.g. Essential Hypertension"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Physiologic Treatment Plan</label>
            <input
              type="text"
              value={wTreat}
              onChange={(e) => setWTreat(e.target.value)}
              placeholder="Lifestyle modifications and drug therapy"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Dosing Prescription (Sig)</label>
            <textarea
              value={wPresc}
              onChange={(e) => setWPresc(e.target.value)}
              placeholder="Tab. DrugName 40mg - Once daily for 30 days"
              rows="3"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40 leading-relaxed"
              required
            />
          </div>

          {/* Vitals */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Intake Vitals Data</span>
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">BP</label>
                <input
                  type="text"
                  value={wBp}
                  onChange={(e) => setWBp(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">HR</label>
                <input
                  type="number"
                  value={wHr}
                  onChange={(e) => setWHr(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">Temp</label>
                <input
                  type="text"
                  value={wTemp}
                  onChange={(e) => setWTemp(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary font-mono">SpO2</label>
                <input
                  type="number"
                  value={wSpo2}
                  onChange={(e) => setWSpo2(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-cyan/45"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Internal Annotations</label>
            <textarea
              value={wNotes}
              onChange={(e) => setWNotes(e.target.value)}
              placeholder="Clinical warnings, compliance remarks, etc."
              rows="3"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40 leading-relaxed"
            />
          </div>

          <div className="p-3 bg-[#112255]/60 border border-white/5 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-brand-cyan flex-shrink-0 mt-0.5" />
            <span className="text-[9px] text-text-secondary leading-relaxed font-semibold">
              Warning: Committing this file writes directly to the MEDICAL_RECORD schema and logs audit triggers in real-time.
            </span>
          </div>

          {/* Drawer Actions */}
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
              className="flex-1 text-xs py-2.5 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Commit Record</span>
            </Button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default MedicalRecords;

/**
 * Page Name: DoctorDashboard
 * Props: None
 * Description: Main workspace dashboard for doctor role.
 * Used on: App.jsx (guarded route /doctor/dashboard)
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Calendar, Users, ClipboardList, Brain, Clock, Activity, AlertTriangle, ArrowRight, Save } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { getAppointments, getPatients, createMedicalRecord, getAIDiagnosis } from '../../api/api';

export const DoctorDashboard = () => {
  useRoleGuard(['doctor']);
  const { currentUser } = useAuth();

  // Clock state
  const [timeStr, setTimeStr] = useState(format(new Date(), 'hh:mm:ss a'));
  const [dateStr] = useState(format(new Date(), 'EEEE, dd MMMM yyyy'));

  // Data state
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Drawer states
  const [consultOpen, setConsultOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');

  // Clinical notes form
  const [diagText, setDiagText] = useState('');
  const [prescText, setPrescText] = useState('');
  const [vitalsBp, setVitalsBp] = useState('120/80');
  const [vitalsHr, setVitalsHr] = useState('72');
  const [vitalsTemp, setVitalsTemp] = useState('98.6');
  const [vitalsSpo2, setVitalsSpo2] = useState('98');
  const [savingRecord, setSavingRecord] = useState(false);

  // AI Copilot states
  const [symptomsInput, setSymptomsInput] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(format(new Date(), 'hh:mm:ss a'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointments();
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayList = data.filter(app => app.date === today && app.status === 'Scheduled');
        setTodayAppointments(todayList);
      } catch (err) {
        toast.error('Failed to load appointments.');
      } finally {
        setLoadingAppts(false);
      }
    };
    fetchAppointments();
  }, []);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (err) {
        toast.error('Failed to load patients.');
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const handleStartConsultation = (consult) => {
    setSelectedConsult(consult);
    setConsultOpen(true);
    setActiveTab('notes');
    setAiResult(null);
    setSymptomsInput(consult.reason);
    setDiagText('');
    setPrescText('');
  };

  const handleAskCopilot = async () => {
    if (!symptomsInput) {
      toast.error('Please describe symptoms first.');
      return;
    }
    setLoadingAi(true);
    try {
      const result = await getAIDiagnosis({
        patient_id: selectedConsult?.patient_id,
        symptoms: symptomsInput,
        department: selectedConsult?.department || 'General'
      });
      setAiResult(result);
      toast.success('Clinical recommendations compiled!');
    } catch (err) {
      toast.error('AI Copilot failed. Try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setSavingRecord(true);
    try {
      await createMedicalRecord({
        patient_id: selectedConsult?.patient_id,
        diagnosis: diagText,
        prescription: prescText,
        vitals: { bp: vitalsBp, hr: vitalsHr, temp: vitalsTemp, spo2: vitalsSpo2 }
      });
      toast.success(`Medical Record saved for ${selectedConsult.patient_name}.`);
      setConsultOpen(false);
    } catch (err) {
      toast.error('Failed to save record.');
    } finally {
      setSavingRecord(false);
    }
  };

  return (
    <div className="space-y-6 select-none">

      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-surface-secondary to-[#0d2044] rounded-2xl border border-white/8 p-6 flex flex-col md:flex-row md:items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white">Good morning, {currentUser?.username}</h2>
          <p className="text-xs text-text-secondary mt-1">Specialist, Department of {currentUser?.department}</p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right font-mono">
          <p className="text-xl font-extrabold text-brand-cyan">{timeStr}</p>
          <p className="text-[10px] text-text-secondary mt-0.5">{dateStr}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Today's Appointments" value={todayAppointments.length} icon={Calendar} trend="+2 vs yesterday" trendType="success" />
        <StatCard title="Patients Seen (Weekly)" value={34} icon={Users} trend="+8% vs avg" trendType="success" />
        <StatCard title="Pending Lab Results" value={5} icon={ClipboardList} trend="Action required" trendType="warning" />
        <StatCard title="AI Copilot Recommendations" value={12} icon={Brain} trend="100% verified" trendType="success" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Today Queue */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Today's Scheduled Consultations</h3>

          <Card className="p-0 border border-white/5 overflow-hidden">
            {loadingAppts ? (
              <div className="p-4"><SkeletonLoader variant="text" lines={5} /></div>
            ) : todayAppointments.length === 0 ? (
              <div className="p-8 text-center text-text-secondary/50 text-xs">No appointments scheduled for today.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {todayAppointments.map((consult) => (
                  <div key={consult.appointment_id} className="p-4 hover:bg-white/[0.01] transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5 truncate">
                      <div className="px-2.5 py-1.5 bg-surface-secondary border border-white/5 rounded-xl text-center flex flex-col justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-brand-cyan mx-auto" />
                        <span className="text-[9px] font-bold text-white font-mono mt-1">{consult.time_slot}</span>
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">{consult.patient_name}</h4>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5 pr-2">{consult.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <Badge variant={consult.type === 'In-Person' ? 'cyan' : 'purple'} className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider">
                        {consult.type}
                      </Badge>
                      <Button
                        variant="primary"
                        onClick={() => handleStartConsultation(consult)}
                        className="py-1 px-3 text-[10px] tracking-wide font-bold"
                      >
                        Start Consult
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">

          {/* Recent Patients */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">My Active Patient Roster</h3>
            <Card className="p-4 bg-surface-card border border-white/5 max-h-[200px] overflow-y-auto space-y-3">
              {loadingPatients ? (
                <SkeletonLoader variant="text" lines={5} />
              ) : (
                patients.slice(0, 5).map((pat) => (
                  <div key={pat.patient_id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="text-xs font-bold text-white block">{pat.name}</span>
                      <span className="text-[9px] text-text-secondary font-mono">ID: {pat.patient_id} • Gender: {pat.gender}</span>
                    </div>
                    <Button variant="outline" className="py-0.5 px-2 text-[9px]">
                      Open Chart
                    </Button>
                  </div>
                ))
              )}
            </Card>
          </div>

        </div>
      </div>

      {/* Consultation Drawer */}
      {selectedConsult && (
        <Drawer
          isOpen={consultOpen}
          onClose={() => setConsultOpen(false)}
          title={`Clinical Encounter: ${selectedConsult.patient_name}`}
          size="lg"
        >
          <div className="flex items-center space-x-2 text-[10px] text-text-secondary/70 uppercase font-mono tracking-widest mb-6">
            <span>Encounter Type: {selectedConsult.type || 'AI Consultation'}</span>
            <span>•</span>
            <span>Complaint: {selectedConsult.reason}</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#0a1628]/40 border border-white/5 p-1 rounded-xl w-72 mb-6">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'notes' ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary'}`}
            >
              Clinical Notes
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'copilot' ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary'}`}
            >
              AI Clinical Copilot
            </button>
          </div>

          {/* Clinical Notes Tab */}
          {activeTab === 'notes' && (
            <form onSubmit={handleSaveRecord} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Clinical Diagnosis</label>
                <textarea value={diagText} onChange={(e) => setDiagText(e.target.value)} placeholder="Primary diagnosis details..." rows="3"
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Prescriptions / Drug Dosing</label>
                <textarea value={prescText} onChange={(e) => setPrescText(e.target.value)} placeholder="Tab. DrugName 40mg - once daily for 30 days..." rows="3"
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40" required />
              </div>

              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Intake Vitals Readings</span>
                <div className="grid grid-cols-4 gap-3">
                  {[['BP (mmHg)', vitalsBp, setVitalsBp, 'text'], ['HR (bpm)', vitalsHr, setVitalsHr, 'number'], ['Temp (°F)', vitalsTemp, setVitalsTemp, 'text'], ['SpO2 (%)', vitalsSpo2, setVitalsSpo2, 'number']].map(([label, val, setter, type]) => (
                    <div key={label} className="space-y-1">
                      <label className="text-[9px] text-text-secondary font-mono">{label}</label>
                      <input type={type} value={val} onChange={(e) => setter(e.target.value)}
                        className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-6 border-t border-white/5">
                <Button variant="outline" type="button" onClick={() => setConsultOpen(false)} className="flex-1 py-2.5 text-xs">Cancel</Button>
                <Button type="submit" loading={savingRecord} className="flex-1 py-2.5 text-xs flex items-center justify-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Encounter file</span>
                </Button>
              </div>
            </form>
          )}

          {/* AI Copilot Tab */}
          {activeTab === 'copilot' && (
            <div className="space-y-6 text-left select-none">
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Describe Symptoms for AI analysis</label>
                <textarea value={symptomsInput} onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="Enter detailed comorbidity patterns or clinical signs..." rows="3"
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40" />
                <Button onClick={handleAskCopilot} disabled={loadingAi}
                  className="w-full py-2.5 text-xs font-bold border-2 border-brand-cyan/20 flex items-center justify-center space-x-2">
                  <Brain className="w-4 h-4 text-white" />
                  <span>Activate Clinical Copilot</span>
                </Button>
              </div>

              {loadingAi && <SkeletonLoader variant="card" />}

              {aiResult && !loadingAi && (
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <Card className="p-4 border-brand-cyan/35 bg-brand-cyan/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-brand-cyan flex items-center space-x-1">
                        <Brain className="w-3.5 h-3.5" /><span>Probable Condition Analysis</span>
                      </span>
                      <span className="text-xs font-black text-brand-cyan">Confidence: {aiResult.confidence}%</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{aiResult.probableDiagnosis}</h4>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3 border border-white/5">
                      <div className="h-full bg-brand-cyan" style={{ width: `${aiResult.confidence}%` }} />
                    </div>
                  </Card>

                  {aiResult.differentialDiagnoses?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-text-secondary">Differential Diagnoses</span>
                      {aiResult.differentialDiagnoses.map((d, i) => (
                        <div key={i} className="p-2.5 bg-surface-secondary/40 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                          <span className="text-white font-bold">{d.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-text-secondary font-mono">{d.confidence}%</span>
                            <Badge variant={d.severity === 'Critical' ? 'danger' : 'warning'}>{d.severity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiResult.drugInteractionWarning?.warning && (
                    <div className="p-3 bg-brand-danger/10 border border-brand-danger/25 rounded-xl flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-brand-danger mt-0.5 flex-shrink-0 animate-bounce" />
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-brand-danger block">Drug interaction alert</span>
                        <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">{aiResult.drugInteractionWarning.warning}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setDiagText(aiResult.probableDiagnosis);
                      setPrescText('Initiate Emergency ECG and serial cardiac enzyme panels.');
                      setActiveTab('notes');
                      toast.success('AI suggestions merged to clinical notes.');
                    }}
                    className="w-full py-2.5 text-xs font-bold"
                  >
                    Merge to Encounter Notes
                  </Button>
                </div>
              )}
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
};

export default DoctorDashboard;
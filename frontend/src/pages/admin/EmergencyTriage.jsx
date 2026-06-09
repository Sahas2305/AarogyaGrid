/**
 * Page Name: EmergencyTriage
 * Props: None
 * Description: High-urgency ER triage dashboard tracking incoming patients sorted by AI assessment scores.
 * Used on: App.jsx (guarded route /admin/triage)
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, ShieldAlert, Heart, Activity, UserPlus, Brain, Clock, ChevronRight } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { CustomDonutChart } from '../../components/charts/DonutChart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { mockTriagePatients as initialTriagePatients } from '../../data/mockAIDiagnosis';

// Mock charts data
const initialTrend = [
  { time: '18:00', count: 12 },
  { time: '19:00', count: 15 },
  { time: '20:00', count: 18 },
  { time: '21:00', count: 16 },
  { time: '22:00', count: 14 }
];

const initialDonut = [
  { name: 'Cardiology', value: 3 },
  { name: 'Trauma', value: 4 },
  { name: 'Pediatrics', value: 2 },
  { name: 'General ER', value: 5 }
];

// Helper Vitals Mini Row
const VitalsMiniRow = ({ vitals }) => {
  const { bp, hr, temp, spo2 } = vitals;
  
  // Color calculators
  const getBpClass = () => {
    const sys = parseInt(bp.split('/')[0]);
    if (sys > 140 || sys < 90) return 'text-brand-danger font-bold';
    if (sys > 130) return 'text-brand-warning';
    return 'text-brand-success';
  };

  const getHrClass = () => {
    if (hr > 100 || hr < 60) return 'text-brand-danger font-bold';
    if (hr > 90) return 'text-brand-warning';
    return 'text-brand-success';
  };

  const getSpo2Class = () => {
    if (spo2 < 92) return 'text-brand-danger font-bold animate-pulse';
    if (spo2 < 95) return 'text-brand-warning';
    return 'text-brand-success';
  };

  const getTempClass = () => {
    const t = parseFloat(temp);
    if (t > 101) return 'text-brand-danger font-bold';
    if (t > 99) return 'text-brand-warning';
    return 'text-brand-success';
  };

  return (
    <div className="flex space-x-2 text-[10px] font-mono select-none">
      <span className={`px-1 rounded bg-white/5 border border-white/5 ${getBpClass()}`} title="Blood Pressure">{bp}</span>
      <span className={`px-1 rounded bg-white/5 border border-white/5 ${getHrClass()}`} title="Heart Rate">{hr} bpm</span>
      <span className={`px-1 rounded bg-white/5 border border-white/5 ${getSpo2Class()}`} title="Oxygen saturation">{spo2}%</span>
      <span className={`px-1 rounded bg-white/5 border border-white/5 ${getTempClass()}`} title="Temperature">{temp}°F</span>
    </div>
  );
};

export const EmergencyTriage = () => {
  useRoleGuard(['admin']);

  // Triage state
  const [patients, setPatients] = useState(initialTriagePatients);
  const [criticalCount, setCriticalCount] = useState(3);
  const [highCount, setHighCount] = useState(3);
  const [mediumCount, setMediumCount] = useState(4);
  const [lowCount, setLowCount] = useState(5);
  const [trendData, setTrendData] = useState(initialTrend);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  // Form State for Triage Modal
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newComplaint, setNewComplaint] = useState('');
  const [newBp, setNewBp] = useState('120/80');
  const [newHr, setNewHr] = useState('80');
  const [newSpo2, setNewSpo2] = useState('98');
  const [newTemp, setNewTemp] = useState('98.6');

  // Simulated Real-Time telemetry updates
  useEffect(() => {
    const timer = setInterval(() => {
      // Randomly change a category by +/- 1
      const chooser = Math.floor(Math.random() * 4);
      const delta = Math.random() > 0.5 ? 1 : -1;
      
      if (chooser === 0) setCriticalCount(prev => Math.max(1, prev + delta));
      if (chooser === 1) setHighCount(prev => Math.max(1, prev + delta));
      if (chooser === 2) setMediumCount(prev => Math.max(1, prev + delta));
      if (chooser === 3) setLowCount(prev => Math.max(1, prev + delta));

      // Randomly update the waiting time of the first few queue members
      setPatients(prev => 
        prev.map((pat, idx) => {
          if (idx < 5) return { ...pat, waitingTime: pat.waitingTime + 1 };
          return pat;
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Sort queue by AI Triage Score descending
  const sortedPatients = [...patients].sort((a, b) => b.aiTriageScore - a.aiTriageScore);

  const getTriageScoreColor = (score) => {
    if (score >= 90) return 'text-brand-danger';
    if (score >= 70) return 'text-brand-warning';
    if (score >= 50) return 'text-brand-purple';
    return 'text-brand-success';
  };

  const getUrgencyVariant = (urgency) => {
    if (urgency === 'Critical') return 'danger';
    if (urgency === 'High') return 'warning';
    if (urgency === 'Medium') return 'purple';
    return 'success';
  };

  const handleTriageAssessment = (e) => {
    e.preventDefault();
    if (!newName || !newAge || !newComplaint) {
      toast.error('Complete all fields.');
      return;
    }

    setLoadingAssessment(true);
    toast.loading('Analyzing vitals curves and calculating triage priority...');

    setTimeout(() => {
      toast.dismiss();
      setLoadingAssessment(false);
      setModalOpen(false);

      // Generate a mock AI triage score based on SpO2 and HR
      const oxygen = parseInt(newSpo2);
      const pulse = parseInt(newHr);
      
      let calculatedScore = 40;
      let calculatedUrgency = 'Low';

      if (oxygen < 90) {
        calculatedScore = 95;
        calculatedUrgency = 'Critical';
      } else if (oxygen < 94 || pulse > 105) {
        calculatedScore = 80;
        calculatedUrgency = 'High';
      } else if (pulse > 90) {
        calculatedScore = 60;
        calculatedUrgency = 'Medium';
      }

      const newTriageRecord = {
        patientName: newName,
        age: parseInt(newAge),
        complaint: newComplaint,
        vitals: { bp: newBp, hr: parseInt(newHr), temp: parseFloat(newTemp), spo2: parseInt(newSpo2) },
        aiTriageScore: calculatedScore,
        urgency: calculatedUrgency,
        waitingTime: 1
      };

      setPatients([newTriageRecord, ...patients]);
      toast.success(`AI Assessment generated. Patient categorized as ${calculatedUrgency.toUpperCase()} (Score: ${calculatedScore})`);

      // Reset
      setNewName('');
      setNewAge('');
      setNewComplaint('');
      setNewBp('120/80');
      setNewHr('80');
      setNewSpo2('98');
      setNewTemp('98.6');
    }, 2000);
  };

  const handleAssignDoctor = (name) => {
    toast.success(`Assigned Emergency Trauma Surgeon to patient ${name}`);
    setPatients(prev => prev.filter(p => p.patientName !== name));
  };

  const handleEscalate = (name) => {
    setPatients(prev => 
      prev.map(p => {
        if (p.patientName === name) {
          toast.success(`Priority escalated for ${name}`);
          return { ...p, aiTriageScore: Math.min(100, p.aiTriageScore + 10), urgency: 'Critical' };
        }
        return p;
      })
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a1a] -m-6 p-6 space-y-6 select-none overflow-x-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-danger/20 border border-brand-danger/30 rounded-xl text-brand-danger animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Emergency Triage Command</h2>
            <p className="text-xs text-text-secondary mt-1">High-priority patient routing directed by real-time vital telemetry</p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-bold py-2.5 px-4 bg-brand-danger border-brand-danger hover:bg-brand-danger/80"
        >
          <UserPlus className="w-4 h-4" />
          <span>Intake Assessment</span>
        </Button>
      </div>

      {/* Emergency Live Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        
        <div className="rounded-2xl p-5 border border-brand-danger/40 bg-brand-danger/5 animate-pulse flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-danger uppercase tracking-widest font-black">CRITICAL (Red)</span>
            <AlertTriangle className="w-4 h-4 text-brand-danger" />
          </div>
          <h3 className="text-3xl font-black text-white">{criticalCount} <span className="text-xs text-text-secondary font-semibold">Active</span></h3>
        </div>

        <div className="rounded-2xl p-5 border border-brand-warning/30 bg-brand-warning/5 flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-warning uppercase tracking-widest font-black">HIGH (Amber)</span>
            <ShieldAlert className="w-4 h-4 text-brand-warning" />
          </div>
          <h3 className="text-3xl font-black text-white">{highCount} <span className="text-xs text-text-secondary font-semibold">Active</span></h3>
        </div>

        <div className="rounded-2xl p-5 border border-brand-purple/30 bg-brand-purple/5 flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-purple uppercase tracking-widest font-black">MEDIUM (Yellow)</span>
            <Clock className="w-4 h-4 text-brand-purple" />
          </div>
          <h3 className="text-3xl font-black text-white">{mediumCount} <span className="text-xs text-text-secondary font-semibold">Active</span></h3>
        </div>

        <div className="rounded-2xl p-5 border border-brand-success/30 bg-brand-success/5 flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-success uppercase tracking-widest font-black">LOW (Green)</span>
            <Activity className="w-4 h-4 text-brand-success" />
          </div>
          <h3 className="text-3xl font-black text-white">{lowCount} <span className="text-xs text-text-secondary font-semibold">Active</span></h3>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Queue Table */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">ER Live Triage Routing Queue</h3>
          <Table className="bg-transparent border-white/5">
            <Thead className="bg-white/[0.02] border-white/5">
              <Tr>
                <Th>Patient Profile</Th>
                <Th>Triage Complaint</Th>
                <Th>Telemetry Vitals</Th>
                <Th className="text-center">AI Triage Score</Th>
                <Th>Urgency</Th>
                <Th>Wait Time</Th>
                <Th className="text-center">Routing Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedPatients.map((pat) => {
                const isCritical = pat.urgency === 'Critical';
                return (
                  <Tr
                    key={pat.patientName}
                    className={`
                      ${isCritical ? 'bg-brand-danger/10 border-l-4 border-brand-danger animate-pulse' : 'bg-white/[0.01]'}
                      border-white/5 hover:bg-white/5
                    `}
                  >
                    <Td className="font-bold text-white text-xs px-4 py-3">
                      <div className="flex flex-col">
                        <span>{pat.patientName}</span>
                        <span className="text-[9px] text-text-secondary/70 font-normal mt-0.5">{pat.age} yrs</span>
                      </div>
                    </Td>
                    <Td className="text-xs text-white px-4 py-3 max-w-[150px] truncate" title={pat.complaint}>{pat.complaint}</Td>
                    <Td className="px-4 py-3">
                      <VitalsMiniRow vitals={pat.vitals} />
                    </Td>
                    <Td className="text-center px-4 py-3 font-mono text-sm font-black">
                      <span className={getTriageScoreColor(pat.aiTriageScore)}>
                        {pat.aiTriageScore}
                      </span>
                    </Td>
                    <Td className="px-4 py-3">
                      <Badge variant={getUrgencyVariant(pat.urgency)} className="text-[9px] py-0 px-1.5 uppercase font-bold tracking-wider">
                        {pat.urgency}
                      </Badge>
                    </Td>
                    <Td className="font-mono text-xs px-4 py-3 text-text-secondary">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{pat.waitingTime}m</span>
                      </span>
                    </Td>
                    <Td className="text-center px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="success"
                          className="py-0.5 px-2 text-[9px] tracking-wide"
                          onClick={() => handleAssignDoctor(pat.patientName)}
                        >
                          Assign Doc
                        </Button>
                        <Button
                          variant="outline"
                          className="py-0.5 px-2 text-[9px] hover:bg-brand-danger/10 hover:text-brand-danger"
                          onClick={() => handleEscalate(pat.patientName)}
                        >
                          Escalate
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </div>

        {/* Right Charts Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Triage Trend mini chart */}
          <Card className="p-4 bg-surface-card border border-white/5 space-y-4">
            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Triage Intake Curve</h4>
              <p className="text-[10px] text-text-secondary/70 mt-0.5">ER patient entries per hour</p>
            </div>
            <div className="w-full h-32">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d2044', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10 }} />
                  <Line type="monotone" dataKey="count" stroke="#ff1744" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Donut chart for load */}
          <Card className="p-4 bg-surface-card border border-white/5 space-y-3">
            <div>
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Active ER Bed Burden</h4>
              <p className="text-[10px] text-text-secondary/70 mt-0.5">Active cases mapped to medical units</p>
            </div>
            <CustomDonutChart data={initialDonut} height={200} />
          </Card>

        </div>

      </div>

      {/* Intake Assessment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Emergency Intake Assessment"
        size="md"
      >
        <form onSubmit={handleTriageAssessment} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Patient Full Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Karan Malhotra"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Age (Years)</label>
              <input
                type="number"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                placeholder="38"
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Chief Complaint</label>
              <input
                type="text"
                value={newComplaint}
                onChange={(e) => setNewComplaint(e.target.value)}
                placeholder="Crushing chest pain"
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-3">
            <div className="space-y-1 col-span-2">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">BP (mmHg)</label>
              <input
                type="text"
                value={newBp}
                onChange={(e) => setNewBp(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">HR (bpm)</label>
              <input
                type="number"
                value={newHr}
                onChange={(e) => setNewHr(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">SpO2 (%)</label>
              <input
                type="number"
                value={newSpo2}
                onChange={(e) => setNewSpo2(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Temp (°F)</label>
              <input
                type="text"
                value={newTemp}
                onChange={(e) => setNewTemp(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex items-start space-x-2.5">
            <Brain className="w-4 h-4 text-brand-danger mt-0.5 flex-shrink-0" />
            <span className="text-[9px] text-text-secondary leading-relaxed font-semibold">
              Warning: Submitting this form runs the inputs through the AI clinical triage predictor to dynamically prioritize ER clinician routing.
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 text-xs py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loadingAssessment}
              className="flex-1 text-xs py-2 bg-brand-danger border-brand-danger hover:bg-brand-danger/80"
            >
              Calculate Priority
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
};

export default EmergencyTriage;

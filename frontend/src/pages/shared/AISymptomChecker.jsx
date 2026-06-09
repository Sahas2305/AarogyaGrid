/**
 * Page Name: AISymptomChecker
 * Props: None
 * Description: Interactive AI-powered symptom checker with chat bubbles and circular metrics gauge.
 * Used on: App.jsx (guarded routes /doctor/symptom-checker and /patient/symptom-checker)
 */
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Brain, Send, Activity, Sparkles, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockDiagnosisHistory } from '../../data/mockAIDiagnosis';

const symptomChips = [
  'Chest Pain', 'Shortness of breath', 'Severe Headache', 'High Fever',
  'Dizziness', 'Epigastric Burn', 'Left calf swelling', 'Slurred Speech',
  'Sore Throat', 'Dry Cough', 'Stiff Joint', 'Epistaxis'
];

export const AISymptomChecker = ({ viewMode = 'patient' }) => {
  useRoleGuard(['doctor', 'patient']);

  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Symptom Diagnosis Assistant. Please select or describe your physical symptoms below to calculate a clinical triage assessment.', time: '10:00 AM' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Diagnostic output states (Rahul Mehta default sample check)
  const [condition, setCondition] = useState('Acute Coronary Syndrome (ACS)');
  const [confidence, setConfidence] = useState(78);
  const [urgency, setUrgency] = useState('Critical');
  const [desc, setDesc] = useState('ACS refers to a range of clinical conditions associated with sudden, reduced blood flow to the heart (ischemia). An emergency ECG is immediately required to rule out myocardial infarction.');
  const [actions, setActions] = useState([
    'Report to the Emergency Ward at Dayananda Sagar Hospital immediately.',
    'Initiate high flow oxygen support and serial cardiac troponin tests.',
    'Administer chewable aspirin 300mg as directed by emergency triage staff.'
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleChipClick = (chip) => {
    setInputValue(prev => prev ? `${prev}, ${chip}` : chip);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { sender: 'user', text: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // AI thinking delay (1.5s)
    setTimeout(() => {
      setIsTyping(false);
      
      // Calculate dynamic outputs based on keywords
      const text = userMessage.text.toLowerCase();
      let matchedCond = 'General Febrile Illness';
      let matchedConf = 75;
      let matchedUrgency = 'Low';
      let matchedDesc = 'Symptoms indicate a typical seasonal viral response. Monitor temperature and maintain hydration.';
      let matchedActions = ['Rest and isolate.', 'Monitor vitals daily.', 'Take paracetamol if fever persists.'];

      if (text.includes('chest') || text.includes('heart') || text.includes('breath')) {
        matchedCond = 'Acute Coronary Syndrome (ACS)';
        matchedConf = 91;
        matchedUrgency = 'Critical';
        matchedDesc = 'Squeezing chest pain with cardiac indicators. Immediate ER troponin checks and ECG recommended.';
        matchedActions = ['Present to ER immediately.', 'Chew Aspirin 300mg if eligible.', 'Begin oxygen therapy.'];
      } else if (text.includes('speech') || text.includes('weakness') || text.includes('slur')) {
        matchedCond = 'Transient Ischemic Attack / Stroke';
        matchedConf = 88;
        matchedUrgency = 'Critical';
        matchedDesc = 'Neurological symptoms with high vascular threat indicators. Urgent brain MRI scans needed.';
        matchedActions = ['Access nearest trauma unit.', 'Do not ingest solid food.', 'Prepare CT angiography.'];
      } else if (text.includes('headache') || text.includes('migraine')) {
        matchedCond = 'Severe Migraine with Aura';
        matchedConf = 82;
        matchedUrgency = 'Medium';
        matchedDesc = 'Pounding headache behind eye matching vascular migraine parameters.';
        matchedActions = ['Rest in dark, quiet room.', 'Avoid bright screen lights.', 'Consult neurologist if pain worsens.'];
      }

      setCondition(matchedCond);
      setConfidence(matchedConf);
      setUrgency(matchedUrgency);
      setDesc(matchedDesc);
      setActions(matchedActions);

      const aiMessage = {
        sender: 'ai',
        text: `Diagnostic Model updated. Predicted Condition: **${matchedCond}** (Urgency: ${matchedUrgency}, Confidence: ${matchedConf}%). Details have been loaded in the right-side output panel.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      toast.success('AI assessment updated!');
    }, 1500);
  };

  const getUrgencyClass = (lvl) => {
    if (lvl === 'Critical') return 'text-brand-danger bg-brand-danger/10 border-brand-danger/30 animate-pulse';
    if (lvl === 'High') return 'text-brand-warning bg-brand-warning/10 border-brand-warning/30';
    if (lvl === 'Medium') return 'text-brand-purple bg-brand-purple/10 border-brand-purple/30';
    return 'text-brand-success bg-brand-success/10 border-brand-success/30';
  };

  // SVG Gauge calculations
  const strokeRadius = 38;
  const circ = 2 * Math.PI * strokeRadius;
  const strokeOffset = circ * (1 - confidence / 100);

  return (
    <div className="space-y-6 select-none text-left">
      {/* Header Panel */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">AI Symptom Assistant</h2>
          <p className="text-xs text-text-secondary mt-1">
            {viewMode === 'doctor' ? 'Clinician workspace: verify patient logs' : 'Patient portal: chat diagnostics'}
          </p>
        </div>
      </div>

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Chat Interface */}
        <div className="lg:col-span-7 flex flex-col justify-between h-[450px] bg-surface-card border border-white/5 rounded-2xl overflow-hidden relative">
          
          {/* Messages box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex space-x-2 w-full text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="p-2 bg-brand-cyan/10 rounded-full h-fit border border-brand-cyan/20 flex-shrink-0">
                    <Brain className="w-4 h-4 text-brand-cyan animate-pulse" />
                  </div>
                )}
                <div
                  className={`
                    p-3 rounded-xl border max-w-[80%] leading-relaxed
                    ${m.sender === 'user'
                      ? 'bg-brand-cyan/10 border-brand-cyan/25 text-white rounded-br-none'
                      : 'bg-[#112255]/45 border-white/5 text-text-secondary rounded-bl-none'
                    }
                  `}
                >
                  <p>{m.text}</p>
                  <span className="text-[8px] text-text-secondary/50 block text-right mt-1.5 font-mono">{m.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex space-x-2 justify-start items-center">
                <div className="p-2 bg-brand-cyan/10 rounded-full h-fit border border-brand-cyan/20">
                  <Brain className="w-4 h-4 text-brand-cyan animate-pulse" />
                </div>
                <div className="p-3 bg-[#112255]/45 border border-white/5 rounded-xl rounded-bl-none flex space-x-1">
                  <motion.span animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 bg-brand-cyan rounded-full" />
                  <motion.span animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 bg-brand-cyan rounded-full" />
                  <motion.span animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 bg-brand-cyan rounded-full" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Symptom Chips & Send Panel */}
          <div className="border-t border-white/5 p-3 space-y-3 bg-[#0a1628]/35 z-10 relative">
            
            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-y-auto pr-1">
              {symptomChips.map(chip => (
                <span
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-2 py-0.5 border border-white/5 bg-[#112255]/40 hover:bg-[#112255]/85 hover:border-brand-cyan/20 rounded-full text-[9px] font-bold text-text-secondary hover:text-white cursor-pointer transition-colors"
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe your symptoms or type here..."
                className="w-full bg-[#112255]/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none focus:border-brand-cyan/40"
              />
              <Button type="submit" className="p-2 flex-shrink-0">
                <Send className="w-4 h-4 text-white" />
              </Button>
            </form>

          </div>
        </div>

        {/* Right: Diagnosis Output Panel */}
        <div className="lg:col-span-5">
          <Card className="p-5 bg-surface-card border border-white/5 space-y-4 h-[450px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>AI Diagnostics Metrics</span>
              </span>
              <span className="text-[8px] font-mono text-text-secondary/40">Powered by Gemini API</span>
            </div>

            {/* Circular Gauge */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Predicted Diagnosis</span>
                <h4 className="text-sm font-black text-white mt-1">{condition}</h4>
                
                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-3.5 ${getUrgencyClass(urgency)}`}>
                  Urgency: {urgency}
                </span>
              </div>

              {/* Confidence Gauge SVG */}
              <div className="relative flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r={strokeRadius} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r={strokeRadius}
                    stroke="#00d4ff"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs font-black text-white">{confidence}%</span>
                  <span className="text-[7px] text-text-secondary/50 uppercase tracking-widest">Conf</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 bg-[#112255]/30 border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-text-secondary">
              <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Condition Description</span>
              <p>{desc}</p>
            </div>

            {/* Actions list */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Recommended Triage Actions</span>
              <ol className="list-decimal pl-4 text-text-secondary space-y-1">
                {actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </div>

          </Card>
        </div>

      </div>

      {/* Diagnosis History Table */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Diagnostics History Index</h3>
        <Table>
          <Thead>
            <Tr>
              <Th>Log ID</Th>
              <Th>Date & Time</Th>
              <Th>Reported Symptoms</Th>
              <Th>Condition Assessed</Th>
              <Th>Urgency</Th>
              <Th className="text-center">Confidence</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockDiagnosisHistory.map((log) => (
              <Tr key={log.logId}>
                <Td className="font-mono text-xs font-bold text-white">{log.logId}</Td>
                <Td className="text-xs font-mono text-text-secondary">{log.date}</Td>
                <Td className="text-xs text-white max-w-[200px] truncate" title={log.symptoms}>{log.symptoms}</Td>
                <Td className="text-xs font-semibold text-white">{log.condition}</Td>
                <Td>
                  <Badge variant={getUrgencyVariant(log.urgency)} className="text-[9px] uppercase py-0 px-2 font-bold">{log.urgency}</Badge>
                </Td>
                <Td className="text-center font-mono text-xs text-brand-cyan font-bold">{log.confidence}%</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

    </div>
  );
};

// Helper status mapping
const getUrgencyVariant = (urgency) => {
  if (urgency === 'Critical') return 'danger';
  if (urgency === 'High') return 'warning';
  if (urgency === 'Medium') return 'purple';
  return 'success';
};

export default AISymptomChecker;

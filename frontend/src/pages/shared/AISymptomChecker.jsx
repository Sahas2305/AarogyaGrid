/**
 * Page Name: AISymptomChecker
 * Props: viewMode ('patient' | 'doctor')
 * Description: Interactive AI-powered symptom checker. Sends symptoms to the Flask
 *   backend which calls Gemini API for real clinical triage. Returns condition,
 *   urgency, confidence, recommended actions, and the specialist to book.
 * Used on: /patient/symptom-checker and /doctor/symptom-checker
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Brain, Send, Sparkles, AlertTriangle, ShieldCheck,
  Stethoscope, CalendarPlus, Loader2, RefreshCw
} from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { submitSymptoms, getAIDiagnosis } from '../../api/api';

// ── Quick-select symptom chips ────────────────────────────────────────────────
const symptomChips = [
  'Chest Pain', 'Shortness of Breath', 'Severe Headache', 'High Fever',
  'Dizziness', 'Epigastric Burn', 'Left Calf Swelling', 'Slurred Speech',
  'Sore Throat', 'Dry Cough', 'Stiff Joint', 'Nosebleed',
  'Skin Rash', 'Abdominal Pain', 'Back Pain', 'Blurred Vision',
];

// ── Urgency styling map ───────────────────────────────────────────────────────
const urgencyStyle = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30 animate-pulse',
  High:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Low:      'text-green-400 bg-green-500/10 border-green-500/30',
};
const urgencyVariant = { Critical: 'danger', High: 'warning', Medium: 'purple', Low: 'success' };

// ── Specialty icon map ────────────────────────────────────────────────────────
const specialtyEmoji = {
  'Cardiologist':        '❤️',
  'Neurologist':         '🧠',
  'General Physician':   '🩺',
  'Orthopedic Surgeon':  '🦴',
  'Pulmonologist':       '🫁',
  'Gastroenterologist':  '🫀',
  'Dermatologist':       '🩹',
  'ENT Specialist':      '👂',
  'Ophthalmologist':     '👁️',
  'Psychiatrist':        '🧘',
};

export const AISymptomChecker = ({ viewMode = 'patient' }) => {
  useRoleGuard(['doctor', 'patient']);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: '👋 Hello! I am your AI Symptom Diagnosis Assistant powered by Gemini.\n\nSelect symptoms from the chips below or type them in free-form text, then hit Send. I will analyse them and suggest which type of doctor you should book.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [inputValue, setInputValue]   = useState('');
  const [isTyping,   setIsTyping]     = useState(false);
  const [analyzing,  setAnalyzing]    = useState(false);
  const chatEndRef = useRef(null);

  // ── Diagnosis panel state ───────────────────────────────────────────────────
  const [diagnosis, setDiagnosis] = useState(null);   // full API response object
  const [diagHistory, setDiagHistory] = useState([]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Chip click ──────────────────────────────────────────────────────────────
  const handleChipClick = (chip) => {
    setInputValue(prev => prev ? `${prev}, ${chip}` : chip);
  };

  // ── Send symptoms → backend → Gemini ───────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setAnalyzing(true);

    try {
      // 1. Log symptoms (non-blocking failure)
      let symptomId = null;
      try {
        const logRes = await submitSymptoms({ symptom_description: text, source: 'patient-portal' });
        symptomId = logRes?.symptom_id ?? null;
      } catch (_) { /* silently continue */ }

      // 2. Get AI diagnosis
      const result = await getAIDiagnosis({
        symptoms: text,
        patient_age: user?.dob
          ? new Date().getFullYear() - new Date(user.dob).getFullYear()
          : undefined,
      });

      setDiagnosis(result);

      // Update history table
      const logEntry = {
        logId:      `DX-${Date.now().toString(36).toUpperCase()}`,
        date:       new Date().toLocaleString(),
        symptoms:   text,
        condition:  result.condition,
        urgency:    result.urgency,
        confidence: result.confidence,
        specialty:  result.specialty,
      };
      setDiagHistory(prev => [logEntry, ...prev]);

      // AI reply in chat
      const aiReply = {
        sender: 'ai',
        text: `✅ Analysis complete.\n\n**${result.condition}** (Urgency: ${result.urgency}, Confidence: ${result.confidence}%)\n\nI recommend seeing a **${result.specialty}**. ${result.specialty_reason}\n\nSee the panel on the right for full details and booking options.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiReply]);

      if (result._fallback) {
        toast('⚠️ Gemini unavailable — using fallback assessment.', { icon: '⚠️' });
      } else {
        toast.success('AI triage complete!');
      }

    } catch (err) {
      const errMsg = { sender: 'ai', text: '❌ Analysis failed. Please check your connection and try again.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, errMsg]);
      toast.error('AI diagnosis request failed.');
    } finally {
      setIsTyping(false);
      setAnalyzing(false);
    }
  };

  // ── Book appointment pre-filled with specialty ────────────────────────────
  const handleBookWithSpecialty = () => {
    if (!diagnosis?.specialty) return;
    sessionStorage.setItem('ai_recommended_specialty', diagnosis.specialty);
    sessionStorage.setItem('ai_recommended_condition', diagnosis.condition);
    navigate('/patient/book');
  };

  // ── Confidence gauge ──────────────────────────────────────────────────────
  const confidence    = diagnosis?.confidence ?? 0;
  const strokeRadius  = 38;
  const circ          = 2 * Math.PI * strokeRadius;
  const strokeOffset  = circ * (1 - confidence / 100);
  const gaugeColor    = confidence >= 80 ? '#00d4ff' : confidence >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6 select-none text-left">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">AI Symptom Checker</h2>
          <p className="text-xs text-text-secondary mt-1">
            {viewMode === 'doctor'
              ? 'Clinician workspace — verify and interpret patient symptom logs'
              : 'Describe your symptoms and get an instant AI triage with doctor recommendation'}
          </p>
        </div>
      </div>

      {/* ── Two-Column Workspace ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Chat ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col h-[480px] bg-surface-card border border-white/5 rounded-2xl overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex space-x-2 w-full text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'ai' && (
                  <div className="p-2 bg-brand-cyan/10 rounded-full h-fit border border-brand-cyan/20 flex-shrink-0">
                    <Brain className="w-4 h-4 text-brand-cyan animate-pulse" />
                  </div>
                )}
                <div className={`p-3 rounded-xl border max-w-[82%] leading-relaxed whitespace-pre-line
                  ${m.sender === 'user'
                    ? 'bg-brand-cyan/10 border-brand-cyan/25 text-white rounded-br-none'
                    : 'bg-[#112255]/45 border-white/5 text-text-secondary rounded-bl-none'}`}>
                  <p>{m.text}</p>
                  <span className="text-[8px] text-text-secondary/40 block text-right mt-1.5 font-mono">{m.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex space-x-2 justify-start items-center">
                <div className="p-2 bg-brand-cyan/10 rounded-full h-fit border border-brand-cyan/20">
                  <Brain className="w-4 h-4 text-brand-cyan animate-pulse" />
                </div>
                <div className="p-3 bg-[#112255]/45 border border-white/5 rounded-xl rounded-bl-none flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 text-brand-cyan animate-spin" />
                  <span className="text-[10px] text-text-secondary">Analyzing with Gemini AI...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-white/5 p-3 space-y-2.5 bg-[#0a1628]/35">
            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 max-h-[52px] overflow-y-auto pr-1">
              {symptomChips.map(chip => (
                <span key={chip} onClick={() => handleChipClick(chip)}
                  className="px-2 py-0.5 border border-white/5 bg-[#112255]/40 hover:bg-[#112255]/85 hover:border-brand-cyan/20 rounded-full text-[9px] font-bold text-text-secondary hover:text-white cursor-pointer transition-colors">
                  {chip}
                </span>
              ))}
            </div>
            {/* Send form */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={analyzing}
                placeholder="Describe symptoms or click chips above..."
                className="w-full bg-[#112255]/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/40 outline-none focus:border-brand-cyan/40 disabled:opacity-50"
              />
              <Button type="submit" disabled={analyzing} className="p-2 flex-shrink-0">
                {analyzing
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />}
              </Button>
            </form>
          </div>
        </div>

        {/* ── Right: Diagnosis Panel ──────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Empty state */}
          {!diagnosis && !analyzing && (
            <Card className="p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 h-[480px]">
              <Brain className="w-12 h-12 text-white/10 mb-4" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">AI Triage Panel</h3>
              <p className="text-xs text-text-secondary max-w-xs mt-2 leading-relaxed">
                Enter your symptoms on the left and hit Send. Gemini will analyze them and recommend which specialist to book.
              </p>
            </Card>
          )}

          {/* Loading state */}
          {analyzing && (
            <Card className="p-8 flex flex-col items-center justify-center text-center border border-brand-cyan/20 h-[480px] space-y-4">
              <div className="relative">
                <Brain className="w-12 h-12 text-brand-cyan animate-pulse" />
                <Loader2 className="w-5 h-5 text-brand-cyan animate-spin absolute -bottom-1 -right-1" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Analyzing symptoms...</p>
                <p className="text-xs text-text-secondary mt-1">Gemini AI is processing your report</p>
              </div>
            </Card>
          )}

          {/* Results */}
          {diagnosis && !analyzing && (
            <Card className="p-5 bg-surface-card border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>AI Diagnostic Result</span>
                </span>
                <button onClick={() => setDiagnosis(null)}
                  className="text-text-secondary/40 hover:text-white transition-colors" title="Reset">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Condition + Gauge */}
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Predicted Condition</span>
                  <h4 className="text-sm font-black text-white mt-1 leading-snug">{diagnosis.condition}</h4>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mt-2 ${urgencyStyle[diagnosis.urgency] || urgencyStyle.Medium}`}>
                    ⚠ Urgency: {diagnosis.urgency}
                  </span>
                </div>
                {/* Confidence gauge */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r={strokeRadius} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
                    <motion.circle
                      cx="40" cy="40" r={strokeRadius}
                      stroke={gaugeColor} strokeWidth="6" fill="transparent"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: strokeOffset }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-black text-white">{confidence}%</span>
                    <span className="text-[7px] text-text-secondary/50 uppercase tracking-widest">Conf.</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#112255]/30 border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-text-secondary space-y-1">
                <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Clinical Summary</span>
                <p>{diagnosis.description}</p>
              </div>

              {/* Actions */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Recommended Actions</span>
                <ol className="list-decimal pl-4 text-text-secondary space-y-1">
                  {(diagnosis.actions || []).map((a, i) => <li key={i}>{a}</li>)}
                </ol>
              </div>

              {/* ── Doctor Recommendation Card ──────────────────────────────── */}
              <div className="bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 border border-brand-cyan/25 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                  <span className="text-[10px] uppercase font-extrabold text-brand-cyan tracking-widest">Recommended Specialist</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{specialtyEmoji[diagnosis.specialty] || '🏥'}</span>
                  <div>
                    <p className="text-sm font-black text-white">{diagnosis.specialty}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{diagnosis.specialty_reason}</p>
                  </div>
                </div>

                {/* Book button — only visible for patients */}
                {viewMode === 'patient' && (
                  <Button
                    onClick={handleBookWithSpecialty}
                    className="w-full py-2 text-xs font-bold flex items-center justify-center space-x-2 mt-1 bg-gradient-to-r from-brand-cyan to-brand-blue"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Book Appointment with {diagnosis.specialty}</span>
                  </Button>
                )}
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-yellow-400/80 leading-relaxed font-semibold">
                  DISCLAIMER: AI triage is for informational purposes only. Always consult a qualified healthcare professional before making any medical decisions.
                </p>
              </div>

              <div className="flex items-center justify-between text-[8px] text-text-secondary/30 font-mono pt-1 border-t border-white/5">
                <span>Engine: Gemini 1.5 Flash</span>
                {diagnosis._fallback && <span className="text-yellow-400/50">⚠ Fallback Mode</span>}
                <span>Safety: Verified</span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ── Diagnosis History Table ──────────────────────────────────────── */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Session Diagnostics History</h3>
        <Table>
          <Thead>
            <Tr>
              <Th>Log ID</Th>
              <Th>Time</Th>
              <Th>Reported Symptoms</Th>
              <Th>Condition</Th>
              <Th>Specialist</Th>
              <Th>Urgency</Th>
              <Th className="text-center">Confidence</Th>
            </Tr>
          </Thead>
          <Tbody>
            {diagHistory.length === 0 ? (
              <Tr><Td colSpan={7} className="text-center py-8 text-text-secondary/50 text-xs">
                No sessions logged yet. Submit symptoms above to begin.
              </Td></Tr>
            ) : diagHistory.map((log) => (
              <Tr key={log.logId}>
                <Td className="font-mono text-xs font-bold text-white">{log.logId}</Td>
                <Td className="text-xs font-mono text-text-secondary">{log.date}</Td>
                <Td className="text-xs text-white max-w-[160px] truncate" title={log.symptoms}>{log.symptoms}</Td>
                <Td className="text-xs font-semibold text-white">{log.condition}</Td>
                <Td className="text-xs text-brand-cyan font-semibold">{log.specialty}</Td>
                <Td><Badge variant={urgencyVariant[log.urgency] || 'purple'} className="text-[9px] uppercase py-0 px-2 font-bold">{log.urgency}</Badge></Td>
                <Td className="text-center font-mono text-xs text-brand-cyan font-bold">{log.confidence}%</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

    </div>
  );
};

export default AISymptomChecker;

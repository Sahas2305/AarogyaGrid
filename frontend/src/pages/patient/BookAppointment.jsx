/**
 * Page Name: BookAppointment
 * Props: None
 * Description: Multi-step booking wizard for patients to request appointments.
 * Used on: App.jsx (guarded route /patient/book)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { getDoctors, createAppointment } from '../../api/api';

export const BookAppointment = () => {
  useRoleGuard(['patient']);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot,   setSelectedSlot]   = useState('');
  const [selectedDate,   setSelectedDate]   = useState('2026-06-10');
  const [apptFormat,     setApptFormat]     = useState('In-Person');
  const [complaintText,  setComplaintText]  = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        setDoctors(data);
      } catch (err) {
        toast.error('Failed to load doctors list.');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const slots = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: false },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '11:30 AM', available: true },
    { time: '12:00 PM', available: true },
    { time: '12:30 PM', available: false },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: false },
    { time: '03:30 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: false },
    { time: '05:00 PM', available: true }
  ];

  const handleNext = () => {
    if (step === 1 && !selectedDoctor) { toast.error('Please select a physician to consult.'); return; }
    if (step === 2 && !selectedSlot)   { toast.error('Please pick a time slot.'); return; }
    if (step === 3 && !complaintText)  { toast.error('Please describe your symptoms.'); return; }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      await createAppointment({
        doctor_id:        selectedDoctor.doctor_id,
        department_id:    selectedDoctor.department_id || selectedDoctor.department?.department_id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        type:             apptFormat,
        reason:           complaintText
      });
      toast.success('Appointment booked successfully! Notifications sent.');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none text-left">

      {/* Header */}
      <div className="pb-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Book Clinic Appointment</h2>
          <p className="text-xs text-text-secondary mt-1">Multi-step scheduler to register clinic slots</p>
        </div>
        <Badge variant="cyan">Step {step} of 4</Badge>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center justify-between px-2">
        {[1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <div className="flex items-center space-x-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                step >= i
                  ? 'bg-brand-cyan text-[#0a1628] border-brand-cyan shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                  : 'bg-surface-secondary border-white/10 text-text-secondary'
              }`}>{i}</div>
              <span className={`text-[10px] uppercase font-bold hidden sm:inline tracking-wider ${step >= i ? 'text-white' : 'text-text-secondary'}`}>
                {i === 1 ? 'Doctor' : i === 2 ? 'Schedule' : i === 3 ? 'Details' : 'Confirm'}
              </span>
            </div>
            {i < 4 && <div className={`flex-1 h-[2px] mx-4 rounded transition-all ${step > i ? 'bg-brand-cyan' : 'bg-white/5'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Doctor Select */}
      {step === 1 && (
        <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Choose Doctor</h3>
            <p className="text-xs text-text-secondary mt-1">Select an active physician from the hospital roster</p>
          </div>

          {loadingDoctors ? (
            <SkeletonLoader variant="card" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
              {doctors.map((doc) => (
                <div key={doc.doctor_id} onClick={() => setSelectedDoctor(doc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between
                    ${selectedDoctor?.doctor_id === doc.doctor_id
                      ? 'border-brand-cyan bg-brand-cyan/5 shadow'
                      : 'border-white/5 bg-[#112255]/20 hover:border-white/15'}`}>
                  <div>
                    <span className="text-xs font-bold text-white block">{doc.name}</span>
                    <span className="text-[10px] text-text-secondary mt-0.5 block">{doc.specialization}</span>
                    <span className="text-[9px] font-mono text-brand-cyan block mt-1">{typeof doc.department === 'object' ? doc.department?.department_name : doc.department} dept</span>
                  </div>
                  <Badge variant="success" className="text-[8px] py-0">Available</Badge>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/5">
            <Button onClick={handleNext} className="py-2 text-xs font-bold flex items-center space-x-1">
              <span>Continue</span><ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Time Slots */}
      {step === 2 && (
        <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Date & Time</h3>
            <p className="text-xs text-text-secondary mt-1">Configure appointment timing</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1 w-44">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Consultation Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Available Time Slots</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {slots.map((s, idx) => (
                  <button key={idx} type="button" disabled={!s.available} onClick={() => setSelectedSlot(s.time)}
                    className={`py-2 rounded-lg text-xs font-mono font-semibold transition-all border
                      ${!s.available
                        ? 'bg-white/5 border-transparent text-text-secondary/20 cursor-not-allowed'
                        : selectedSlot === s.time
                          ? 'bg-brand-cyan border-brand-cyan text-[#0a1628] font-bold shadow'
                          : 'bg-brand-success/10 border-brand-success/20 text-brand-success hover:bg-brand-success/20'}`}>
                    {s.time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Button variant="outline" onClick={handleBack} className="py-2 text-xs font-semibold flex items-center space-x-1">
              <ChevronLeft className="w-4 h-4" /><span>Back</span>
            </Button>
            <Button onClick={handleNext} className="py-2 text-xs font-bold flex items-center space-x-1">
              <span>Continue</span><ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Symptoms & Format</h3>
            <p className="text-xs text-text-secondary mt-1">Describe diagnostic details and select consulting type</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Consultation Format</label>
              <div className="flex bg-[#0a1628]/40 border border-white/5 p-1 rounded-xl w-60">
                {['In-Person', 'Virtual'].map((fmt) => (
                  <button key={fmt} type="button" onClick={() => setApptFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      apptFormat === fmt ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary'}`}>
                    {fmt === 'Virtual' ? 'Virtual Tele' : fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Brief Description of Symptoms</label>
              <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)}
                placeholder="List major physical discomforts, pain areas, or follow-up purposes..." rows="5"
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 leading-relaxed" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Button variant="outline" onClick={handleBack} className="py-2 text-xs font-semibold flex items-center space-x-1">
              <ChevronLeft className="w-4 h-4" /><span>Back</span>
            </Button>
            <Button onClick={handleNext} className="py-2 text-xs font-bold flex items-center space-x-1">
              <span>Continue</span><ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Review & Confirm Appointment</h3>
            <p className="text-xs text-text-secondary mt-1">Audit ledger registry details before committing</p>
          </div>

          <div className="p-4 bg-[#112255]/40 border border-white/5 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
              <span className="font-bold text-white">Consulting Practitioner:</span>
              <span className="text-brand-cyan font-bold text-sm">{selectedDoctor?.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pb-3.5 border-b border-white/5">
              <div>
                <span className="text-text-secondary block">Date:</span>
                <span className="text-white font-mono font-semibold">{selectedDate}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Time Slot:</span>
                <span className="text-white font-mono font-semibold">{selectedSlot}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
              <span className="text-text-secondary">Format:</span>
              <Badge variant={apptFormat === 'In-Person' ? 'cyan' : 'purple'} className="uppercase font-bold tracking-wider py-0 px-2.5">
                {apptFormat}
              </Badge>
            </div>
            <div>
              <span className="text-text-secondary block">Reported Symptoms:</span>
              <p className="text-white mt-1 leading-relaxed italic bg-black/25 p-3 rounded-lg border border-white/5">"{complaintText}"</p>
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
            <span className="text-[9px] text-text-secondary leading-relaxed font-semibold">
              Completing booking assigns a scheduling index and synchronizes notification panels on clinician terminals.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <Button variant="outline" onClick={handleBack} className="py-2 text-xs font-semibold flex items-center space-x-1">
              <ChevronLeft className="w-4 h-4" /><span>Back</span>
            </Button>
            <Button onClick={handleConfirmBooking} loading={submitting}
              className="py-2.5 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue">
              Confirm Appointment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookAppointment;
/**
 * Page Name: AppointmentManagement
 * Props: None
 * Description: Administrative calendar and appointment log for Admin and Doctors.
 * Used on: App.jsx (guarded route /appointments)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, List, Plus, ChevronLeft, ChevronRight, Search, Clock, Info, CheckCircle2, User } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockAppointments as initialAppointments } from '../../data/mockAppointments';
import { mockPatients } from '../../data/mockPatients';
import { mockDoctors } from '../../data/mockDoctors';

export const AppointmentManagement = () => {
  useRoleGuard(['admin', 'doctor']);
  const { currentUser } = useAuth();

  const [appointments, setAppointments] = useState(initialAppointments);
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-06-01')); // Set base to project timeline
  const [viewMode, setViewMode] = useState('month'); // month or list
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Filter criteria
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Wizard Booking state
  const [wizardStep, setWizardStep] = useState(1);
  const [wPatId, setWPatId] = useState('');
  const [wDocId, setWDocId] = useState('');
  const [wDate, setWDate] = useState('2026-06-10');
  const [wSlot, setWSlot] = useState('');
  const [wFormat, setWFormat] = useState('In-Person');
  const [wReason, setWReason] = useState('');

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Slots options
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  // Handlers
  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const handleEventClick = (appt) => {
    setSelectedAppt(appt);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setSelectedAppt(null);
    setDetailOpen(false);
  };

  const handleWizardNext = () => {
    if (wizardStep === 1 && !wPatId) return toast.error('Select a patient.');
    if (wizardStep === 2 && !wDocId) return toast.error('Select a clinician.');
    if (wizardStep === 3 && !wSlot) return toast.error('Pick a time slot.');
    if (wizardStep === 4 && !wReason) return toast.error('Enter a complaint reason.');
    setWizardStep(prev => prev + 1);
  };

  const handleWizardSubmit = () => {
    const pat = mockPatients.find(p => p.patientId === wPatId);
    const doc = mockDoctors.find(d => d.doctorId === wDocId);

    const newAppt = {
      appointmentId: `A${appointments.length + 1 < 100 ? '0' + (appointments.length + 1) : appointments.length + 1}`,
      patientId: wPatId,
      patientName: pat?.name || 'Walk-In Patient',
      doctorId: wDocId,
      doctorName: doc?.name || 'Assigned Clinician',
      department: doc?.department || 'General',
      date: wDate,
      timeSlot: wSlot,
      status: 'Scheduled',
      type: wFormat,
      reason: wReason
    };

    setAppointments([newAppt, ...appointments]);
    setWizardOpen(false);
    toast.success(`Booking completed for ${newAppt.patientName}`);
    
    // Reset wizard
    setWizardStep(1);
    setWPatId('');
    setWDocId('');
    setWSlot('');
    setWReason('');
  };

  // Filter application
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || app.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getFormatClass = (format) => {
    if (format === 'In-Person') return 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/35';
    if (format === 'Virtual') return 'bg-brand-purple/20 text-brand-purple border border-brand-purple/35';
    return 'bg-brand-danger/20 text-brand-danger border border-brand-danger/35';
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Centralized Appointments Scheduler</h2>
            <p className="text-xs text-text-secondary mt-1">Audit clinician bookings, consults rosters, and allocate time slots</p>
          </div>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex bg-[#0a1628]/45 border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary hover:text-white'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary hover:text-white'
              }`}
            >
              List Ledger
            </button>
          </div>

          <Button
            onClick={() => setWizardOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold py-2 px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appt</span>
          </Button>
        </div>
      </div>

      {/* View Content Calendar */}
      {viewMode === 'month' ? (
        <Card className="p-5 space-y-4 bg-surface-card border border-white/5">
          {/* Calendar Controller */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center space-x-1.5">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white/5 rounded text-text-secondary hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid weeks headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-text-secondary uppercase font-bold tracking-widest">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Grid day cells */}
          <div className="grid grid-cols-7 gap-2.5">
            {daysInMonth.map((day, index) => {
              const dayAppts = appointments.filter(app => isSameDay(new Date(app.date), day));
              return (
                <div
                  key={index}
                  className="min-h-[90px] p-2 bg-[#112255]/20 border border-white/5 rounded-xl flex flex-col justify-between"
                >
                  <span className="text-xs font-mono font-bold text-text-secondary">{format(day, 'd')}</span>
                  
                  {/* Event labels */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px]">
                    {dayAppts.slice(0, 3).map((app) => (
                      <div
                        key={app.appointmentId}
                        onClick={() => handleEventClick(app)}
                        className={`text-[9px] px-1.5 py-0.5 rounded truncate cursor-pointer font-bold ${getFormatClass(app.type)}`}
                        title={`${app.patientName} - ${app.timeSlot}`}
                      >
                        {app.patientName.split(' ')[0]}
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-[8px] text-brand-cyan font-bold block text-center">+{dayAppts.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* List Mode View */
        <div className="space-y-4">
          <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-card border border-white/5">
            <div className="flex items-center bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-text-secondary mr-2" />
              <input
                type="text"
                placeholder="Search patient or physician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-white outline-none border-none w-full focus:ring-0"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General">General</option>
              <option value="Emergency">Emergency</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </Card>

          <Table>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Patient</Th>
                <Th>Assigned Doctor</Th>
                <Th>Dept</Th>
                <Th>Date & Time</Th>
                <Th>Format</Th>
                <Th>Status</Th>
                <Th className="text-center">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAppointments.map((app) => (
                <Tr key={app.appointmentId}>
                  <Td className="font-mono text-xs font-bold text-white">{app.appointmentId}</Td>
                  <Td className="font-bold text-white text-xs">{app.patientName}</Td>
                  <Td className="text-xs">{app.doctorName}</Td>
                  <Td className="text-xs">{app.department}</Td>
                  <Td className="text-xs font-mono">{app.date} • {app.timeSlot}</Td>
                  <Td>
                    <Badge variant={app.type === 'In-Person' ? 'cyan' : 'purple'}>{app.type}</Badge>
                  </Td>
                  <Td>
                    <Badge variant={app.status === 'Completed' ? 'success' : app.status === 'Scheduled' ? 'cyan' : 'danger'}>
                      {app.status}
                    </Badge>
                  </Td>
                  <Td className="text-center">
                    <Button variant="outline" className="py-0.5 px-2 text-[9px]" onClick={() => handleEventClick(app)}>
                      Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}

      {/* Appointment Detail Popover Modal */}
      {selectedAppt && (
        <Modal
          isOpen={detailOpen}
          onClose={handleCloseDetail}
          title={`Booking Details: ${selectedAppt.appointmentId}`}
          size="sm"
        >
          <div className="space-y-4 text-left select-none text-xs leading-relaxed">
            <div className="pb-2.5 border-b border-white/5">
              <span className="text-[9px] uppercase tracking-widest text-text-secondary">Patient Profile</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{selectedAppt.patientName}</h4>
              <p className="text-[10px] text-text-secondary/70">ID: {selectedAppt.patientId}</p>
            </div>

            <div className="pb-2.5 border-b border-white/5">
              <span className="text-[9px] uppercase tracking-widest text-text-secondary">Consulting Clinician</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{selectedAppt.doctorName}</h4>
              <p className="text-[10px] text-text-secondary/70">{selectedAppt.department} Department</p>
            </div>

            <div className="pb-2.5 border-b border-white/5 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-text-secondary">Date</span>
                <p className="font-mono text-white mt-0.5 font-bold">{selectedAppt.date}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-text-secondary">Time Slot</span>
                <p className="font-mono text-white mt-0.5 font-bold">{selectedAppt.timeSlot}</p>
              </div>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-widest text-text-secondary">Consultation Reason</span>
              <p className="text-white mt-1 italic p-2.5 bg-black/25 rounded-lg border border-white/5">
                "{selectedAppt.reason}"
              </p>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-white/5">
              <Button variant="outline" onClick={handleCloseDetail} className="flex-1 py-2 text-xs">
                Dismiss
              </Button>
              {selectedAppt.status === 'Scheduled' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    handleCancelAppointment(selectedAppt.appointmentId);
                    handleCloseDetail();
                  }}
                  className="flex-1 py-2 text-xs"
                >
                  Cancel Appt
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* New Appointment Wizard Modal */}
      <Modal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Administrative Booking Wizard"
        size="md"
      >
        <div className="space-y-5 text-left select-none">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs border-b border-white/5 pb-3.5 mb-2 font-mono">
            <span className="font-bold text-brand-cyan uppercase">Step {wizardStep} of 5</span>
            <span className="text-text-secondary/40">Scheduler Wizard</span>
          </div>

          {/* Wizard step contents */}
          {wizardStep === 1 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Step 1: Patient Search Select</span>
              <select
                value={wPatId}
                onChange={(e) => setWPatId(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="">-- Choose Patient File --</option>
                {mockPatients.map(p => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.name} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Step 2: Clinician Assignment</span>
              <select
                value={wDocId}
                onChange={(e) => setWDocId(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none"
              >
                <option value="">-- Assign Doctor --</option>
                {mockDoctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Step 3: Pick Date & Time Slot</span>
              
              <div className="space-y-1.5 w-48">
                <label className="text-[9px] text-text-secondary">Consultation Date</label>
                <input
                  type="date"
                  value={wDate}
                  onChange={(e) => setWDate(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-text-secondary block">Available Slots</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setWSlot(slot)}
                      className={`
                        py-1.5 rounded text-xs font-mono font-semibold border transition-all
                        ${wSlot === slot
                          ? 'bg-brand-cyan border-brand-cyan text-[#0a1628]'
                          : 'bg-[#112255]/30 border-white/5 text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Step 4: Encounters Details</span>
              
              <div className="space-y-1.5">
                <label className="text-[9px] text-text-secondary block">Consultation Format</label>
                <div className="flex bg-[#0a1628]/40 border border-white/5 p-1 rounded-xl w-60">
                  <button
                    type="button"
                    onClick={() => setWFormat('In-Person')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      wFormat === 'In-Person' ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary'
                    }`}
                  >
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setWFormat('Virtual')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      wFormat === 'Virtual' ? 'bg-brand-cyan text-[#0a1628]' : 'text-text-secondary'
                    }`}
                  >
                    Virtual
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-text-secondary block">Chief Complaint Reason</label>
                <textarea
                  value={wReason}
                  onChange={(e) => setWReason(e.target.value)}
                  placeholder="Reason for scheduling..."
                  rows="3"
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
                  required
                />
              </div>
            </div>
          )}

          {wizardStep === 5 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">Step 5: Verify & Confirm</span>
              <div className="p-4 bg-[#112255]/40 border border-white/5 rounded-2xl space-y-2 text-xs">
                <p>Patient Name: <span className="text-white font-bold">{mockPatients.find(p => p.patientId === wPatId)?.name}</span></p>
                <p>Doctor: <span className="text-white font-bold">{mockDoctors.find(d => d.doctorId === wDocId)?.name}</span></p>
                <p>Scheduled: <span className="text-brand-cyan font-bold font-mono">{wDate} @ {wSlot}</span></p>
                <p>Format: <span className="text-white font-bold">{wFormat}</span></p>
                <p className="border-t border-white/5 pt-2 mt-2 text-text-secondary italic">
                  "{wReason}"
                </p>
              </div>
            </div>
          )}

          {/* Footer navigators */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <Button
              disabled={wizardStep === 1}
              variant="outline"
              onClick={() => setWizardStep(prev => prev - 1)}
              className="py-1.5 px-3 text-xs"
            >
              Back
            </Button>
            {wizardStep < 5 ? (
              <Button onClick={handleWizardNext} className="py-1.5 px-3 text-xs">
                Continue
              </Button>
            ) : (
              <Button onClick={handleWizardSubmit} className="py-1.5 px-3 text-xs">
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AppointmentManagement;

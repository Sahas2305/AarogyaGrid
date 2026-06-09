/**
 * Page Name: MyAppointments
 * Props: None
 * Description: Renders the active patient's schedule history.
 * Used on: App.jsx (guarded route /patient/appointments)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Video, MapPin, XCircle } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockAppointments } from '../../data/mockAppointments';

export const MyAppointments = () => {
  useRoleGuard(['patient']);
  const navigate = useNavigate();

  // Filter for active patient Rahul Mehta (P01)
  const [appointments, setAppointments] = useState(() =>
    mockAppointments.filter(app => app.patientId === 'P01')
  );

  const handleCancelAppointment = (id) => {
    toast.loading('Cancelling appointment scheduled slot...');
    setTimeout(() => {
      toast.dismiss();
      setAppointments(prev =>
        prev.map(app => (app.appointmentId === id ? { ...app, status: 'Cancelled' } : app))
      );
      toast.success('Appointment cancelled successfully.');
    }, 1200);
  };

  const upcoming = appointments.filter(app => app.status === 'Scheduled');
  const past = appointments.filter(app => app.status === 'Completed' || app.status === 'Cancelled');

  const getStatusVariant = (status) => {
    if (status === 'Completed') return 'success';
    if (status === 'Scheduled') return 'cyan';
    return 'danger';
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Header */}
      <div className="pb-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">My Scheduled Appointments</h2>
          <p className="text-xs text-text-secondary mt-1">Review dates, access tele-consultations, and book new checkups</p>
        </div>
        <Button onClick={() => navigate('/patient/book')} className="mt-4 sm:mt-0 flex items-center space-x-1.5 text-xs font-bold py-2.5">
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </Button>
      </div>

      {/* Upcoming Cards List */}
      <div className="space-y-3.5">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Active Schedules</h3>
        
        {upcoming.length === 0 ? (
          <Card className="p-10 border border-white/5 border-dashed text-center text-text-secondary/50 text-xs">
            No active schedules booked.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcoming.map((app) => (
              <Card key={app.appointmentId} className="p-5 bg-surface-card border border-white/5 flex flex-col justify-between h-48">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3.5">
                    <span className="font-mono text-[10px] text-brand-cyan font-bold tracking-widest">{app.appointmentId}</span>
                    <Badge variant={app.type === 'In-Person' ? 'cyan' : 'purple'} className="uppercase text-[8px] font-black py-0">
                      {app.type}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-wide">{app.doctorName}</h4>
                  <p className="text-xs text-text-secondary mt-1">{app.department} Department</p>
                  
                  <div className="flex items-center space-x-4 mt-3 text-xs text-brand-cyan font-semibold">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{app.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{app.timeSlot}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 border-t border-white/5 pt-3">
                  {app.type === 'Virtual' ? (
                    <Button
                      onClick={() => toast.success('Joining encrypted telemedicine consultation room...')}
                      className="py-1 px-3 text-[10px] bg-brand-purple border-brand-purple hover:bg-brand-purple/80"
                    >
                      <Video className="w-3.5 h-3.5 mr-1" />
                      <span>Join Room</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => toast.success(`Location map: Floor ${app.doctorId === 'D01' ? '3' : '2'} Cardiology Room.`)}
                      variant="outline"
                      className="py-1 px-3 text-[10px]"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      <span>Directions</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="danger"
                    onClick={() => handleCancelAppointment(app.appointmentId)}
                    className="py-1 px-3 text-[10px]"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Cancel</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past History Table */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Consultation History</h3>
        <Table>
          <Thead>
            <Tr>
              <Th>Appt ID</Th>
              <Th>Doctor</Th>
              <Th>Date & Time</Th>
              <Th>Dept</Th>
              <Th>Format</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {past.map((app) => (
              <Tr key={app.appointmentId}>
                <Td className="font-mono text-xs font-bold text-white">{app.appointmentId}</Td>
                <Td className="font-bold text-white text-xs">{app.doctorName}</Td>
                <Td className="text-xs font-mono">
                  {app.date} • {app.timeSlot}
                </Td>
                <Td className="text-xs">{app.department}</Td>
                <Td>
                  <Badge variant={app.type === 'In-Person' ? 'cyan' : 'purple'}>
                    {app.type}
                  </Badge>
                </Td>
                <Td className="text-xs text-text-secondary max-w-[200px] truncate" title={app.reason}>
                  {app.reason}
                </Td>
                <Td>
                  <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

    </div>
  );
};

export default MyAppointments;

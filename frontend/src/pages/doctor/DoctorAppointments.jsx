/**
 * Page Name: DoctorAppointments
 * Props: None
 * Description: Renders scheduled clinic appointments assigned to Dr. Priya Sharma.
 * Used on: App.jsx (guarded route /doctor/appointments)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Search, Clock, ShieldAlert } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockAppointments } from '../../data/mockAppointments';

export const DoctorAppointments = () => {
  useRoleGuard(['doctor']);
  const { currentUser } = useAuth();
  
  // Filter appointments for active doctor
  const [appointments, setAppointments] = useState(() =>
    mockAppointments.filter(app => app.doctorId === 'D01')
  );

  const handleToggleStatus = (id) => {
    setAppointments(prev =>
      prev.map(app => {
        if (app.appointmentId === id) {
          const nextStatus = app.status === 'Scheduled' ? 'Completed' : 'Scheduled';
          toast.success(`Appointment status updated to ${nextStatus}`);
          return { ...app, status: nextStatus };
        }
        return app;
      })
    );
  };

  const getStatusVariant = (status) => {
    if (status === 'Completed') return 'success';
    if (status === 'Scheduled') return 'cyan';
    return 'danger';
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Doctor Consultation Schedule</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Review schedules, start tele-consultations, and update intake statuses</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>Appt ID</Th>
              <Th>Patient Name</Th>
              <Th>Date & Time Slot</Th>
              <Th>Clinical Dept</Th>
              <Th>Format</Th>
              <Th>Reason for Consultation</Th>
              <Th>Status</Th>
              <Th className="text-center">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {appointments.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-10 text-text-secondary/50 text-xs">
                  No appointments found for Dr. Priya Sharma.
                </Td>
              </Tr>
            ) : (
              appointments.map((app) => (
                <Tr key={app.appointmentId}>
                  <Td className="font-mono text-xs font-bold text-white">{app.appointmentId}</Td>
                  <Td className="font-bold text-white text-xs">{app.patientName}</Td>
                  <Td className="text-xs">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-white font-mono">{app.date}</span>
                      <span className="text-[10px] text-text-secondary/70">{app.timeSlot}</span>
                    </div>
                  </Td>
                  <Td className="text-xs">{app.department}</Td>
                  <Td>
                    <Badge variant={app.type === 'In-Person' ? 'cyan' : 'purple'}>
                      {app.type}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-white max-w-[200px] truncate" title={app.reason}>
                    {app.reason}
                  </Td>
                  <Td>
                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        className="py-1 px-2.5 text-[9px]"
                        onClick={() => toast.success(`Starting patient chart audit for ${app.patientName}`)}
                      >
                        Chart File
                      </Button>
                      
                      {app.status !== 'Cancelled' && (
                        <Button
                          variant={app.status === 'Scheduled' ? 'success' : 'outline'}
                          className="py-1 px-2.5 text-[9px]"
                          onClick={() => handleToggleStatus(app.appointmentId)}
                        >
                          {app.status === 'Scheduled' ? 'Complete' : 'Reopen'}
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>

    </div>
  );
};

export default DoctorAppointments;

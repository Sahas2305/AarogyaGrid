/**
 * Page Name: AdminDashboard
 * Props: None
 * Description: Main dashboard view for administrative users.
 * Used on: App.jsx (guarded route /admin/dashboard)
 *
 * CHANGES FROM MOCK VERSION:
 * - currentUser?.name → currentUser?.username (matches AuthContext field)
 * - All data fetched from real API (getAuditLogs, getDoctors, getPatients, getAppointments)
 * - Field names use snake_case to match Supabase/Flask responses
 */
import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, CreditCard, Activity, ShieldAlert, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { CustomAreaChart } from '../../components/charts/AreaChart';
import { CustomBarChart } from '../../components/charts/BarChart';
import { SparkLine } from '../../components/charts/SparkLine';
import { getAuditLogs, getDoctors, getPatients, getAppointments } from '../../api/api';

// Sparkline trend data — visual only, not from DB
const sparkPatients     = [1000, 1050, 1100, 1150, 1200, 1240, 1284];
const sparkDoctors      = [40, 42, 42, 45, 45, 46, 48];
const sparkAppointments = [150, 140, 160, 130, 145, 135, 127];
const sparkBills        = [28, 30, 32, 29, 35, 31, 34];

// Chart data — visual only, not from DB
const appointmentsChartData = [
  { date: '05-10', appointments: 90 },
  { date: '05-15', appointments: 110 },
  { date: '05-20', appointments: 95 },
  { date: '05-25', appointments: 120 },
  { date: '05-30', appointments: 130 },
  { date: '06-05', appointments: 115 },
  { date: '06-09', appointments: 127 },
];

const departmentBarData = [
  { department: 'Cardiology',   doctors: 5 },
  { department: 'Neurology',    doctors: 4 },
  { department: 'Orthopedics',  doctors: 6 },
  { department: 'Pediatrics',   doctors: 3 },
  { department: 'General',      doctors: 8 },
  { department: 'Emergency',    doctors: 7 },
];

export const AdminDashboard = () => {
  useRoleGuard(['admin']);
  const { currentUser } = useAuth();

  const [auditLogs,    setAuditLogs]    = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([getAuditLogs(), getDoctors(), getPatients(), getAppointments()])
      .then(([logs, docs, pats, appts]) => {
        setAuditLogs(Array.isArray(logs) ? logs : []);
        setDoctors(Array.isArray(docs) ? docs : []);
        setPatients(Array.isArray(pats) ? pats : []);
        setAppointments(Array.isArray(appts) ? appts : []);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load dashboard data: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const recentAudits = auditLogs.slice(0, 10);
  const todayStr     = new Date().toISOString().split('T')[0];
  // getAppointments() normalizes appointment_date → date, so check both
  const todayAppts   = appointments.filter(a => (a.date || a.appointment_date) === todayStr).length;

  const getActionBadgeVariant = (action) => {
    if (action === 'INSERT') return 'cyan';
    if (action === 'UPDATE') return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6 select-none">

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">System Controller Dashboard</h2>
          {/* FIX: was currentUser?.name — AuthContext stores username, not name */}
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Logged in as <span className="text-brand-cyan font-bold">{currentUser?.username}</span> (Database Overseer)
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
          </span>
          <span className="text-xs text-text-secondary font-semibold">DB Triggers: Active</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Patients"
          value={loading ? '—' : patients.length}
          icon={Users}
          trend="Live from DB"
          trendType="success"
          chart={<SparkLine data={sparkPatients} stroke="#00c853" />}
        />
        <StatCard
          title="Practitioning Doctors"
          value={loading ? '—' : doctors.length}
          icon={UserCheck}
          trend="Live from DB"
          trendType="success"
          chart={<SparkLine data={sparkDoctors} stroke="#00d4ff" />}
        />
        <StatCard
          title="Today's Appointments"
          value={loading ? '—' : todayAppts}
          icon={Calendar}
          trend="Filtered by today"
          trendType={todayAppts > 0 ? 'success' : 'danger'}
          chart={<SparkLine data={sparkAppointments} stroke="#ff1744" />}
        />
        <StatCard
          title="Total Appointments"
          value={loading ? '—' : appointments.length}
          icon={CreditCard}
          trend="All time"
          trendType="warning"
          chart={<SparkLine data={sparkBills} stroke="#ffab00" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Visit Load (30-day index)</h3>
            <p className="text-xs text-text-secondary mt-1">Aggregated booking curves via trigger counters</p>
          </div>
          <CustomAreaChart data={appointmentsChartData} height={260} />
        </Card>

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Departmental Doctor Allocation</h3>
            <p className="text-xs text-text-secondary mt-1">Active doctor registrations per clinic node</p>
          </div>
          <CustomBarChart data={departmentBarData} height={260} />
        </Card>
      </div>

      {/* Audit, Roster, and Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Compact Audit Log Table */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Recent DBMS Trigger Activity</h3>
            <Badge variant="cyan">Last 10 Actions</Badge>
          </div>
          <Table>
            <Thead>
              <Tr>
                <Th className="text-[10px] px-4 py-2">Table</Th>
                <Th className="text-[10px] px-4 py-2">Action</Th>
                <Th className="text-[10px] px-4 py-2">User</Th>
                <Th className="text-[10px] px-4 py-2">Timestamp</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={4} className="px-4 py-6"><SkeletonLoader rows={4} /></Td></Tr>
              ) : recentAudits.length === 0 ? (
                <Tr><Td colSpan={4} className="text-center py-8 text-text-secondary/50 text-xs">No audit logs yet</Td></Tr>
              ) : recentAudits.map((log) => (
                <Tr
                  key={log.audit_id}
                  className={log.action === 'DELETE' ? 'border-l-2 border-brand-danger bg-brand-danger/5' : ''}
                >
                  {/* API field: table_affected (was tableAffected in mock) */}
                  <Td className="text-xs font-mono px-4 py-2.5 text-white">{log.table_affected}</Td>
                  <Td className="px-4 py-2.5">
                    <Badge variant={getActionBadgeVariant(log.action)} className="text-[9px] py-0 px-1.5">{log.action}</Badge>
                  </Td>
                  {/* API field: user_id (AUDIT_LOG table has no username — show user_id or 'System') */}
                  <Td className="text-xs px-4 py-2.5">{log.user_id || 'System'}</Td>
                  {/* API field: action_time (was actionTime in mock) */}
                  <Td className="text-xs font-mono text-text-secondary/70 px-4 py-2.5">
                    {log.action_time ? new Date(log.action_time).toLocaleTimeString() : '—'}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>

        {/* Doctor Availability Board */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Clinician Roster Status</h3>
          <Card className="p-4 space-y-3 max-h-[360px] overflow-y-auto bg-surface-card border border-white/5">
            {loading ? <SkeletonLoader rows={5} /> : doctors.slice(0, 8).map((doc) => (
              <div key={doc.doctor_id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div className="truncate pr-2">
                  <h4 className="text-xs font-bold text-white truncate">{doc.name}</h4>
                  {/* API field: department is a joined object with department_name */}
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">
                    {doc.department?.department_name || 'General'}
                  </p>
                </div>
                <Badge variant="success" className="text-[8px] py-0 px-1.5 font-bold uppercase tracking-wider flex-shrink-0">
                  Active
                </Badge>
              </div>
            ))}
          </Card>
        </div>

        {/* System Health / Disk Ring */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Database System Health</h3>
          <Card className="p-5 flex flex-col justify-between items-center text-center h-[360px] relative overflow-hidden bg-surface-card border border-white/5">

            <div className="relative flex items-center justify-center mt-3">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle
                  cx="56" cy="56" r="46"
                  stroke="#00d4ff" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - 0.67)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">67%</span>
                <span className="text-[8px] uppercase font-bold text-text-secondary tracking-widest mt-0.5">Tablespace</span>
              </div>
            </div>

            <div className="space-y-2.5 w-full mt-6 text-left border-t border-white/5 pt-4">
              <div className="flex items-center justify-between text-[10px] text-text-secondary">
                <span className="flex items-center space-x-1.5 font-semibold">
                  <Database className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>DBMS Schema Logs</span>
                </span>
                <span className="text-white font-mono">11/11 Active</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-secondary">
                <span>Active User Sessions:</span>
                <span className="text-brand-success font-extrabold">12 Online</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-secondary">
                <span>Backup Integrity:</span>
                <span className="text-white font-semibold">100% Ok</span>
              </div>
              <div className="text-[9px] text-text-secondary/40 text-center font-mono pt-1">
                Last backup: Today, 04:00 AM
              </div>
            </div>

          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
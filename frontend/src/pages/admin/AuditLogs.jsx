/**
 * Page Name: AuditLogs
 * Props: None
 * Description: Lists DB trigger audit events (INSERT, UPDATE, DELETE) across all 11 schema tables.
 * Used on: App.jsx (guarded route /admin/audit)
 *
 * CHANGES FROM MOCK VERSION:
 * - Removed: import { mockAuditLogs } from '../../data/mockAuditLogs'
 * - Added:   import { getAuditLogs } from '../../api/api'
 * - Added:   useEffect to fetch real audit logs on mount
 * - Added:   loading state with SkeletonLoader
 * - All field names updated from camelCase (mock) to snake_case (API):
 *     log.auditId       → log.audit_id
 *     log.userName      → log.user_id  (AUDIT_LOG has no username; show user_id)
 *     log.tableAffected → log.table_affected
 *     log.recordId      → log.record_id
 *     log.actionTime    → log.action_time
 *     log.ipAddress     → log.ip_address
 *     log.details       → log.details  (unchanged)
 *     log.action        → log.action   (unchanged)
 *     log.role          → log.role     (only present if Flask joins USERS table)
 * - Search now filters on user_id, record_id, and ip_address
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Download, FileSpreadsheet, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { getAuditLogs } from '../../api/api';

export const AuditLogs = () => {
  useRoleGuard(['admin']);

  const [audits,      setAudits]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  // Filter state
  const [startDate,      setStartDate]      = useState('');
  const [endDate,        setEndDate]         = useState('');
  const [actionType,     setActionType]      = useState('ALL');
  const [tableFilter,    setTableFilter]     = useState('ALL');
  const [operatorSearch, setOperatorSearch]  = useState('');
  const [currentPage,    setCurrentPage]     = useState(1);

  // All 11 schema tables in the system
  const tableOptions = [
    'PATIENT', 'DOCTOR', 'APPOINTMENT', 'MEDICAL_RECORD', 'BILLING',
    'LAB_TEST', 'SYMPTOM_LOG', 'AI_DIAGNOSIS', 'DEPARTMENT', 'USERS', 'AUDIT_LOG',
  ];

  // Fetch real audit logs from Flask /api/audit-logs
  useEffect(() => {
    getAuditLogs()
      .then(data => setAudits(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleRow = (id) => setExpandedRow(prev => (prev === id ? null : id));

  const handleExport = (format) => {
    toast.loading(`Compiling export dataset as ${format}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Success: DB Audit Logs exported in ${format} format!`);
    }, 1500);
  };

  // Filter — uses snake_case API fields
  const filteredAudits = audits.filter(log => {
    // Search across user_id, record_id, and ip_address
    const searchVal = operatorSearch.toLowerCase();
    const matchesSearch =
      String(log.user_id || '').toLowerCase().includes(searchVal) ||
      String(log.record_id || '').toLowerCase().includes(searchVal) ||
      (log.ip_address || '').includes(operatorSearch);

    const matchesAction = actionType === 'ALL' || log.action === actionType;
    const matchesTable  = tableFilter === 'ALL' || log.table_affected === tableFilter;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(log.action_time) >= new Date(startDate);
    }
    if (endDate) {
      const endLimit = new Date(endDate);
      endLimit.setHours(23, 59, 59);
      matchesDate = matchesDate && new Date(log.action_time) <= endLimit;
    }

    return matchesSearch && matchesAction && matchesTable && matchesDate;
  });

  const itemsPerPage    = 10;
  const totalPages      = Math.ceil(filteredAudits.length / itemsPerPage);
  const paginatedAudits = filteredAudits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getActionBadgeVariant = (action) => {
    if (action === 'INSERT') return 'cyan';
    if (action === 'UPDATE') return 'warning';
    return 'danger';
  };

  const getRoleBadgeVariant = (role) => {
    if (role === 'admin')   return 'danger';
    if (role === 'doctor')  return 'cyan';
    if (role === 'patient') return 'success';
    return 'purple';
  };

  return (
    <div className="space-y-6 select-none">

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-danger/10 border border-brand-danger/25 rounded-xl text-brand-danger">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Database Transaction Auditing</h2>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Real-time system trigger outputs tracking DML operations
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs font-semibold text-brand-success">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <span>DB Triggers: Active</span>
          </div>

          <Button
            variant="secondary"
            onClick={() => handleExport('CSV')}
            className="flex items-center space-x-1.5 text-xs py-2 px-3.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleExport('PDF')}
            className="flex items-center space-x-1.5 text-xs py-2 px-3.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-surface-card border border-white/5">

        <div className="space-y-1">
          <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Start Date</label>
          <div className="flex items-center bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-secondary mr-2" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-white outline-none border-none focus:ring-0 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">End Date</label>
          <div className="flex items-center bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-secondary mr-2" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-white outline-none border-none focus:ring-0 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Action Type</label>
          <select
            value={actionType}
            onChange={(e) => { setActionType(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
          >
            <option value="ALL">ALL OPERATIONS</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Table Affected</label>
          <select
            value={tableFilter}
            onChange={(e) => { setTableFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40 cursor-pointer"
          >
            <option value="ALL">ALL TABLES (11)</option>
            {tableOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Search Key</label>
          <div className="flex items-center bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search user ID, record ID, IP..."
              value={operatorSearch}
              onChange={(e) => { setOperatorSearch(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-white outline-none border-none focus:ring-0 w-full"
            />
          </div>
        </div>

      </Card>

      {/* Audit Table */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th className="w-12"></Th>
              <Th>Audit ID</Th>
              <Th>User ID</Th>
              <Th>Role</Th>
              <Th>Action</Th>
              <Th>Table Affected</Th>
              <Th>Record ID</Th>
              <Th>Execution Time</Th>
              <Th>IP Address</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={9} className="px-4 py-6"><SkeletonLoader rows={6} /></Td></Tr>
            ) : paginatedAudits.length === 0 ? (
              <Tr>
                <Td colSpan={9} className="text-center py-10 text-text-secondary/50 text-xs">
                  No database trigger audit entries matching active filters.
                </Td>
              </Tr>
            ) : (
              paginatedAudits.map((log) => {
                // API field: audit_id (was auditId in mock)
                const isExpanded = expandedRow === log.audit_id;
                const isDelete   = log.action === 'DELETE';

                return (
                  <React.Fragment key={log.audit_id}>
                    <Tr
                      className={`
                        ${isDelete   ? 'border-l-4 border-brand-danger bg-brand-danger/5 hover:bg-brand-danger/10' : ''}
                        ${isExpanded ? 'bg-white/[0.02]' : ''}
                      `}
                    >
                      <Td className="px-4 text-center">
                        <button
                          onClick={() => toggleRow(log.audit_id)}
                          className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors focus:outline-none"
                        >
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-brand-cyan" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </Td>
                      {/* API field: audit_id */}
                      <Td className="font-mono text-xs font-bold text-white">{log.audit_id}</Td>
                      {/* API field: user_id (AUDIT_LOG has no stored username) */}
                      <Td className="text-xs font-semibold text-white">{log.user_id || 'System'}</Td>
                      {/* API field: role — only present if Flask joins USERS table; falls back to '—' */}
                      <Td>
                        {log.role
                          ? <Badge variant={getRoleBadgeVariant(log.role)} className="text-[9px] font-bold uppercase py-0 px-1.5">{log.role}</Badge>
                          : <span className="text-text-secondary/40 text-xs">—</span>
                        }
                      </Td>
                      {/* API field: action */}
                      <Td>
                        <Badge variant={getActionBadgeVariant(log.action)} className="text-[9px] font-extrabold py-0 px-2">
                          {log.action}
                        </Badge>
                      </Td>
                      {/* API field: table_affected (was tableAffected in mock) */}
                      <Td className="font-mono text-xs text-white">{log.table_affected}</Td>
                      {/* API field: record_id (was recordId in mock) */}
                      <Td className="font-mono text-xs">{log.record_id || '—'}</Td>
                      {/* API field: action_time (was actionTime in mock) */}
                      <Td className="font-mono text-xs text-text-secondary/70">
                        {log.action_time
                          ? new Date(log.action_time).toLocaleString()
                          : '—'}
                      </Td>
                      {/* API field: ip_address (was ipAddress in mock) */}
                      <Td className="font-mono text-xs text-text-secondary/70">{log.ip_address || '—'}</Td>
                    </Tr>

                    {/* Expanded JSON details row */}
                    {isExpanded && (
                      <Tr className="bg-black/35 hover:bg-black/35">
                        <Td colSpan={9} className="px-8 py-4">
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-cyan">
                              Trigger DML JSON Payload
                            </span>
                            <pre className="text-xs font-mono bg-[#070f1a] text-brand-success border border-white/5 rounded-lg p-3.5 overflow-x-auto leading-relaxed shadow-inner">
                              {/* API field: details */}
                              <code>
                                {typeof log.details === 'object'
                                  ? JSON.stringify(log.details, null, 2)
                                  : log.details || 'No payload captured.'}
                              </code>
                            </pre>
                          </div>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </Tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-text-secondary">
            <span>
              Showing Page <span className="text-white font-bold">{currentPage}</span> of{' '}
              <span className="text-white font-bold">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                variant="outline"
                className="py-1 px-2.5"
              >
                Prev
              </Button>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                variant="outline"
                className="py-1 px-2.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditLogs;
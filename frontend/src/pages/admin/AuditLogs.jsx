/**
 * Page Name: AuditLogs
 * Props: None
 * Description: Lists DB triggers auditing events (INSERT, UPDATE, DELETE) across all 11 schema tables.
 * Used on: App.jsx (guarded route /admin/audit)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Download, FileSpreadsheet, Play, StopCircle, RefreshCw, ChevronDown, ChevronUp, Search, Calendar, Filter } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockAuditLogs as defaultAudits } from '../../data/mockAuditLogs';

export const AuditLogs = () => {
  useRoleGuard(['admin']);

  const [audits, setAudits] = useState(defaultAudits);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionType, setActionType] = useState('ALL');
  const [tableFilter, setTableFilter] = useState('ALL');
  const [operatorSearch, setOperatorSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Schema Table options
  const tableOptions = [
    'PATIENT', 'DOCTOR', 'APPOINTMENT', 'MEDICAL_RECORD', 'BILLING', 
    'LAB_REPORT', 'BED', 'DEPARTMENT', 'USER', 'STAFF', 'AUDIT_LOG'
  ];

  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  const handleExport = (format) => {
    toast.loading(`Compiling export dataset as ${format}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Success: DB Audit Logs exported in ${format} format!`);
    }, 1500);
  };

  // Filter application
  const filteredAudits = audits.filter(log => {
    const matchesOperator = log.userName.toLowerCase().includes(operatorSearch.toLowerCase()) ||
                            log.recordId.toLowerCase().includes(operatorSearch.toLowerCase()) ||
                            log.ipAddress.includes(operatorSearch);
    
    const matchesAction = actionType === 'ALL' || log.action === actionType;
    const matchesTable = tableFilter === 'ALL' || log.tableAffected === tableFilter;
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(log.actionTime) >= new Date(startDate);
    }
    if (endDate) {
      // Add a full day to end date to encompass that day
      const endLimit = new Date(endDate);
      endLimit.setHours(23, 59, 59);
      matchesDate = matchesDate && new Date(log.actionTime) <= endLimit;
    }

    return matchesOperator && matchesAction && matchesTable && matchesDate;
  });

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
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
    if (role === 'admin') return 'danger';
    if (role === 'doctor') return 'cyan';
    if (role === 'patient') return 'success';
    return 'purple'; // system
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
            <p className="text-xs md:text-sm text-text-secondary mt-1">Real-time system trigger outputs tracking DML operations</p>
          </div>
        </div>
        
        {/* Export Buttons and Pulse Indicator */}
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
              placeholder="Search user, record ID, IP..."
              value={operatorSearch}
              onChange={(e) => { setOperatorSearch(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-white outline-none border-none focus:ring-0 w-full"
            />
          </div>
        </div>

      </Card>

      {/* Main Audits Grid */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th className="w-12"></Th>
              <Th>Audit ID</Th>
              <Th>Operator Name</Th>
              <Th>Role</Th>
              <Th>Action</Th>
              <Th>Table Affected</Th>
              <Th>Record Key ID</Th>
              <Th>Execution Time</Th>
              <Th>IP Address</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedAudits.length === 0 ? (
              <Tr>
                <Td colSpan={9} className="text-center py-10 text-text-secondary/50 text-xs">
                  No database trigger audit entries matching active filters.
                </Td>
              </Tr>
            ) : (
              paginatedAudits.map((log) => {
                const isExpanded = expandedRow === log.auditId;
                const isDelete = log.action === 'DELETE';
                
                return (
                  <React.Fragment key={log.auditId}>
                    {/* Main Row */}
                    <Tr
                      className={`
                        ${isDelete ? 'border-l-4 border-brand-danger bg-brand-danger/5 hover:bg-brand-danger/10' : ''}
                        ${isExpanded ? 'bg-white/[0.02]' : ''}
                      `}
                    >
                      <Td className="px-4 text-center">
                        <button
                          onClick={() => toggleRow(log.auditId)}
                          className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors focus:outline-none"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-brand-cyan" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </Td>
                      <Td className="font-mono text-xs font-bold text-white">{log.auditId}</Td>
                      <Td className="text-xs font-semibold text-white">{log.userName}</Td>
                      <Td>
                        <Badge variant={getRoleBadgeVariant(log.role)} className="text-[9px] font-bold uppercase py-0 px-1.5">{log.role}</Badge>
                      </Td>
                      <Td>
                        <Badge variant={getActionBadgeVariant(log.action)} className="text-[9px] font-extrabold py-0 px-2">{log.action}</Badge>
                      </Td>
                      <Td className="font-mono text-xs text-white">{log.tableAffected}</Td>
                      <Td className="font-mono text-xs">{log.recordId}</Td>
                      <Td className="font-mono text-xs text-text-secondary/70">{log.actionTime}</Td>
                      <Td className="font-mono text-xs text-text-secondary/70">{log.ipAddress}</Td>
                    </Tr>
                    
                    {/* Collapsed Monospace Details Row */}
                    {isExpanded && (
                      <Tr className="bg-black/35 hover:bg-black/35">
                        <Td colSpan={9} className="px-8 py-4">
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-cyan">Trigger DML JSON Payload</span>
                            <pre className="text-xs font-mono bg-[#070f1a] text-brand-success border border-white/5 rounded-lg p-3.5 overflow-x-auto leading-relaxed shadow-inner">
                              <code>{log.details}</code>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-text-secondary">
            <span>
              Showing Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
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

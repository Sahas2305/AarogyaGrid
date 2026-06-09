/**
 * Page Name: BillingPage
 * Props: None
 * Description: Renders the billing transactions ledger, filtering views based on user roles.
 * Used on: App.jsx (guarded route /billing)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, ShieldAlert, Award, Check, Search, Filter, Eye } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { CustomLineChart } from '../../components/charts/LineChart';
import { mockBilling as defaultBilling } from '../../data/mockBilling';

// 12-Month revenue data series
const revenueData = [
  { month: 'Jul', revenue: 320000 },
  { month: 'Aug', revenue: 340000 },
  { month: 'Sep', revenue: 310000 },
  { month: 'Oct', revenue: 380000 },
  { month: 'Nov', revenue: 420000 },
  { month: 'Dec', revenue: 400000 },
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 460000 },
  { month: 'Mar', revenue: 440000 },
  { month: 'Apr', revenue: 480000 },
  { month: 'May', revenue: 490000 },
  { month: 'Jun', revenue: 482000 }
];

export const BillingPage = () => {
  useRoleGuard(['admin', 'doctor', 'patient']);
  const { currentUser } = useAuth();
  const isAdminOrDoctor = currentUser?.role === 'admin' || currentUser?.role === 'doctor';

  const [billingList, setBillingList] = useState(defaultBilling);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Role-based filtering
  const filteredBilling = billingList.filter(bill => {
    // If patient, only view P01 records
    const matchesRole = isAdminOrDoctor || bill.patientId === 'P01';
    
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bill.billId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
    
    return matchesRole && matchesSearch && matchesStatus;
  });

  const handleOpenInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceOpen(true);
  };

  const handlePayInvoice = (id) => {
    toast.loading('Processing credit payment via UPI...');
    setTimeout(() => {
      toast.dismiss();
      setBillingList(prev =>
        prev.map(b => (b.billId === id ? { ...b, status: 'Paid', paidAmount: b.totalAmount - b.insuranceClaimed } : b))
      );
      toast.success('Payment completed successfully!');
      setInvoiceOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/35 rounded-xl text-brand-cyan">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Central Billing Desk</h2>
          <p className="text-xs text-text-secondary mt-1">Audit transactions, file insurance claims, and review invoices</p>
        </div>
      </div>

      {/* Admin metrics dashboard view */}
      {isAdminOrDoctor && (
        <React.Fragment>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Revenue Gross" value="₹4,82,000" icon={CreditCard} trend="+12% vs last month" trendType="success" />
            <StatCard title="Outstanding Copay Balances" value="₹68,400" icon={ShieldAlert} trend="Risk level: Normal" trendType="success" />
            <StatCard title="Insurance Claims Filed" value={23} icon={Award} trend="+8 claims today" trendType="success" />
            <StatCard title="Transacted Revenue Today" value="₹12,800" icon={Check} trend="Sync status: Ok" trendType="success" />
          </div>

          {/* Revenue Line Chart */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gross Transaction Earnings (12-Month Index)</h3>
              <p className="text-xs text-text-secondary mt-1">Monthly aggregate transacted values in INR</p>
            </div>
            <CustomLineChart data={revenueData} dataKey="revenue" xKey="month" height={240} />
          </Card>
        </React.Fragment>
      )}

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {isAdminOrDoctor && (
          <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search by ID or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
            />
          </div>
        )}

        <div className="flex items-center space-x-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs text-text-secondary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-white border-0 outline-none focus:ring-0 cursor-pointer"
          >
            <option value="All">All Invoices</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Main Billing Table */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>Bill ID</Th>
              <Th>Patient Name</Th>
              <Th>Billing Date</Th>
              <Th>Total Charges</Th>
              <Th>Insurance Copay</Th>
              <Th>Patient Due</Th>
              <Th>Status</Th>
              <Th className="text-center">Receipt</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredBilling.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-10 text-text-secondary/50 text-xs">
                  No billing transactions logged.
                </Td>
              </Tr>
            ) : (
              filteredBilling.map((bill) => (
                <Tr key={bill.billId}>
                  <Td className="font-mono text-xs font-bold text-white">{bill.billId}</Td>
                  <Td className="font-bold text-white text-xs">{bill.patientName}</Td>
                  <Td className="text-xs font-mono">{bill.date}</Td>
                  <Td className="text-xs text-white font-mono">₹{bill.totalAmount.toLocaleString('en-IN')}</Td>
                  <Td className="text-xs text-text-secondary font-mono">₹{bill.insuranceClaimed.toLocaleString('en-IN')}</Td>
                  <Td className="text-xs text-brand-cyan font-bold font-mono">₹{bill.paidAmount.toLocaleString('en-IN')}</Td>
                  <Td>
                    <Badge variant={bill.status === 'Paid' ? 'success' : 'danger'}>{bill.status}</Badge>
                  </Td>
                  <Td className="text-center">
                    <Button
                      variant="outline"
                      className="py-1 px-3 text-[10px]"
                      onClick={() => handleOpenInvoice(bill)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>View Receipt</span>
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>

      {/* Reused Invoice Watermark Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={invoiceOpen}
          onClose={() => setInvoiceOpen(false)}
          title={`Hospital Receipt: ${selectedInvoice.billId}`}
          size="md"
        >
          <div className="relative p-2 text-left overflow-hidden min-h-[380px]">
            {/* Stamp watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08] z-0">
              <span
                className={`
                  text-7xl font-black tracking-widest border-8 px-6 py-3 rounded-2xl transform rotate-[15deg] uppercase
                  ${selectedInvoice.status === 'Paid' ? 'text-brand-success border-brand-success' : 'text-brand-danger border-brand-danger'}
                `}
              >
                {selectedInvoice.status}
              </span>
            </div>

            {/* Header info */}
            <div className="border-b border-white/5 pb-4 mb-4 z-10 relative">
              <h3 className="text-base font-black text-white">Dayananda Sagar Hospital</h3>
              <p className="text-[10px] text-text-secondary">Kumaraswamy Layout, Bangalore - 560078</p>
              <div className="flex items-center justify-between mt-4 text-[10px] text-text-secondary">
                <div>
                  <p>Invoiced To: <span className="text-white font-bold">{selectedInvoice.patientName}</span></p>
                  <p>Patient ID: <span className="text-white font-mono">{selectedInvoice.patientId}</span></p>
                </div>
                <div className="text-right">
                  <p>Date: <span className="text-white font-mono">{selectedInvoice.date}</span></p>
                  <p>Status: <span className={selectedInvoice.status === 'Paid' ? 'text-brand-success font-extrabold' : 'text-brand-danger font-extrabold'}>{selectedInvoice.status}</span></p>
                </div>
              </div>
            </div>

            {/* Itemized list */}
            <div className="z-10 relative space-y-3">
              <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest">Itemized Charges</span>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-text-secondary text-[10px] font-bold">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-text-secondary hover:text-white transition-colors">{item.description}</td>
                      <td className="py-2 text-right font-mono">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">₹{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-white/5 pt-4 mt-6 z-10 relative text-xs space-y-1.5 w-60 ml-auto">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal Charges:</span>
                <span className="font-mono text-white">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Insurance Coverage:</span>
                <span className="font-mono text-brand-success">- ₹{selectedInvoice.insuranceClaimed.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/5">
                <span>Patient Balance Due:</span>
                <span className="font-mono text-brand-cyan">₹{selectedInvoice.paidAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex justify-end space-x-2 z-10 relative border-t border-white/5 pt-4">
              <Button variant="outline" className="text-xs" onClick={() => setInvoiceOpen(false)}>
                Close Invoice
              </Button>
              {selectedInvoice.status === 'Pending' && !isAdminOrDoctor && (
                <Button
                  className="text-xs font-bold"
                  onClick={() => handlePayInvoice(selectedInvoice.billId)}
                >
                  Pay Balance (INR)
                </Button>
              )}
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default BillingPage;

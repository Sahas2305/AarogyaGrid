/**
 * Page Name: MyBills
 * Props: None
 * Description: Renders the active patient's invoices and billing dashboard.
 * Used on: App.jsx (guarded route /patient/bills)
 *
 * CHANGES: Replaced mock data with real API call via getBilling().
 * Field mapping: billing_id, payment_date, amount, payment_method, payment_date
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Eye } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useHospital } from '../../context/HospitalContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { getBilling } from '../../api/api';

export const MyBills = () => {
  useRoleGuard(['patient']);
  const { selectedHospital } = useHospital();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    getBilling()
      .then(data => setBills(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load billing records.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handlePayBill = (id) => {
    toast.loading('Processing credit payment via UPI...');
    setTimeout(() => {
      toast.dismiss();
      setBills(prev =>
        prev.map(b => (b.billId === id ? { ...b, status: 'Paid', paidAmount: b.totalAmount - b.insuranceClaimed } : b))
      );
      toast.success('Payment completed successfully! Digital receipt generated.');
      setModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/15 border border-brand-cyan/30 rounded-xl text-brand-cyan">
          <CreditCard className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">My Hospital Invoices</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Check pending payments, co-pay balances, and review billing statements</p>
        </div>
      </div>

      {/* Bills table */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>Bill ID</Th>
              <Th>Billing Date</Th>
              <Th>Total Amount</Th>
              <Th>Payment Method</Th>
              <Th>Payment Date</Th>
              <Th>Status</Th>
              <Th className="text-center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={7} className="px-4 py-6"><SkeletonLoader rows={4} /></Td></Tr>
            ) : bills.length === 0 ? (
              <Tr><Td colSpan={7} className="text-center py-10 text-text-secondary/50 text-xs">No bills found.</Td></Tr>
            ) : bills.map((bill) => (
              <Tr key={bill.billing_id}>
                <Td className="font-mono text-xs font-bold text-white">#{bill.billing_id}</Td>
                <Td className="text-xs font-mono">{bill.appointment?.appointment_date || '—'}</Td>
                <Td className="text-xs text-white font-mono">₹{Number(bill.amount).toLocaleString('en-IN')}</Td>
                <Td className="text-xs text-text-secondary">{bill.payment_method || 'Unpaid'}</Td>
                <Td className="text-xs font-mono">{bill.payment_date || '—'}</Td>
                <Td>
                  <Badge variant={bill.payment_method ? 'success' : 'danger'}>
                    {bill.payment_method ? 'Paid' : 'Pending'}
                  </Badge>
                </Td>
                <Td className="text-center">
                  <Button
                    variant="outline"
                    className="py-1 px-3 text-[10px]"
                    onClick={() => handleOpenInvoice(bill)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span>View</span>
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Invoice Watermark Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Hospital Receipt: #${selectedInvoice.billing_id}`}
          size="md"
        >
          <div className="relative p-2 text-left overflow-hidden min-h-[300px]">
            {/* Watermark Stamp */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.08] z-0">
              <span className={`text-7xl font-black tracking-widest border-8 px-6 py-3 rounded-2xl transform rotate-[15deg] uppercase ${
                selectedInvoice.payment_method ? 'text-brand-success border-brand-success' : 'text-brand-danger border-brand-danger'
              }`}>
                {selectedInvoice.payment_method ? 'PAID' : 'PENDING'}
              </span>
            </div>

            <div className="border-b border-white/5 pb-4 mb-4 z-10 relative">
              <h3 className="text-base font-black text-white">{selectedHospital?.name || 'AarogyaGrid Hospital Facility'}</h3>
              <p className="text-[10px] text-text-secondary">{selectedHospital?.address || 'Hospital Facility'}</p>
              <div className="flex items-center justify-between mt-4 text-[10px] text-text-secondary">
                <div>
                  <p>Patient: <span className="text-white font-bold">{selectedInvoice.patient?.name || '—'}</span></p>
                  <p>Appointment: <span className="text-white font-mono">#{selectedInvoice.appointment_id}</span></p>
                </div>
                <div className="text-right">
                  <p>Amount: <span className="text-brand-cyan font-mono font-bold">₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span></p>
                  <p>Status: <span className={selectedInvoice.payment_method ? 'text-brand-success font-extrabold' : 'text-brand-danger font-extrabold'}>
                    {selectedInvoice.payment_method ? 'Paid' : 'Pending'}
                  </span></p>
                </div>
              </div>
            </div>

            <div className="z-10 relative space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span>Total Amount:</span>
                <span className="font-mono text-white font-bold">₹{Number(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span>Payment Method:</span>
                <span className="text-white">{selectedInvoice.payment_method || 'Not paid yet'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Payment Date:</span>
                <span className="font-mono text-white">{selectedInvoice.payment_date || '—'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-white/5 pt-4">
              <Button variant="outline" className="text-xs" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default MyBills;

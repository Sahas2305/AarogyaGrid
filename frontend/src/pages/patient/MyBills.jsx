/**
 * Page Name: MyBills
 * Props: None
 * Description: Renders the active patient's invoices and billing dashboard.
 * Used on: App.jsx (guarded route /patient/bills)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Eye, ShieldAlert, Check } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockBilling } from '../../data/mockBilling';

export const MyBills = () => {
  useRoleGuard(['patient']);

  const [bills, setBills] = useState(() =>
    mockBilling.filter(b => b.patientId === 'P01')
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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
              <Th>Total Gross Amount</Th>
              <Th>Insurance Covered</Th>
              <Th>Patient Copay Due</Th>
              <Th>Payment Status</Th>
              <Th className="text-center">Receipt Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bills.map((bill) => (
              <Tr key={bill.billId}>
                <Td className="font-mono text-xs font-bold text-white">{bill.billId}</Td>
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
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Invoice Watermark Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Hospital Receipt: ${selectedInvoice.billId}`}
          size="md"
        >
          <div className="relative p-2 text-left overflow-hidden min-h-[380px]">
            {/* Watermark Stamp */}
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

            {/* Calculation details */}
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

            {/* Actions Footer */}
            <div className="mt-8 flex justify-end space-x-2 z-10 relative border-t border-white/5 pt-4">
              <Button variant="outline" className="text-xs" onClick={() => setModalOpen(false)}>
                Close Invoice
              </Button>
              {selectedInvoice.status === 'Pending' && (
                <Button
                  className="text-xs font-bold"
                  onClick={() => handlePayBill(selectedInvoice.billId)}
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

export default MyBills;

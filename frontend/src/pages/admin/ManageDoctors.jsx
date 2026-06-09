/**
 * Page Name: ManageDoctors
 * Props: None
 * Description: Renders the listings of practitioners and handles doctor adding workflows.
 * Used on: App.jsx (guarded route /admin/doctors)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, HelpCircle, User, Award, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockDoctors as defaultDoctors } from '../../data/mockDoctors';

export const ManageDoctors = () => {
  useRoleGuard(['admin']);

  const [doctors, setDoctors] = useState(defaultDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form State
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docDepartment, setDocDepartment] = useState('Cardiology');
  const [docFloor, setDocFloor] = useState('1');
  const [docPhone, setDocPhone] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docTempPassword, setDocTempPassword] = useState('Welcome@123');

  // Search filter
  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateDoctor = (e) => {
    e.preventDefault();
    if (!docName || !docSpecialization || !docPhone || !docEmail) {
      toast.error('Please complete all form fields.');
      return;
    }

    const newDoctor = {
      doctorId: `D${doctors.length + 1 < 10 ? '0' + (doctors.length + 1) : doctors.length + 1}`,
      name: `Dr. ${docName}`,
      specialization: docSpecialization,
      department: docDepartment,
      floor: parseInt(docFloor),
      phone: docPhone,
      email: docEmail,
      status: 'Available'
    };

    setDoctors([newDoctor, ...doctors]);
    setDrawerOpen(false);
    toast.success(`${newDoctor.name} added to clinician index successfully!`);
    
    // Reset Form
    setDocName('');
    setDocSpecialization('');
    setDocDepartment('Cardiology');
    setDocFloor('1');
    setDocPhone('');
    setDocEmail('');
  };

  const toggleDoctorStatus = (id) => {
    setDoctors(prev =>
      prev.map(d => {
        if (d.doctorId === id) {
          const newStatus = d.status === 'Off Duty' ? 'Available' : 'Off Duty';
          toast.success(`${d.name} status updated to ${newStatus}`);
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
  };

  const getDocStatusVariant = (status) => {
    if (status === 'Available') return 'success';
    if (status === 'In Consultation') return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Manage Medical Clinicians</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Register, configure, and roster doctor credentials</p>
        </div>
        <Button
          onClick={() => setDrawerOpen(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-md">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input
          type="text"
          placeholder="Search by physician name, specialization, or department..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Main Table grid */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Specialization</Th>
              <Th>Department</Th>
              <Th>Floor</Th>
              <Th>Contact Info</Th>
              <Th>Status</Th>
              <Th className="text-center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedDoctors.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-10 text-text-secondary/50 text-xs">
                  No matching doctors found in DB.
                </Td>
              </Tr>
            ) : (
              paginatedDoctors.map((doc) => (
                <Tr key={doc.doctorId}>
                  <Td className="font-mono text-xs font-bold text-white">{doc.doctorId}</Td>
                  <Td className="font-bold text-white text-xs">{doc.name}</Td>
                  <Td className="text-xs">{doc.specialization}</Td>
                  <Td className="text-xs">{doc.department}</Td>
                  <Td className="font-mono text-xs text-center">{doc.floor}F</Td>
                  <Td className="text-xs">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-white font-mono">{doc.phone}</span>
                      <span className="text-[10px] text-text-secondary/70">{doc.email}</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={getDocStatusVariant(doc.status)}>{doc.status}</Badge>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        className="py-1 px-2.5 text-[10px]"
                        onClick={() => toast.success(`Configuration panels for ${doc.name} are loaded.`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={doc.status === 'Off Duty' ? 'success' : 'danger'}
                        className="py-1 px-2.5 text-[10px]"
                        onClick={() => toggleDoctorStatus(doc.doctorId)}
                      >
                        {doc.status === 'Off Duty' ? 'Activate' : 'Deactivate'}
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
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
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="py-1 px-2.5 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="py-1 px-2.5 flex items-center space-x-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Doctor Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Register Practitioner Account"
        size="md"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Physician Name (Excluding Dr.)</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Priya Sharma"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Clinical Specialization</label>
            <input
              type="text"
              value={docSpecialization}
              onChange={(e) => setDocSpecialization(e.target.value)}
              placeholder="Cardiologist / Neurosurgeon"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Hospital Department</label>
              <select
                value={docDepartment}
                onChange={(e) => setDocDepartment(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General">General Medicine</option>
                <option value="Emergency">Emergency Care</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Clinic Floor</label>
              <input
                type="number"
                min="1"
                max="6"
                value={docFloor}
                onChange={(e) => setDocFloor(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Mobile Number</label>
            <input
              type="text"
              value={docPhone}
              onChange={(e) => setDocPhone(e.target.value)}
              placeholder="+91 99450 98765"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Institution Email</label>
            <input
              type="email"
              value={docEmail}
              onChange={(e) => setDocEmail(e.target.value)}
              placeholder="priya.sharma@healthcareos.org"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Temporary Password</label>
            <input
              type="text"
              value={docTempPassword}
              onChange={(e) => setDocTempPassword(e.target.value)}
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          {/* Warning Card */}
          <div className="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-brand-warning mt-0.5 flex-shrink-0" />
            <span className="text-[10px] text-brand-warning leading-relaxed font-semibold">
              NOTE: Clinician must complete a profile verification and change temporary credentials during their first system session.
            </span>
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 text-xs py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-xs py-2.5"
            >
              Create Account
            </Button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default ManageDoctors;

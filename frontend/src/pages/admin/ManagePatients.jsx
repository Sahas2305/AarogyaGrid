/**
 * Page Name: ManagePatients
 * Props: None
 * Description: Renders the list of registered patients and provides registration inputs.
 * Used on: App.jsx (guarded route /admin/patients)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, HelpCircle, User, Award, ShieldAlert, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockPatients as defaultPatients } from '../../data/mockPatients';

export const ManagePatients = () => {
  useRoleGuard(['admin']);

  const [patients, setPatients] = useState(defaultPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form State
  const [patName, setPatName] = useState('');
  const [patDob, setPatDob] = useState('');
  const [patGender, setPatGender] = useState('Male');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patAddress, setPatAddress] = useState('');
  const [patInsurance, setPatInsurance] = useState('');

  // Filter criteria
  const filteredPatients = patients.filter(pat => {
    const matchesSearch = pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pat.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pat.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'All' || pat.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!patName || !patDob || !patPhone || !patEmail || !patAddress) {
      toast.error('Please complete all required fields.');
      return;
    }

    const newPatient = {
      patientId: `P${patients.length + 1 < 10 ? '0' + (patients.length + 1) : patients.length + 1}`,
      name: patName,
      dob: patDob,
      gender: patGender,
      phone: patPhone,
      email: patEmail,
      address: patAddress,
      insuranceDetails: patInsurance || 'None - Self Paying',
      registeredDate: new Date().toISOString().split('T')[0]
    };

    setPatients([newPatient, ...patients]);
    setDrawerOpen(false);
    toast.success(`Patient profile for ${newPatient.name} registered successfully!`);
    
    // Reset Form
    setPatName('');
    setPatDob('');
    setPatGender('Male');
    setPatPhone('');
    setPatEmail('');
    setPatAddress('');
    setPatInsurance('');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Manage Patient Index</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Register, browse, and edit patient clinical file summaries</p>
        </div>
        <Button
          onClick={() => setDrawerOpen(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
          <Search className="w-4 h-4 text-text-secondary mr-2" />
          <input
            type="text"
            placeholder="Search by ID, name, or phone number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center space-x-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs text-text-secondary">Gender:</span>
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-xs text-white border-0 outline-none focus:ring-0 cursor-pointer"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Main Table grid */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Patient Name</Th>
              <Th>Age/Gender</Th>
              <Th>Contact Information</Th>
              <Th>Registered Date</Th>
              <Th>Insurance Profile</Th>
              <Th className="text-center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedPatients.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-10 text-text-secondary/50 text-xs">
                  No registered patients found matching criteria.
                </Td>
              </Tr>
            ) : (
              paginatedPatients.map((pat) => {
                // Calculate approximate age
                const birthYear = new Date(pat.dob).getFullYear();
                const currentYear = new Date().getFullYear();
                const age = currentYear - birthYear;

                return (
                  <Tr key={pat.patientId}>
                    <Td className="font-mono text-xs font-bold text-white">{pat.patientId}</Td>
                    <Td className="font-bold text-white text-xs">{pat.name}</Td>
                    <Td className="text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-white font-mono">{age} yrs</span>
                        <span className="text-white/20">|</span>
                        <span className="text-text-secondary">{pat.gender}</span>
                      </div>
                    </Td>
                    <Td className="text-xs">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-white font-mono">{pat.phone}</span>
                        <span className="text-[10px] text-text-secondary/70">{pat.email}</span>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs">{pat.registeredDate}</Td>
                    <Td className="text-xs max-w-[180px] truncate text-white" title={pat.insuranceDetails}>
                      {pat.insuranceDetails}
                    </Td>
                    <Td className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          className="py-1 px-2.5 text-[10px]"
                          onClick={() => toast.success(`Viewing medical history details for ${pat.name}`)}
                        >
                          View File
                        </Button>
                        <Button
                          variant="outline"
                          className="py-1 px-2.5 text-[10px]"
                          onClick={() => toast.success(`Edit mode triggered for ${pat.name}`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </Td>
                  </Tr>
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

      {/* Add Patient Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Register Patient File"
        size="md"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Patient Full Name</label>
            <input
              type="text"
              value={patName}
              onChange={(e) => setPatName(e.target.value)}
              placeholder="Rahul Mehta"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={patDob}
                onChange={(e) => setPatDob(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Gender</label>
              <select
                value={patGender}
                onChange={(e) => setPatGender(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Mobile Number</label>
            <input
              type="text"
              value={patPhone}
              onChange={(e) => setPatPhone(e.target.value)}
              placeholder="+91 98450 12345"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={patEmail}
              onChange={(e) => setPatEmail(e.target.value)}
              placeholder="rahul.mehta@gmail.com"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Residential Address</label>
            <input
              type="text"
              value={patAddress}
              onChange={(e) => setPatAddress(e.target.value)}
              placeholder="102, 4th Cross, Indiranagar, Bangalore"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Insurance Carrier & Policy Number</label>
            <input
              type="text"
              value={patInsurance}
              onChange={(e) => setPatInsurance(e.target.value)}
              placeholder="HDFC Ergo Health Optima - Policy #HE-99283-A"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
            />
          </div>

          <div className="p-3 bg-[#112255]/60 border border-white/5 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-brand-cyan mt-0.5 flex-shrink-0" />
            <span className="text-[10px] text-text-secondary leading-relaxed font-semibold">
              Warning: Creating a profile allocates a new unique PATIENT schema identifier and binds corresponding invoice balances.
            </span>
          </div>

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
              Register Patient
            </Button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default ManagePatients;

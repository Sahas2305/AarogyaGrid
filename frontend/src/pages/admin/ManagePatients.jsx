/**
 * Page Name: ManagePatients
 * Props: None
 * Description: Renders the list of registered patients and provides registration inputs.
 * Used on: App.jsx (guarded route /admin/patients)
 *
 * CHANGES FROM MOCK VERSION:
 * - No mock data anywhere — already calling getPatients() from api.js
 * - Field names confirmed to match Supabase/Flask snake_case API responses:
 *     pat.patient_id, pat.name, pat.dob, pat.gender, pat.phone,
 *     pat.email, pat.insurance_details (NOT insuranceDetails)
 * - The mock used 'insuranceDetails' (camelCase) — API returns 'insurance_details'
 *   Fixed in the table column and title attribute below.
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, ShieldAlert, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { getPatients, updatePatient } from '../../api/api';
import { isValidMobile, normalizeMobile } from '../../utils/validators';

export const ManagePatients = () => {
  useRoleGuard(['admin']);

  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [editMode,     setEditMode]     = useState(false);
  const [editPatId,    setEditPatId]    = useState(null);
  const [saving,       setSaving]       = useState(false);

  // Form state
  const [patName,      setPatName]      = useState('');
  const [patDob,       setPatDob]       = useState('');
  const [patGender,    setPatGender]    = useState('Male');
  const [patPhone,     setPatPhone]     = useState('');
  const [patEmail,     setPatEmail]     = useState('');
  const [patAddress,   setPatAddress]   = useState('');
  const [patInsurance, setPatInsurance] = useState('');

  useEffect(() => {
    getPatients()
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(pat => {
    const matchesSearch =
      pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(pat.patient_id).includes(searchTerm) ||
      (pat.phone || '').includes(searchTerm);
    const matchesGender = genderFilter === 'All' || pat.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const itemsPerPage     = 10;
  const totalPages       = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddClick = () => {
    setEditMode(false);
    setEditPatId(null);
    setPatName('');
    setPatDob('');
    setPatGender('Male');
    setPatPhone('');
    setPatEmail('');
    setPatAddress('');
    setPatInsurance('');
    setDrawerOpen(true);
  };

  const handleEditClick = (pat) => {
    setEditMode(true);
    setEditPatId(pat.patient_id);
    setPatName(pat.name);
    setPatDob(pat.dob || '');
    setPatGender(pat.gender || 'Male');
    setPatPhone(pat.phone || '');
    setPatEmail(pat.email || '');
    setPatAddress(pat.address || '');
    setPatInsurance(pat.insurance_details || '');
    setDrawerOpen(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (!patName || !patDob || !patPhone || !patEmail || !patAddress) {
      toast.error('Please complete all required fields.');
      return;
    }
    
    const cleanPhone = normalizeMobile(patPhone);
    if (!isValidMobile(cleanPhone)) {
      toast.error('Please enter a valid 10-digit mobile number (starts with 6–9).');
      return;
    }

    if (!editMode) {
      toast.success('Use the Register tab on the Login page to create patient accounts.');
      setDrawerOpen(false);
      return;
    }

    setSaving(true);
    try {
      const res = await updatePatient(editPatId, {
        name: patName,
        dob: patDob,
        gender: patGender,
        phone: cleanPhone,
        email: patEmail,
        address: patAddress,
        insurance_details: patInsurance,
      });
      
      setPatients(prev => prev.map(p => p.patient_id === editPatId ? { 
        ...p, 
        name: patName, 
        dob: patDob, 
        gender: patGender, 
        phone: cleanPhone, 
        email: patEmail, 
        address: patAddress, 
        insurance_details: patInsurance,
        ...res.patient 
      } : p));
      
      setDrawerOpen(false);
      toast.success(`${patName}'s profile updated successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to update patient.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 select-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Manage Patient Index</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Register, browse, and edit patient clinical file summaries
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
          <Search className="w-4 h-4 text-text-secondary mr-2" />
          <input
            type="text"
            placeholder="Search by ID, name, or phone number..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center space-x-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs text-text-secondary">Gender:</span>
          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs text-white border-0 outline-none focus:ring-0 cursor-pointer"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Patient Name</Th>
              <Th>Age/Gender</Th>
              <Th>Contact Information</Th>
              <Th>Date of Birth</Th>
              <Th>Insurance Profile</Th>
              <Th className="text-center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={7} className="px-4 py-6"><SkeletonLoader rows={6} /></Td></Tr>
            ) : paginatedPatients.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-10 text-text-secondary/50 text-xs">
                  No registered patients found matching criteria.
                </Td>
              </Tr>
            ) : (
              paginatedPatients.map((pat) => {
                const age = pat.dob
                  ? new Date().getFullYear() - new Date(pat.dob).getFullYear()
                  : '—';
                return (
                  // API field: patient_id
                  <Tr key={pat.patient_id}>
                    <Td className="font-mono text-xs font-bold text-white">
                      P{String(pat.patient_id).padStart(2, '0')}
                    </Td>
                    {/* API field: name */}
                    <Td className="font-bold text-white text-xs">{pat.name}</Td>
                    <Td className="text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-white font-mono">{age} yrs</span>
                        <span className="text-white/20">|</span>
                        {/* API field: gender */}
                        <span className="text-text-secondary">{pat.gender}</span>
                      </div>
                    </Td>
                    <Td className="text-xs">
                      <div className="flex flex-col space-y-0.5">
                        {/* API fields: phone, email */}
                        <span className="text-white font-mono">{pat.phone}</span>
                        <span className="text-[10px] text-text-secondary/70">{pat.email}</span>
                      </div>
                    </Td>
                    {/* API field: dob */}
                    <Td className="font-mono text-xs">{pat.dob || '—'}</Td>
                    {/* API field: insurance_details (was insuranceDetails in mock) */}
                    <Td
                      className="text-xs max-w-[180px] truncate text-white"
                      title={pat.insurance_details}
                    >
                      {pat.insurance_details || 'None'}
                    </Td>
                    <Td className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          className="py-1 px-2.5 text-[10px]"
                          onClick={() => toast.success(`Viewing file for ${pat.name}`)}
                        >
                          View File
                        </Button>
                        <Button
                          variant="outline"
                          className="py-1 px-2.5 text-[10px]"
                          onClick={() => handleEditClick(pat)}
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

      {/* Add/Edit Patient Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editMode ? "Edit Patient File" : "Register Patient File"}
        size="md"
      >
        <form onSubmit={handleSavePatient} className="space-y-4 text-left">

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
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Mobile Number (10 digits)</label>
            <input
              type="tel"
              maxLength={10}
              value={patPhone}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPatPhone(onlyDigits);
              }}
              placeholder="9845012345"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
            {patPhone && !isValidMobile(patPhone) && (
              <p className="text-[10px] text-red-400">Must be 10 digits starting with 6–9</p>
            )}
            {patPhone && isValidMobile(patPhone) && (
              <p className="text-[10px] text-green-400">✓ Valid mobile number</p>
            )}
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
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Insurance Carrier &amp; Policy Number
            </label>
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
            <Button type="submit" loading={saving} className="flex-1 text-xs py-2.5">
              {editMode ? "Save Changes" : "Register Patient"}
            </Button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default ManagePatients;
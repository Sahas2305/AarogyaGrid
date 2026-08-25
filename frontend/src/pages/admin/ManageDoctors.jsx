/**
 * Page Name: ManageDoctors
 * Props: None
 * Description: Renders the listings of practitioners and handles doctor adding workflows.
 * Used on: App.jsx (guarded route /admin/doctors)
 *
 * CHANGES FROM MOCK VERSION:
 * - All data from real API (getDoctors, getDepartments, createDoctor)
 * - createDoctor response: Flask returns { doctor: {...} } — using res.doctor to prepend
 * - All field references use snake_case to match API responses:
 *   doc.doctor_id, doc.name, doc.specialization, doc.phone, doc.email,
 *   doc.department?.department_name, d.department_id, d.department_name
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { getDoctors, getDepartments, createDoctor, updateDoctor } from '../../api/api';
import { isValidMobile, normalizeMobile } from '../../utils/validators';

export const ManageDoctors = () => {
  useRoleGuard(['admin']);

  const [doctors,     setDoctors]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [editDocId,   setEditDocId]   = useState(null);

  // Form state
  const [docName,           setDocName]           = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docDepartmentId,   setDocDepartmentId]   = useState('');
  const [docPhone,          setDocPhone]           = useState('');
  const [docEmail,          setDocEmail]           = useState('');
  const [docTempPassword,   setDocTempPassword]   = useState('Welcome@123');

  useEffect(() => {
    Promise.all([getDoctors(), getDepartments()])
      .then(([docs, depts]) => {
        setDoctors(Array.isArray(docs) ? docs : []);
        setDepartments(Array.isArray(depts) ? depts : []);
        // Pre-select first department in the dropdown
        if (depts?.length) setDocDepartmentId(String(depts[0].department_id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter across name, specialization, and joined department name
  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.department?.department_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage    = 10;
  const totalPages      = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddClick = () => {
    setEditMode(false);
    setEditDocId(null);
    setDocName('');
    setDocSpecialization('');
    setDocDepartmentId(departments.length ? String(departments[0].department_id) : '');
    setDocPhone('');
    setDocEmail('');
    setDocTempPassword('Welcome@123');
    setDrawerOpen(true);
  };

  const handleEditClick = (doc) => {
    setEditMode(true);
    setEditDocId(doc.doctor_id);
    setDocName(doc.name.replace('Dr. ', ''));
    setDocSpecialization(doc.specialization);
    setDocDepartmentId(String(doc.department_id || (doc.department ? doc.department.department_id : '')));
    setDocPhone(doc.phone);
    setDocEmail(doc.email);
    setDrawerOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!docName || !docSpecialization || !docPhone || !docEmail || !docDepartmentId) {
      toast.error('Please complete all form fields.');
      return;
    }

    const cleanPhone = normalizeMobile(docPhone);
    if (!isValidMobile(cleanPhone)) {
      toast.error('Please enter a valid 10-digit mobile number (starts with 6–9).');
      return;
    }

    setSaving(true);
    try {
      if (editMode) {
        const res = await updateDoctor(editDocId, {
          name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
          specialization: docSpecialization,
          department_id: parseInt(docDepartmentId),
          phone: cleanPhone,
          email: docEmail,
        });
        setDoctors(prev => prev.map(d => d.doctor_id === editDocId ? { ...d, ...res.doctor } : d));
        setDrawerOpen(false);
        toast.success(`Dr. ${docName} updated successfully!`);
      } else {
        const res = await createDoctor({
          name: `Dr. ${docName}`,
          specialization: docSpecialization,
          department_id: parseInt(docDepartmentId),
          phone: cleanPhone,
          email: docEmail,
          password: docTempPassword,
        });
        setDoctors(prev => [res.doctor, ...prev]);
        setDrawerOpen(false);
        toast.success(`Dr. ${docName} registered successfully!`);
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${editMode ? 'update' : 'create'} doctor.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 select-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Manage Medical Clinicians</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Register, configure, and roster doctor credentials</p>
        </div>
        <Button
          onClick={handleAddClick}
          className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-md">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input
          type="text"
          placeholder="Search by physician name, specialization, or department..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Table */}
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
            {loading ? (
              <Tr><Td colSpan={8} className="px-4 py-6"><SkeletonLoader rows={5} /></Td></Tr>
            ) : paginatedDoctors.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-10 text-text-secondary/50 text-xs">
                  No matching doctors found in DB.
                </Td>
              </Tr>
            ) : (
              paginatedDoctors.map((doc) => (
                // API field: doctor_id (snake_case)
                <Tr key={doc.doctor_id}>
                  <Td className="font-mono text-xs font-bold text-white">
                    D{String(doc.doctor_id).padStart(2, '0')}
                  </Td>
                  {/* API field: name */}
                  <Td className="font-bold text-white text-xs">{doc.name}</Td>
                  {/* API field: specialization */}
                  <Td className="text-xs">{doc.specialization}</Td>
                  {/* API field: department.department_name (joined object from Flask) */}
                  <Td className="text-xs">{doc.department?.department_name || '—'}</Td>
                  <Td className="font-mono text-xs text-center">—</Td>
                  <Td className="text-xs">
                    <div className="flex flex-col space-y-0.5">
                      {/* API fields: phone, email */}
                      <span className="text-white font-mono">{doc.phone}</span>
                      <span className="text-[10px] text-text-secondary/70">{doc.email}</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="success">Active</Badge>
                  </Td>
                  <Td className="text-center">
                    <Button
                      variant="outline"
                      className="py-1 px-2.5 text-[10px]"
                      onClick={() => handleEditClick(doc)}
                    >
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))
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
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="py-1 px-2.5 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /><span>Prev</span>
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="py-1 px-2.5 flex items-center space-x-1"
              >
                <span>Next</span><ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editMode ? "Edit Practitioner Account" : "Register Practitioner Account"}
        size="md"
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4 text-left">

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Physician Name (Excluding Dr.)
            </label>
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
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Clinical Specialization
            </label>
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
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Hospital Department
              </label>
              {/* API field: department_id, department_name */}
              <select
                value={docDepartmentId}
                onChange={(e) => setDocDepartmentId(e.target.value)}
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
              >
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Clinic Floor (optional)
              </label>
              <input
                type="number" min="1" max="6"
                placeholder="Floor number"
                className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Mobile Number (10 digits)
            </label>
            <input
              type="tel"
              maxLength={13}
              value={docPhone}
              onChange={(e) => setDocPhone(e.target.value)}
              placeholder="9945098765"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
            {docPhone && !isValidMobile(docPhone) && (
              <p className="text-[10px] text-red-400">Must be a valid 10-digit mobile number starting with 6–9</p>
            )}
            {docPhone && isValidMobile(docPhone) && (
              <p className="text-[10px] text-green-400">✓ Valid mobile number</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              Institution Email
            </label>
            <input
              type="email"
              value={docEmail}
              onChange={(e) => setDocEmail(e.target.value)}
              placeholder="priya.sharma@healthcareos.org"
              className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-secondary/30 outline-none focus:border-brand-cyan/40"
              required
            />
          </div>

          {!editMode && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={docTempPassword}
                  onChange={(e) => setDocTempPassword(e.target.value)}
                  className="w-full bg-[#112255]/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/40"
                  required
                />
              </div>

              <div className="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-brand-warning mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-brand-warning leading-relaxed font-semibold">
                  NOTE: Clinician must complete a profile verification and change temporary credentials during their first system session.
                </span>
              </div>
            </>
          )}

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
              {editMode ? "Save Changes" : "Create Account"}
            </Button>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default ManageDoctors;
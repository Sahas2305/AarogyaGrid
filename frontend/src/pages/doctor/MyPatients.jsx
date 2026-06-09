/**
 * Page Name: MyPatients
 * Props: None
 * Description: Renders the clinical index of patients assigned to the active doctor.
 * Used on: App.jsx (guarded route /doctor/patients)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Search, ClipboardList, ExternalLink, Calendar } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { mockPatients } from '../../data/mockPatients';

export const MyPatients = () => {
  useRoleGuard(['doctor']);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients
  const filteredPatients = mockPatients.filter(pat =>
    pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pat.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">My Assigned Patient Roster</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Browse active patients, review histories, and check comorbidity profiles</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input
          type="text"
          placeholder="Search assigned patient name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map(pat => {
          const birthYear = new Date(pat.dob).getFullYear();
          const age = new Date().getFullYear() - birthYear;

          return (
            <Card key={pat.patientId} className="p-5 bg-surface-card border border-white/5 hover:border-white/10 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                  <span className="font-mono text-[10px] text-brand-cyan font-bold tracking-widest">{pat.patientId}</span>
                  <span className="text-[10px] text-text-secondary font-medium">{pat.registeredDate}</span>
                </div>
                
                <h4 className="text-sm font-bold text-white tracking-wide">{pat.name}</h4>
                
                <div className="flex items-center space-x-2 text-[10px] text-text-secondary mt-1.5 font-semibold">
                  <span>{age} yrs</span>
                  <span>•</span>
                  <span>{pat.gender}</span>
                </div>

                <div className="text-[10px] text-text-secondary/80 mt-3.5 space-y-1 font-mono">
                  <p>Ph: {pat.phone}</p>
                  <p className="truncate">Ins: {pat.insuranceDetails.split(' - ')[0]}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-5 pt-3 border-t border-white/5">
                <Button
                  variant="outline"
                  onClick={() => toast.success(`Viewing diagnostic history files for ${pat.name}`)}
                  className="flex-1 py-1 text-[10px] font-bold flex items-center justify-center space-x-1.5"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Clinical Records</span>
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => toast.success(`Initiated direct profile consult for ${pat.name}`)}
                  className="py-1 px-3 text-[10px] font-bold flex items-center justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>

            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default MyPatients;

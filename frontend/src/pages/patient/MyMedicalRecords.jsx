/**
 * Page Name: MyMedicalRecords
 * Props: None
 * Description: Renders patient-specific medical encounter histories with specialty colored tags.
 * Used on: App.jsx (guarded route /patient/records)
 */
import React, { useState } from 'react';
import { FileHeart, Search, ChevronDown, ChevronUp, Activity, Heart, Thermometer, Wind } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { mockMedicalRecords } from '../../data/mockMedicalRecords';

export const MyMedicalRecords = () => {
  useRoleGuard(['patient']);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filter records for patient Rahul Mehta (P01)
  const patientRecords = mockMedicalRecords.filter(rec =>
    rec.patientId === 'P01' &&
    (rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
     rec.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Border colors based on department
  const getDeptBorderColor = (dept) => {
    if (dept === 'Cardiology') return 'border-l-4 border-brand-cyan';
    if (dept === 'Neurology') return 'border-l-4 border-brand-purple';
    if (dept === 'Orthopedics') return 'border-l-4 border-brand-warning';
    if (dept === 'Pediatrics') return 'border-l-4 border-brand-success';
    return 'border-l-4 border-white/30';
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Page Header */}
      <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
        <div className="p-2.5 bg-brand-success/15 border border-brand-success/30 rounded-xl text-brand-success">
          <FileHeart className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">My Medical Records Charts</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Review active diagnoses, vital parameters, and doctor prescriptions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-4 py-2 w-full max-w-sm">
        <Search className="w-4 h-4 text-text-secondary mr-2" />
        <input
          type="text"
          placeholder="Search by diagnosis or physician..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-text-secondary/50 border-0 outline-none focus:ring-0"
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-4 max-w-3xl">
        {patientRecords.length === 0 ? (
          <Card className="p-10 border border-white/5 border-dashed text-center text-text-secondary/50 text-xs">
            No medical encounter records found.
          </Card>
        ) : (
          patientRecords.map((rec) => {
            const isOpen = expandedId === rec.recordId;
            return (
              <Card
                key={rec.recordId}
                className={`p-0 overflow-hidden transition-all duration-200 bg-surface-card ${
                  isOpen ? 'border-white/15' : 'border-white/5'
                } ${getDeptBorderColor(rec.department)}`}
              >
                {/* Header Section */}
                <div
                  onClick={() => toggleExpand(rec.recordId)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01]"
                >
                  <div className="truncate pr-2">
                    <span className="text-sm font-bold text-white block">{rec.diagnosis}</span>
                    <span className="text-[10px] text-text-secondary/60 mt-1 block">
                      Encounter Date: {rec.date} • {rec.doctorName} ({rec.department})
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center space-x-3 flex-shrink-0">
                    <Badge variant="cyan" className="text-[9px] font-bold uppercase tracking-wider py-0 px-2.5">
                      {rec.department}
                    </Badge>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-brand-cyan" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Collapsible Details */}
                {isOpen && (
                  <div className="p-5 bg-black/15 border-t border-white/5 space-y-5">
                    
                    {/* Vitals metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard small title="Blood Pressure" value={rec.vitals.bp} icon={Heart} />
                      <StatCard small title="Heart Rate" value={`${rec.vitals.hr} bpm`} icon={Activity} />
                      <StatCard small title="Temperature" value={`${rec.vitals.temp} °F`} icon={Thermometer} />
                      <StatCard small title="Oxygen Saturation" value={`${rec.vitals.spo2} %`} icon={Wind} />
                    </div>

                    <div className="space-y-3.5 text-xs leading-relaxed">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Recommended Treatment</span>
                        <p className="text-text-secondary mt-1 font-medium">{rec.treatment}</p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-cyan tracking-widest block">Dosing Prescription Details</span>
                        <pre className="text-white font-mono bg-[#070f1a] border border-white/5 rounded-lg p-3 mt-1 whitespace-pre-line leading-relaxed">
                          {rec.prescription}
                        </pre>
                      </div>

                      {rec.notes && (
                        <div>
                          <span className="text-[9px] uppercase font-bold text-text-secondary tracking-widest block">Physician Annotations</span>
                          <p className="text-text-secondary mt-1 bg-white/[0.01] border border-white/5 rounded-lg p-3 italic">
                            "{rec.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
};

export default MyMedicalRecords;

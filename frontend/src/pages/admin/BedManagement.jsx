/**
 * Page Name: BedManagement
 * Props: None
 * Description: Capacity management detailing floor map grids and predictive occupancy forecasts.
 * Used on: App.jsx (guarded route /admin/beds)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Bed, RefreshCw, BarChart2, ShieldAlert, Check } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockBedsData as initialBedsData } from '../../data/mockBeds';

// 7-day initial occupancy forecast data
const initialForecast = [
  { day: 'Mon', Cardiology: 8, Neurology: 5, Emergency: 9, General: 12 },
  { day: 'Tue', Cardiology: 9, Neurology: 6, Emergency: 7, General: 13 },
  { day: 'Wed', Cardiology: 7, Neurology: 6, Emergency: 8, General: 11 },
  { day: 'Thu', Cardiology: 10, Neurology: 7, Emergency: 10, General: 14 },
  { day: 'Fri', Cardiology: 11, Neurology: 8, Emergency: 9, General: 15 },
  { day: 'Sat', Cardiology: 8, Neurology: 5, Emergency: 6, General: 10 },
  { day: 'Sun', Cardiology: 6, Neurology: 4, Emergency: 5, General: 9 }
];

// Predicted Discharge List
const predictedDischarges = [
  { dischargeId: 'DCH01', name: 'Rahul Mehta', department: 'Cardiology', bedId: 'CARD-301', confidence: 92, date: 'Today, 02:00 PM' },
  { dischargeId: 'DCH02', name: 'Ananya Iyer', department: 'Pediatrics', bedId: 'PEDI-101', confidence: 85, date: 'Today, 04:30 PM' },
  { dischargeId: 'DCH03', name: 'Priya Nair', department: 'Emergency', bedId: 'EMER-101', confidence: 78, date: 'Tomorrow, 10:00 AM' }
];

export const BedManagement = () => {
  useRoleGuard(['admin']);
  const [bedsData, setBedsData] = useState(initialBedsData);
  const [forecast, setForecast] = useState(initialForecast);
  const [discharges, setDischarges] = useState(predictedDischarges);
  const [runningModel, setRunningModel] = useState(false);

  // Math counts
  let totalBedsCount = 0;
  let occupiedBedsCount = 0;
  let cleaningBedsCount = 0;
  let reservedBedsCount = 0;

  Object.values(bedsData).forEach((dept) => {
    totalBedsCount += dept.totalBeds;
    dept.beds.forEach((bed) => {
      if (bed.status === 'Occupied') occupiedBedsCount++;
      if (bed.status === 'Cleaning') cleaningBedsCount++;
      if (bed.status === 'Reserved') reservedBedsCount++;
    });
  });

  const availableBedsCount = totalBedsCount - occupiedBedsCount - cleaningBedsCount - reservedBedsCount;
  const occupancyPercentage = Math.round((occupiedBedsCount / totalBedsCount) * 100);

  // SVG Occupancy Ring
  const BedOccupancyRing = ({ percentage }) => {
    const radius = 24;
    const strokeWidth = 5;
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - percentage / 100);

    return (
      <svg className="w-14 h-14 transform -rotate-90">
        <circle cx="28" cy="28" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="transparent" />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#ff1744"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
    );
  };

  const handleRunModel = () => {
    setRunningModel(true);
    toast.loading('Analyzing telemetry records and forecasting occupancy levels...');
    setTimeout(() => {
      toast.dismiss();
      setRunningModel(false);
      
      // Update forecast to new randomized mock values
      const updatedForecast = forecast.map(f => ({
        ...f,
        Cardiology: Math.min(12, Math.max(4, f.Cardiology + Math.floor(Math.random() * 3) - 1)),
        Neurology: Math.min(10, Math.max(2, f.Neurology + Math.floor(Math.random() * 3) - 1)),
        Emergency: Math.min(10, Math.max(3, f.Emergency + Math.floor(Math.random() * 3) - 1)),
        General: Math.min(15, Math.max(6, f.General + Math.floor(Math.random() * 3) - 1))
      }));
      setForecast(updatedForecast);
      toast.success('Predictive bed analysis model updated successfully!');
    }, 2000);
  };

  const handleConfirmDischarge = (dischargeId, name, bedId, dept) => {
    toast.success(`Discharge processed for ${name}. Bed ${bedId} updated to Cleaning.`);
    
    // Update discharges list
    setDischarges(prev => prev.filter(d => d.dischargeId !== dischargeId));

    // Update beds mapping
    setBedsData(prev => {
      const copy = { ...prev };
      if (copy[dept]) {
        copy[dept].beds = copy[dept].beds.map(b => {
          if (b.bedId === bedId) {
            return { ...b, status: 'Cleaning', patientName: null };
          }
          return b;
        });
      }
      return copy;
    });
  };

  const statusColors = {
    Available: 'text-green-400 bg-green-500/10 border-green-500/20',
    Occupied: 'text-red-400 bg-red-500/10 border-red-500/20',
    Reserved: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Cleaning: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  };

  const statusIconColors = {
    Available: 'text-green-400',
    Occupied: 'text-red-400',
    Reserved: 'text-yellow-400',
    Cleaning: 'text-blue-400'
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Predictive Bed Allocation</h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Real-time floor grids and AI discharge forecasting models</p>
        </div>
        <Button
          onClick={handleRunModel}
          loading={runningModel}
          className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-bold px-4 py-2.5 border-2 border-brand-cyan/20 animate-pulse-cyan"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Execute ML Predictor</span>
        </Button>
      </div>

      {/* Capacity Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Occupied Ring Card */}
        <Card className="flex items-center justify-between p-5">
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Occupied Beds</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{occupiedBedsCount} <span className="text-xs text-text-secondary font-medium">/ {totalBedsCount}</span></h3>
            <span className="inline-block text-[10px] text-brand-danger bg-brand-danger/10 border border-brand-danger/20 rounded px-1.5 py-0.2 mt-2 font-bold">High Capacity</span>
          </div>
          <div className="relative flex items-center justify-center">
            <BedOccupancyRing percentage={occupancyPercentage} />
            <span className="absolute text-[10px] text-white font-extrabold">{occupancyPercentage}%</span>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Available Units</span>
          <h3 className="text-3xl font-extrabold text-brand-success mt-1">{availableBedsCount}</h3>
          <span className="inline-block text-[10px] text-brand-success bg-brand-success/10 border border-brand-success/20 rounded px-1.5 py-0.2 mt-2 font-bold">Ready for Intake</span>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Reserved Incoming</span>
          <h3 className="text-3xl font-extrabold text-brand-warning mt-1">{reservedBedsCount}</h3>
          <span className="inline-block text-[10px] text-brand-warning bg-brand-warning/10 border border-brand-warning/20 rounded px-1.5 py-0.2 mt-2 font-bold">Scheduled Admits</span>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Sanitation Cycles</span>
          <h3 className="text-3xl font-extrabold text-brand-blue mt-1">{cleaningBedsCount}</h3>
          <span className="inline-block text-[10px] text-brand-blue bg-brand-blue/10 border border-brand-blue/20 rounded px-1.5 py-0.2 mt-2 font-bold">Cleaning Cycle</span>
        </Card>

      </div>

      {/* Bed Floor Plan Map */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">Ward Floor Plan Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(bedsData).map(([deptName, deptObj]) => (
            <Card key={deptName} className="p-5 bg-surface-card border border-white/5 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">{deptName}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">Floor {deptObj.floor}</p>
                </div>
                <Badge variant="cyan" className="text-[9px]">
                  {deptObj.beds.filter(b => b.status === 'Available').length} Free
                </Badge>
              </div>

              {/* Bed Grid Icons */}
              <div className="grid grid-cols-4 gap-3">
                {deptObj.beds.map((bed) => (
                  <div
                    key={bed.bedId}
                    className={`
                      relative group border rounded-xl p-2.5 flex flex-col items-center justify-center cursor-help transition-all duration-200
                      ${statusColors[bed.status] || 'border-white/5'}
                    `}
                  >
                    <Bed className={`w-5 h-5 ${statusIconColors[bed.status]}`} />
                    <span className="text-[8px] font-mono mt-1 text-white/50">{bed.bedId.split('-')[1]}</span>
                    
                    {/* Tooltip Overlay */}
                    <div className="absolute bottom-full mb-2 bg-[#0a1628] border border-white/10 rounded-lg p-2.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 flex flex-col space-y-1">
                      <span className="font-bold text-white">{bed.bedId}</span>
                      <span className="text-text-secondary">Status: <span className="font-semibold text-white">{bed.status}</span></span>
                      {bed.patientName && (
                        <span className="text-brand-cyan font-bold">Patient: {bed.patientName}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Forecast & Discharges Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Forecast Recharts Chart */}
        <Card className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Occupancy Forecast Timeline</h3>
            <p className="text-xs text-text-secondary mt-1">Multi-variate predictive capacity model</p>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer>
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d2044', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Cardiology" stackId="1" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Neurology" stackId="1" stroke="#0066cc" fill="#0066cc" fillOpacity={0.15} />
                <Area type="monotone" dataKey="General" stackId="1" stroke="#00c853" fill="#00c853" fillOpacity={0.15} />
                <Area type="monotone" dataKey="Emergency" stackId="1" stroke="#ff1744" fill="#ff1744" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Predictive Discharges Table */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI-Predicted Discharges</h3>
            <p className="text-xs text-text-secondary mt-1">Discharge ready scores based on clinical metrics</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[240px]">
            {discharges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-text-secondary/30 text-xs">
                <Check className="w-6 h-6 mb-1 text-brand-success" />
                <span>All predicted discharges cleared</span>
              </div>
            ) : (
              discharges.map((d) => (
                <div key={d.dischargeId} className="p-3 bg-[#112255]/40 border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-xs font-bold text-white block">{d.name}</span>
                    <span className="text-[10px] text-text-secondary tracking-wide">
                      {d.bedId} • {d.department}
                    </span>
                    <span className="text-[9px] font-mono text-text-secondary/50 block mt-0.5">Est: {d.date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-brand-cyan block">{d.confidence}%</span>
                      <span className="text-[8px] uppercase font-bold text-text-secondary">Conf</span>
                    </div>
                    <Button
                      variant="outline"
                      className="py-1 px-2.5 text-[9px] hover:bg-brand-success/15 hover:border-brand-success hover:text-brand-success"
                      onClick={() => handleConfirmDischarge(d.dischargeId, d.name, d.bedId, d.department)}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};

export default BedManagement;

/**
 * Page Name: RiskPrediction
 * Props: None
 * Description: AI risk assessment tracking patient chronic vulnerabilities.
 * Used on: App.jsx (guarded route /admin/risk)
 */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Activity, AlertTriangle, Brain, Filter, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';
import { SparkLine } from '../../components/charts/SparkLine';
import { CustomScatterPlot } from '../../components/charts/ScatterPlot';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line } from 'recharts';
import { mockRiskPatients as initialPatients } from '../../data/mockAIDiagnosis';

// Mock sparkline trends
const sparkHighRisk = [10, 12, 11, 13, 15, 12, 14];
const sparkAvgFactors = [3.5, 3.4, 3.3, 3.4, 3.2, 3.3, 3.2];
const sparkCareActions = [30, 32, 35, 38, 40, 39, 42];

// Horizontal Bar chart data for top risk factors
const riskFactorsData = [
  { factor: 'Sedentary Habits', count: 9 },
  { factor: 'HbA1c > 7.0%', count: 8 },
  { factor: 'Systolic BP > 140', count: 7 },
  { factor: 'LDL > 130 mg/dL', count: 6 },
  { factor: 'Smoking History', count: 5 }
];

// Patient Risk Score Bar Component
const RiskScoreBar = ({ score }) => {
  // Compute color based on score
  const getBarColor = () => {
    if (score > 75) return 'from-amber-500 to-red-500';
    if (score > 50) return 'from-yellow-400 to-amber-500';
    return 'from-green-400 to-yellow-400';
  };

  return (
    <div className="flex items-center space-x-2 w-full select-none">
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-white w-8 text-right">{score}%</span>
    </div>
  );
};

export const RiskPrediction = () => {
  useRoleGuard(['admin']);

  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Profile modal data
  const handlePatientRowClick = (patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  const handlePriorityFlag = (name) => {
    toast.success(`Priority Alert: Clinicians notified. Patient ${name} flagged for priority care checks.`);
    setModalOpen(false);
  };

  const getRiskBadgeVariant = (level) => {
    if (level === 'red') return 'danger';
    if (level === 'amber') return 'warning';
    return 'success';
  };

  // Mock historic trend data for specific patient risk profiles
  const patientHistoryTrend = [
    { month: 'Jan', score: 60 },
    { month: 'Feb', score: 62 },
    { month: 'Mar', score: 65 },
    { month: 'Apr', score: 68 },
    { month: 'May', score: 71 },
    { month: 'Jun', score: selectedPatient ? selectedPatient.riskScore : 72 }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-purple/10 border border-brand-purple/20 rounded-xl text-brand-purple">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">AI Risk Vulnerability Analytics</h2>
            <p className="text-xs md:text-sm text-text-secondary mt-1">Predictive profiling of patient chronic threat vectors using clinical metrics</p>
          </div>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="High-Risk Patient Index"
          value={14}
          icon={ShieldAlert}
          trend="+3% vs month ago"
          trendType="danger"
          chart={<SparkLine data={sparkHighRisk} stroke="#ff1744" />}
        />
        <StatCard
          title="Average Risk Factors"
          value="3.2 factors"
          icon={Activity}
          trend="-1% optimization"
          trendType="success"
          chart={<SparkLine data={sparkAvgFactors} stroke="#00c853" />}
        />
        <StatCard
          title="Scheduled Preventative Actions"
          value={42}
          icon={UserCheck}
          trend="+15% compliance"
          trendType="success"
          chart={<SparkLine data={sparkCareActions} stroke="#00d4ff" />}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scatter Plot */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Cohort Risk Distribution</h3>
            <p className="text-xs text-text-secondary mt-1">Age (Y) vs Risk Score (X) mapping, colored by severity</p>
          </div>
          <CustomScatterPlot data={patients} height={260} />
        </Card>

        {/* Factors Bar Chart */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Comorbidity Risk Vectors</h3>
            <p className="text-xs text-text-secondary mt-1">Quantity of patients presenting matching triggers</p>
          </div>
          <div className="w-full h-[260px]">
            <ResponsiveContainer>
              <BarChart layout="vertical" data={riskFactorsData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="factor" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0d2044', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count" fill="#7c4dff" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* High Risk Patients Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-text-secondary">High Risk Cohort Registry</h3>
          <Badge variant="cyan">Action Required</Badge>
        </div>
        <Table>
          <Thead>
            <Tr>
              <Tr>
                <Th>Patient ID</Th>
                <Th>Patient Name</Th>
                <Th>Age</Th>
                <Th>Top Comorbidity Factor</Th>
                <Th className="w-64">AI Risk Percentage</Th>
                <Th>Risk Level</Th>
                <Th className="text-center">Action</Th>
              </Tr>
            </Tr>
          </Thead>
          <Tbody>
            {patients.slice(0, 5).map((pat) => (
              <Tr
                key={pat.patientId}
                onClick={() => handlePatientRowClick(pat)}
                className="cursor-pointer hover:bg-white/[0.03]"
              >
                <Td className="font-mono text-xs font-bold text-white">{pat.patientId}</Td>
                <Td className="font-bold text-white text-xs">{pat.patientName}</Td>
                <Td className="font-mono text-xs">{pat.age} yrs</Td>
                <Td className="text-xs text-white max-w-[220px] truncate">{pat.topFactor}</Td>
                <Td>
                  <RiskScoreBar score={pat.riskScore} />
                </Td>
                <Td>
                  <Badge variant={getRiskBadgeVariant(pat.riskLevel)} className="text-[9px] uppercase font-bold tracking-wider px-2">
                    {pat.riskLevel}
                  </Badge>
                </Td>
                <Td className="text-center">
                  <Button variant="outline" className="py-1 px-2.5 text-[9px]">
                    Analyze Profile
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Clinical Risk Profile: ${selectedPatient.patientName}`}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left select-none">
            
            {/* Left Column stats */}
            <div className="md:col-span-7 space-y-5">
              
              <div className="p-4 bg-surface-secondary/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-text-secondary uppercase tracking-widest block font-bold">Vulnerability Score</span>
                  <h4 className={`text-4xl font-black mt-1 ${selectedPatient.riskLevel === 'red' ? 'text-brand-danger' : 'text-brand-warning'}`}>
                    {selectedPatient.riskScore}%
                  </h4>
                  <span className="text-[10px] text-text-secondary/60 mt-1 block">Clinical comorbidity coefficient</span>
                </div>
                <div className="w-28 h-14">
                  <ResponsiveContainer>
                    <LineChart data={patientHistoryTrend}>
                      <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span className="text-[8px] font-mono text-text-secondary/40 block text-center mt-1">6-Month Score Trend</span>
                </div>
              </div>

              {/* Contributing factors */}
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold block">Vulnerability Indicators</span>
                <div className="space-y-1.5">
                  {selectedPatient.contributingFactors.map((fact, idx) => (
                    <div key={idx} className="p-2.5 bg-[#112255]/40 border border-white/5 rounded-xl text-xs flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 bg-brand-danger rounded-full flex-shrink-0" />
                      <span className="text-white">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column recommendations */}
            <div className="md:col-span-5 space-y-4">
              
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary uppercase tracking-widest font-extrabold block flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>AI Preventative Actions</span>
                </span>
                <div className="space-y-2">
                  {selectedPatient.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-[#0d2044] border border-white/8 rounded-xl text-xs leading-relaxed text-text-secondary">
                      <span className="text-white font-bold block mb-0.5">Recommendation {idx + 1}</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flag Priority button */}
              <Button
                variant="primary"
                onClick={() => handlePriorityFlag(selectedPatient.patientName)}
                className="w-full py-2.5 text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-blue flex items-center justify-center space-x-2 mt-4"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Flag for Priority Care</span>
              </Button>

            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default RiskPrediction;

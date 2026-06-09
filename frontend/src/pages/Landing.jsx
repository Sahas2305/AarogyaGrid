/**
 * Page Name: Landing
 * Props: None
 * Description: Public landing hero screen explaining system specifications and links to logs.
 * Used on: App.jsx (root route /)
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, CreditCard, Shield, Brain, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EcgLine } from '../components/ui/EcgLine';
import { useCountUp } from '../hooks/useCountUp';

export const Landing = () => {
  // Stats Counters
  const [tablesCount, tablesRef] = useCountUp(11, 2000);
  const [rolesCount, rolesRef] = useCountUp(3, 2000);
  const [aiFeaturesCount, aiFeaturesRef] = useCountUp(6, 2000);

  const features = [
    {
      title: 'Electronic Medical Records',
      desc: 'Consolidated clinical registries replacing clipboards with digital logs.',
      icon: FileText,
      color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
    },
    {
      title: 'Automated Scheduler',
      desc: 'Centralized doctor calendar booking with availability audits.',
      icon: Calendar,
      color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
    },
    {
      title: 'Itemized Billing Desk',
      desc: 'INR invoice tracking matching insurances and paid/pending tags.',
      icon: CreditCard,
      color: 'text-brand-success bg-brand-success/10 border-brand-success/20'
    },
    {
      title: 'Audit Trigger Logs',
      desc: 'Security database audit log representation tracking modifications in real-time.',
      icon: Shield,
      color: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20'
    },
    {
      title: 'AI Clinical Copilot',
      desc: 'Generative clinical copilots tracking drug checks and symptom analysis.',
      icon: Brain,
      color: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20'
    },
    {
      title: 'Predictive Resource Manager',
      desc: 'Forecasting bed loads, triage queues, and patient vulnerability indexes.',
      icon: BarChart2,
      color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
    }
  ];

  const modules = [
    'Patient Master Record',
    'Doctor Registry Schema',
    'Appointment Ledger',
    'Clinical Diagnosis Logs',
    'Laboratory Worksheets',
    'Invoicing Ledger',
    'Emergency Triage Index',
    'System Security Audits'
  ];

  return (
    <div className="min-h-screen bg-surface-primary text-white flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Animated Heartbeat Line */}
      <div className="absolute top-0 left-0 right-0 z-10 w-full overflow-hidden bg-black/20">
        <EcgLine height={80} color="#00d4ff" />
      </div>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 flex-1 flex flex-col justify-center items-center text-center relative z-20">
        
        {/* Project Header badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-brand-cyan uppercase tracking-widest mb-6">
          <span>DBMS Final Year Project</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-white max-w-4xl">
          Healthcare<span className="text-gradient font-black">OS</span>
        </h1>
        <p className="text-lg md:text-xl text-brand-cyan/80 font-bold uppercase tracking-wider mt-4">
          Healthcare Excellence Platform
        </p>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-text-secondary max-w-2xl mt-6 leading-relaxed">
          An AI-integrated digital platform automating hospital operations.
          Replacing clipboards with code, replacing guesswork with AI clinical predictions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto">
          <Link to="/login">
            <Button variant="primary" className="px-8 py-3 text-base flex items-center space-x-2 w-full sm:w-auto">
              <span>Access Demo Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="px-8 py-3 text-base w-full sm:w-auto">
              <span>Sign In</span>
            </Button>
          </Link>
        </div>

        {/* Viewport Count-Up stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl w-full border-t border-b border-white/5 py-8 bg-white/[0.01] rounded-2xl px-4">
          
          <div className="flex flex-col items-center" ref={tablesRef}>
            <span className="text-3xl md:text-5xl font-black text-white">{tablesCount}</span>
            <span className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider mt-2 font-bold">Relational Tables</span>
          </div>

          <div className="flex flex-col items-center" ref={rolesRef}>
            <span className="text-3xl md:text-5xl font-black text-brand-cyan">{rolesCount}</span>
            <span className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider mt-2 font-bold">Role Portals</span>
          </div>

          <div className="flex flex-col items-center" ref={aiFeaturesRef}>
            <span className="text-3xl md:text-5xl font-black text-brand-blue">{aiFeaturesCount}</span>
            <span className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider mt-2 font-bold">AI Analytics</span>
          </div>

        </div>

        {/* Features Grid */}
        <div className="mt-24 w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Advanced System Features</h2>
            <p className="text-xs md:text-sm text-text-secondary mt-2">Engineered components addressing operational friction</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Card
                  key={i}
                  className="text-left flex flex-col justify-between hover:-translate-y-1 hover:border-white/20 transition-all duration-300"
                >
                  <div>
                    <div className={`p-3 rounded-xl border w-fit ${f.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mt-4">{f.title}</h3>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">{f.desc}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Database Modules strip */}
        <div className="mt-24 w-full border-t border-white/5 pt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">System Modules Registry</h2>
            <p className="text-xs text-text-secondary mt-1">Structured schemas automating core workflows</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {modules.map((m, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 p-3.5 bg-surface-secondary/30 border border-white/5 rounded-xl text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                <span className="text-xs text-white font-medium truncate">{m}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer credits */}
      <footer className="w-full bg-[#070f1a] border-t border-white/5 py-8 select-none z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          <div>
            <p className="text-xs text-text-secondary font-semibold">
              HealthcareOS — Healthcare Excellence Platform
            </p>
            <p className="text-[10px] text-text-secondary/50 mt-1 max-w-md leading-relaxed">
              Developed by Darshan Gupta, Devansh Pateriya, Keshav Lath, and Sahastranshu Mishra. 
              Department of CSE Cyber Security, Dayananda Sagar College of Engineering, Bangalore.
            </p>
          </div>
          <div className="text-[10px] text-text-secondary/50 font-mono">
            DBMS Final Project © 2026
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

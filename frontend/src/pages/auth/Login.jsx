/**
 * Page Name: Login
 * Props: None
 * Description: Contains Login and Register forms with floating labels and demo access cards.
 * Used on: App.jsx (public route /login)
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Shield, Stethoscope, Users, Heart, ClipboardPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { EcgLine } from '../../components/ui/EcgLine';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Floating Label Input Component using Framer Motion
const FloatingInput = ({ label, id, type = 'text', value, onChange, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  const isActive = focused || (value && value.toString().length > 0);

  return (
    <div className="relative mb-5 select-none">
      <motion.label
        htmlFor={id}
        animate={{
          y: isActive ? -18 : 10,
          scale: isActive ? 0.8 : 1,
          color: isActive ? '#00d4ff' : '#94a3b8'
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute left-3 text-sm font-semibold pointer-events-none origin-left"
      >
        {label}
      </motion.label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-2 bg-[#112255]/40 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-brand-cyan/50 transition-all pt-5"
        {...props}
      />
    </div>
  );
};

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login'); // login or register
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@healthcareos.org');
  const [loginPassword, setLoginPassword] = useState('Password123');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regInsurance, setRegInsurance] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Determine role by email for demo login
      let matchedRole = 'admin';
      if (loginEmail.includes('priya') || loginEmail.includes('doctor')) {
        matchedRole = 'doctor';
      } else if (loginEmail.includes('rahul') || loginEmail.includes('patient')) {
        matchedRole = 'patient';
      }
      
      login(matchedRole);
      toast.success(`Welcome back! Logged in as ${matchedRole.toUpperCase()}`);
      
      // Redirect
      if (matchedRole === 'admin') navigate('/admin/dashboard');
      else if (matchedRole === 'doctor') navigate('/doctor/dashboard');
      else if (matchedRole === 'patient') navigate('/patient/dashboard');
    }, 1500);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login('patient'); // Logs in as default patient Rahul Mehta
      toast.success('Registration successful! Welcome to HealthcareOS.');
      navigate('/patient/dashboard');
    }, 1500);
  };

  const handleQuickLogin = (role) => {
    login(role);
    toast.success(`Demo Access: logged in as ${role.toUpperCase()}`);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'patient') navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 md:p-6 overflow-x-hidden">
      <div className="w-full max-w-5xl bg-[#0d2044] rounded-3xl border border-white/8 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Left Column - Graphic */}
        <div className="lg:col-span-5 bg-[#0a1628]/60 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/8 select-none">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-brand-cyan to-brand-blue rounded-xl text-white">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">
              Healthcare<span className="text-brand-cyan">OS</span>
            </span>
          </div>

          <div className="my-12">
            <EcgLine height={90} color="#00d4ff" />
            <h3 className="text-xl font-bold text-white text-center mt-6">Optimized Health Logistics</h3>
            <p className="text-xs text-text-secondary text-center mt-2 leading-relaxed max-w-xs mx-auto">
              Automating hospital triggers, charting clinic pipelines, and predicting emergency indexes.
            </p>
          </div>

          <div className="text-[10px] text-text-secondary/35 text-center font-mono">
            DSCE CSE CYBER SECURITY © 2026
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between">
          <div>
            {/* Tabs */}
            <div className="flex bg-[#0a1628]/40 border border-white/5 p-1 rounded-xl w-60 mx-auto mb-8">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-brand-cyan text-[#0a1628] shadow'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-brand-cyan text-[#0a1628] shadow'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Tab */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto">
                <h2 className="text-xl font-extrabold text-white text-center mb-6">Access Dashboard</h2>
                
                <FloatingInput
                  label="Email Address"
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />

                <div className="relative">
                  <FloatingInput
                    label="Password"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-text-secondary hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-3 mt-4 text-sm font-bold tracking-wide"
                >
                  Sign In to Account
                </Button>
              </form>
            ) : (
              /* Register Tab */
              <form onSubmit={handleRegisterSubmit} className="max-w-lg mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <h2 className="text-xl font-extrabold text-white text-center md:col-span-2 mb-6">Patient Registration</h2>
                
                <FloatingInput
                  label="Full Name"
                  id="regName"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />

                <div className="relative mb-5">
                  <label htmlFor="regDob" className="block text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    id="regDob"
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#112255]/40 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-brand-cyan/50"
                    required
                  />
                </div>

                <div className="relative mb-5">
                  <label htmlFor="regGender" className="block text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Gender</label>
                  <select
                    id="regGender"
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#112255]/40 border border-white/10 rounded-lg text-white text-xs outline-none focus:border-brand-cyan/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <FloatingInput
                  label="Phone Number"
                  id="regPhone"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />

                <FloatingInput
                  label="Email Address"
                  id="regEmail"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />

                <FloatingInput
                  label="Address"
                  id="regAddress"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                />

                <div className="md:col-span-2">
                  <FloatingInput
                    label="Insurance Company Policy No."
                    id="regInsurance"
                    value={regInsurance}
                    onChange={(e) => setRegInsurance(e.target.value)}
                  />
                </div>

                <FloatingInput
                  label="Password"
                  id="regPassword"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />

                <FloatingInput
                  label="Confirm Password"
                  id="regConfirmPassword"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full py-3 mt-4 text-sm font-bold tracking-wide"
                  >
                    Create Patient Account
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Grading Demo login Section */}
          <div className="mt-8 pt-6 border-t border-white/5 select-none">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest text-center mb-3">Demo Evaluation — Direct Access</p>
            <div className="grid grid-cols-3 gap-3">
              
              <div
                onClick={() => handleQuickLogin('admin')}
                className="p-3 bg-brand-danger/10 border border-brand-danger/20 hover:border-brand-danger hover:bg-brand-danger/20 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95"
              >
                <Shield className="w-5 h-5 text-brand-danger" />
                <span className="text-[10px] font-bold text-white mt-1">Admin Portal</span>
              </div>

              <div
                onClick={() => handleQuickLogin('doctor')}
                className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 hover:border-brand-cyan hover:bg-brand-cyan/20 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95"
              >
                <Stethoscope className="w-5 h-5 text-brand-cyan" />
                <span className="text-[10px] font-bold text-white mt-1">Doctor Portal</span>
              </div>

              <div
                onClick={() => handleQuickLogin('patient')}
                className="p-3 bg-brand-success/10 border border-brand-success/20 hover:border-brand-success hover:bg-brand-success/20 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95"
              >
                <Users className="w-5 h-5 text-brand-success" />
                <span className="text-[10px] font-bold text-white mt-1">Patient Portal</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

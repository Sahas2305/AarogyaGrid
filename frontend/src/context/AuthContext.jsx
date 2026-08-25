/**
 * Component: AuthContext
 * Description: Real auth context — calls Flask API for login/register.
 *              Stores JWT + user info in localStorage for session persistence.
 *              Keeps switchRole() for the demo quick-access cards on Login page.
 * Used on: App.jsx (wrapper)
 */
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerPatient } from '../api/api';

export const AuthContext = createContext(null);

// ── Demo mode users — used only by the quick-access cards on Login page ──────
const DEMO_USERS = {
  admin: {
    user_id: 1,
    username: 'Admin HealthcareOS',
    email: 'admin@healthcareos.org',
    role: 'admin',
    patient_id: null,
    doctor_id: null,
    avatarInitials: 'AH',
    department: 'Administration',
  },
  doctor: {
    user_id: 2,
    username: 'Dr Sharma',
    email: 'sharma@gmail.com',
    role: 'doctor',
    patient_id: null,
    doctor_id: 1,
    avatarInitials: 'DS',
    department: 'Cardiology',
  },
  patient: {
    user_id: 5,
    username: 'Devansh Pateriya',
    email: 'devansh@gmail.com',
    role: 'patient',
    patient_id: 1,
    doctor_id: null,
    avatarInitials: 'DP',
    department: null,
  },
};

// ── Derive initials from a name string ────────────────────────────────────────
const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('healthcare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Persist user to localStorage on every change ──────────────────────────
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('healthcare_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('healthcare_user');
      localStorage.removeItem('healthcare_token');
    }
  }, [currentUser]);

  // ── Real login — calls Flask /api/auth/login ───────────────────────────────
  const loginWithCredentials = async (email, password) => {
    const data = await loginUser(email, password);

    if (data.error) {
      throw new Error(data.error);
    }

    // Store JWT for all future API calls
    localStorage.setItem('healthcare_token', data.token);

    const user = {
      user_id:       data.user_id,
      username:      data.username,
      email:         email,
      role:          data.role,
      patient_id:    data.patient_id,
      doctor_id:     data.doctor_id,
      avatarInitials: getInitials(data.username),
      department:    null,
    };

    setCurrentUser(user);
    return user;
  };

  // ── Real register — calls Flask /api/auth/register ────────────────────────
  const registerNewPatient = async (formData) => {
    const data = await registerPatient(formData);

    if (data.error) {
      throw new Error(data.error);
    }

    localStorage.setItem('healthcare_token', data.token);

    const user = {
      user_id:        data.user_id,
      username:       data.username,
      email:          formData.email,
      role:           'patient',
      patient_id:     data.patient_id,
      doctor_id:      null,
      avatarInitials: getInitials(data.username),
      department:     null,
    };

    setCurrentUser(user);
    return user;
  };

  // ── Demo quick-login — bypasses API, uses hardcoded demo credentials ───────
  // Sets a demo JWT via the real login so the token is valid for API calls.
  const switchRole = async (role) => {
    const demo = DEMO_USERS[role];
    if (!demo) return;

    // Map demo role to real demo credentials
    const credMap = {
      admin:   { email: 'admin@healthcareos.org', password: 'Admin@1234' },
      doctor:  { email: 'sharma@gmail.com',       password: 'Doctor@1234' },
      patient: { email: 'devansh@gmail.com',       password: 'Patient@1234' },
    };

    try {
      await loginWithCredentials(credMap[role].email, credMap[role].password);
    } catch {
      // Fallback to demo mode if API is unavailable (e.g. backend not started)
      setCurrentUser({ ...demo });
    }
  };

  // ── Legacy alias used by Login.jsx ────────────────────────────────────────
  const login = switchRole;

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loginWithCredentials, registerNewPatient, switchRole, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

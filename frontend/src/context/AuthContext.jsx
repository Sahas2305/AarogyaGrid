/**
 * Component: AuthContext
 * Props: children
 * Description: Context provider for managing current user roles (admin, doctor, patient)
 * Used on: App.jsx (wrapper)
 */
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const mockUsers = {
  admin: {
    id: 'A01',
    name: 'Dr. Admin Kumar',
    email: 'admin@healthcareos.org',
    role: 'admin',
    linkedId: 'A01',
    avatarInitials: 'AK',
    department: 'Administration'
  },
  doctor: {
    id: 'D01',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@healthcareos.org',
    role: 'doctor',
    linkedId: 'D01',
    avatarInitials: 'PS',
    department: 'Cardiology'
  },
  patient: {
    id: 'P01',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@gmail.com',
    role: 'patient',
    linkedId: 'P01',
    avatarInitials: 'RM',
    department: null
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedRole = localStorage.getItem('healthcare_role') || 'admin';
    return mockUsers[savedRole] || mockUsers.admin;
  });

  const switchRole = (role) => {
    if (mockUsers[role]) {
      setCurrentUser(mockUsers[role]);
      localStorage.setItem('healthcare_role', role);
    }
  };

  const login = (role) => {
    switchRole(role);
  };

  const logout = () => {
    // Reset to landing/guest state or admin demo
    setCurrentUser(null);
    localStorage.removeItem('healthcare_role');
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

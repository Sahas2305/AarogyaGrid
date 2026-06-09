/**
 * Component Name: Table
 * Props: Standard table/tbody/thead/tr/th/td tags props
 * Description: Modular wrappers providing consistent styling for data tables
 * Used on: ManageDoctors, ManagePatients, AuditLogs, Billing, Triage pages, etc.
 */
import React from 'react';

export const Table = ({ children, className = '', ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-white/8 bg-[#0d2044]/30 backdrop-blur-md">
    <table className={`w-full text-left border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className = '', ...props }) => (
  <thead className={`bg-surface-secondary border-b border-white/8 text-text-secondary text-xs uppercase font-bold tracking-wider ${className}`} {...props}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-white/5 text-sm text-white ${className}`} {...props}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-white/5 transition-colors duration-150 ${className}`} {...props}>
    {children}
  </tr>
);

export const Th = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-4 font-semibold ${className}`} {...props}>
    {children}
  </th>
);

export const Td = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap align-middle text-text-secondary hover:text-white transition-colors ${className}`} {...props}>
    {children}
  </td>
);

export default { Table, Thead, Tbody, Tr, Th, Td };

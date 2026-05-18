import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PendingRegistration {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  course: string;
  yearLevel: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface RegistrationContextType {
  pendingRegistrations: PendingRegistration[];
  submitRegistration: (registration: Omit<PendingRegistration, 'id' | 'status' | 'dateSubmitted'>) => void;
  approveRegistration: (id: string, reviewedBy: string) => void;
  rejectRegistration: (id: string, reviewedBy: string, notes: string) => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const INITIAL_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'reg-001',
    email: 'maria.santos@school.edu',
    fullName: 'Maria Santos',
    studentId: '2024-012345',
    course: 'Computer Science',
    yearLevel: '1st Year',
    phoneNumber: '09123456789',
    dateOfBirth: '2005-03-15',
    address: 'Binalatongan, Pangasinan',
    status: 'pending',
    dateSubmitted: '2026-05-17T10:30:00Z'
  },
  {
    id: 'reg-002',
    email: 'pedro.reyes@school.edu',
    fullName: 'Pedro Reyes',
    studentId: '2024-067890',
    course: 'Information Technology',
    yearLevel: '1st Year',
    phoneNumber: '09187654321',
    dateOfBirth: '2006-07-22',
    address: 'San Carlos City, Pangasinan',
    status: 'pending',
    dateSubmitted: '2026-05-18T08:15:00Z'
  }
];

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>(INITIAL_REGISTRATIONS);

  const submitRegistration = (registration: Omit<PendingRegistration, 'id' | 'status' | 'dateSubmitted'>) => {
    const newRegistration: PendingRegistration = {
      ...registration,
      id: `reg-${Date.now()}`,
      status: 'pending',
      dateSubmitted: new Date().toISOString()
    };
    setPendingRegistrations([newRegistration, ...pendingRegistrations]);
  };

  const approveRegistration = (id: string, reviewedBy: string) => {
    setPendingRegistrations(pendingRegistrations.map(reg =>
      reg.id === id ? { ...reg, status: 'approved' as const, reviewedBy } : reg
    ));
  };

  const rejectRegistration = (id: string, reviewedBy: string, notes: string) => {
    setPendingRegistrations(pendingRegistrations.map(reg =>
      reg.id === id ? { ...reg, status: 'rejected' as const, reviewedBy, reviewNotes: notes } : reg
    ));
  };

  return (
    <RegistrationContext.Provider value={{
      pendingRegistrations,
      submitRegistration,
      approveRegistration,
      rejectRegistration
    }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}

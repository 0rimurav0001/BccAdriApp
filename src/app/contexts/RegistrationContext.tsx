import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

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
  idPhotoUrl?: string;
  password?: string;
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: any;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface RegistrationContextType {
  pendingRegistrations: PendingRegistration[];
  submitRegistration: (registration: Omit<PendingRegistration, 'id' | 'status' | 'dateSubmitted'>) => Promise<void>;
  approveRegistration: (id: string, reviewedBy: string) => Promise<void>;
  rejectRegistration: (id: string, reviewedBy: string, notes: string) => Promise<void>;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'pendingRegistrations'), orderBy('dateSubmitted', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const registrations: PendingRegistration[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        registrations.push({
          id: doc.id,
          ...data,
          dateSubmitted: data.dateSubmitted?.toDate?.()?.toISOString() || new Date().toISOString()
        } as PendingRegistration);
      });
      setPendingRegistrations(registrations);
    });

    return () => unsubscribe();
  }, []);

  const submitRegistration = async (registration: Omit<PendingRegistration, 'id' | 'status' | 'dateSubmitted'>) => {
    try {
      // Sanitize data: remove any 'undefined' fields because Firestore crashes on them
      const sanitizedData = Object.fromEntries(
        Object.entries(registration).filter(([_, v]) => v !== undefined)
      );

      await addDoc(collection(db, 'pendingRegistrations'), {
        ...sanitizedData,
        status: 'pending',
        dateSubmitted: serverTimestamp()
      });
    } catch (error) {
      console.error("Error submitting registration:", error);
      throw error;
    }
  };

  const approveRegistration = async (id: string, reviewedBy: string) => {
    try {
      const regRef = doc(db, 'pendingRegistrations', id);
      await updateDoc(regRef, {
        status: 'approved',
        reviewedBy
      });
    } catch (error) {
      console.error("Error approving registration:", error);
      throw error;
    }
  };

  const rejectRegistration = async (id: string, reviewedBy: string, notes: string) => {
    try {
      const regRef = doc(db, 'pendingRegistrations', id);
      await updateDoc(regRef, {
        status: 'rejected',
        reviewedBy,
        reviewNotes: notes
      });
    } catch (error) {
      console.error("Error rejecting registration:", error);
      throw error;
    }
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

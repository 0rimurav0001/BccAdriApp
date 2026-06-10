import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from './AuthContext';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  query
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { db, auth as primaryAuth, firebaseConfig } from '../firebase';

export interface UserAccount {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentId?: string;
  course?: string;
  yearLevel?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt?: any;
}

interface UserManagementContextType {
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'uid' | 'status'> & { password?: string }) => Promise<void>;
  updateUser: (uid: string, updates: Partial<UserAccount>) => Promise<void>;
  resetPassword: (uid: string, newPassword: string) => Promise<void>;
  suspendUser: (uid: string) => Promise<void>;
  activateUser: (uid: string) => Promise<void>;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserAccount[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: doc.id,
          ...data,
          status: data.status || 'active' // Default to active if status is missing
        } as UserAccount);
      });
      setUsers(usersData);
    }, (error) => {
      console.error("Error in users snapshot:", error);
    });

    return () => unsubscribe();
  }, []);

  const addUser = async (userData: Omit<UserAccount, 'uid' | 'status'> & { password?: string }) => {
    const { password, ...firestoreData } = userData;

    // Sanitize data: Remove undefined fields which crash Firestore
    const cleanData = Object.fromEntries(
      Object.entries(firestoreData).filter(([_, v]) => v !== undefined)
    );

    try {
      if (password) {
        // Use a unique name for the secondary app to prevent "app already exists" errors
        const appName = `Secondary-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = getAuth(secondaryApp);

        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.email, password);

          // Save profile to Firestore using the main db instance
          const profileData = {
            ...cleanData,
            email: userData.email, // Explicitly ensure email is included
            status: 'active',
            createdAt: serverTimestamp()
          };

          await setDoc(doc(db, 'users', userCredential.user.uid), profileData);
          console.log("Firestore profile created for UID:", userCredential.user.uid);

          // Clean up secondary app
          await signOut(secondaryAuth);
          try {
            await deleteApp(secondaryApp);
          } catch (e) {
            console.warn("Error deleting secondary app:", e);
          }
        } catch (err: any) {
          try {
            await deleteApp(secondaryApp);
          } catch (e) {
            // ignore
          }
          // Handle specific Firebase Auth errors for better clarity
          if (err.code === 'auth/email-already-in-use') {
            throw new Error("This email is already registered in the system.");
          }
          throw err;
        }
      } else {
        await addDoc(collection(db, 'users'), {
          ...cleanData,
          status: 'active',
          createdAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      throw error;
    }
  };

  const updateUser = async (uid: string, updates: Partial<UserAccount>) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const resetPassword = async (uid: string, newPassword: string) => {
    alert("Password reset requires Firebase Admin SDK or Console management in this version.");
  };

  const suspendUser = async (uid: string) => {
    await updateUser(uid, { status: 'suspended' });
  };

  const activateUser = async (uid: string) => {
    await updateUser(uid, { status: 'active' });
  };

  return (
    <UserManagementContext.Provider value={{
      users,
      addUser,
      updateUser,
      resetPassword,
      suspendUser,
      activateUser
    }}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
}

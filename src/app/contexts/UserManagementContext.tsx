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
        usersData.push({ uid: doc.id, ...doc.data() } as UserAccount);
      });
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const addUser = async (userData: Omit<UserAccount, 'uid' | 'status'> & { password?: string }) => {
    const { password, ...firestoreData } = userData;

    try {
      if (password) {
        // Use a secondary Firebase app to create the user without signing out the current admin
        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);

        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.email, password);

          // Save profile to Firestore using the main db instance
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...firestoreData,
            status: 'active',
            createdAt: serverTimestamp()
          });

          // Clean up secondary app
          await signOut(secondaryAuth);
          await deleteApp(secondaryApp);

          alert(`Success! User ${userData.fullName} created.`);
        } catch (err) {
          await deleteApp(secondaryApp);
          throw err;
        }
      } else {
        await addDoc(collection(db, 'users'), {
          ...firestoreData,
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

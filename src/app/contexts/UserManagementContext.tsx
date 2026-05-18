import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from './AuthContext';

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
}

interface UserManagementContextType {
  users: UserAccount[];
  addUser: (user: Omit<UserAccount, 'uid' | 'status'>) => void;
  updateUser: (uid: string, updates: Partial<UserAccount>) => void;
  resetPassword: (uid: string, newPassword: string) => void;
  suspendUser: (uid: string) => void;
  activateUser: (uid: string) => void;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

const INITIAL_USERS: UserAccount[] = [
  {
    uid: 'student-001',
    email: 'student@school.edu',
    fullName: 'John Doe',
    role: 'student',
    studentId: '2024-001234',
    course: 'Computer Science',
    yearLevel: '3rd Year',
    status: 'active',
    lastLogin: '2026-05-18T08:30:00Z'
  },
  {
    uid: 'student-002',
    email: 'alice.johnson@school.edu',
    fullName: 'Alice Johnson',
    role: 'student',
    studentId: '2024-005678',
    course: 'Information Technology',
    yearLevel: '2nd Year',
    status: 'active',
    lastLogin: '2026-05-17T14:20:00Z'
  },
  {
    uid: 'student-003',
    email: 'bob.smith@school.edu',
    fullName: 'Bob Smith',
    role: 'student',
    studentId: '2024-009012',
    course: 'Business Administration',
    yearLevel: '4th Year',
    status: 'active',
    lastLogin: '2026-05-16T10:15:00Z'
  },
  {
    uid: 'staff-001',
    email: 'staff@school.edu',
    fullName: 'Jane Smith',
    role: 'staff',
    status: 'active',
    lastLogin: '2026-05-18T09:00:00Z'
  },
  {
    uid: 'admin-001',
    email: 'admin@school.edu',
    fullName: 'Admin User',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-05-18T07:45:00Z'
  }
];

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  const addUser = (userData: Omit<UserAccount, 'uid' | 'status'>) => {
    const newUser: UserAccount = {
      ...userData,
      uid: `user-${Date.now()}`,
      status: 'active'
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (uid: string, updates: Partial<UserAccount>) => {
    setUsers(users.map(user =>
      user.uid === uid ? { ...user, ...updates } : user
    ));
  };

  const resetPassword = (uid: string, newPassword: string) => {
    console.log(`Password reset for user ${uid} to: ${newPassword}`);
    // In a real app, this would call Firebase Authentication API
    // For demo purposes, we just log it
  };

  const suspendUser = (uid: string) => {
    setUsers(users.map(user =>
      user.uid === uid ? { ...user, status: 'suspended' as const } : user
    ));
  };

  const activateUser = (uid: string) => {
    setUsers(users.map(user =>
      user.uid === uid ? { ...user, status: 'active' as const } : user
    ));
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

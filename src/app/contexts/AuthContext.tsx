import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentId?: string;
  course?: string;
  yearLevel?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<string, User> = {
  'student@school.edu': {
    uid: 'student-001',
    email: 'student@school.edu',
    fullName: 'John Doe',
    role: 'student',
    studentId: '2024-001234',
    course: 'Computer Science',
    yearLevel: '3rd Year'
  },
  'staff@school.edu': {
    uid: 'staff-001',
    email: 'staff@school.edu',
    fullName: 'Jane Smith',
    role: 'staff'
  },
  'admin@school.edu': {
    uid: 'admin-001',
    email: 'admin@school.edu',
    fullName: 'Admin User',
    role: 'admin'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email];
    if (mockUser) {
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

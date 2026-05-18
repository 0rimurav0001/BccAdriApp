import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { RegistrationProvider } from './contexts/RegistrationContext';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentPortal } from './components/StudentPortal';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { DocumentationSite } from './components/DocumentationSite';
import { AccountManagement } from './components/AccountManagement';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(
    user?.role === 'student' ? 'portal' : 'dashboard'
  );

  if (!user) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'portal':
        return <StudentPortal />;
      case 'accounts':
        return <AccountManagement />;
      case 'config':
        return <ConfigurationPanel />;
      case 'docs':
        return <DocumentationSite />;
      default:
        return user.role === 'student' ? <StudentPortal /> : <AdminDashboard />;
    }
  };

  return (
    <MainLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <UserManagementProvider>
          <RegistrationProvider>
            <AppContent />
          </RegistrationProvider>
        </UserManagementProvider>
      </DataProvider>
    </AuthProvider>
  );
}
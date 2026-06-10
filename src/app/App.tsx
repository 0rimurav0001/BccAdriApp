import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { RegistrationProvider } from './contexts/RegistrationContext';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { StudentPortal } from './components/StudentPortal';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { DocumentationSite } from './components/DocumentationSite';
import { AccountManagement } from './components/AccountManagement';
import { PermissionDialog } from './components/PermissionDialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { db } from './firebase';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string | null>(null);
  const [showAnyway, setShowAnyway] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);

  // Check if Firebase is configured
  useEffect(() => {
    // Check for the specific real API Key you just pasted
    const realApiKey = "AIzaSyADrmOZUQgwVouwDK8CEPAqQss5nsbtcTA";
    if (db.app.options.apiKey === "YOUR_API_KEY" || db.app.options.apiKey !== realApiKey) {
       // If it doesn't match your real key, we might be running an old build or have a typo
       console.log("Current API Key in use:", db.app.options.apiKey);
    } else {
       setIsFirebaseConfigured(true);
    }
  }, []);

  // Safety timeout: if loading takes more than 3 seconds, show something anyway
  useEffect(() => {
    const timer = setTimeout(() => setShowAnyway(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Update view when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'student') setCurrentView('portal');
      else if (user.role === 'staff') setCurrentView('staff-portal');
      else setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, [user]);

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration Required</h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          Your Firebase API keys are missing. Please update <b>src/app/firebase.ts</b> with your real project keys.
        </p>
        <div className="bg-gray-50 p-4 rounded-2xl w-full text-left font-mono text-xs text-gray-600 mb-6">
          const firebaseConfig = &#123;<br/>
          &nbsp;&nbsp;apiKey: "PASTE_HERE",<br/>
          &nbsp;&nbsp;authDomain: "...",<br/>
          &nbsp;&nbsp;projectId: "..."<br/>
          &#125;;
        </div>
        <p className="text-xs text-gray-400">The app will stay on the logo or loading screen until this is fixed.</p>
      </div>
    );
  }

  if ((isLoading && !showAnyway) || !currentView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-800">BCC Portal</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'staff-portal':
        return <StaffDashboard />;
      case 'profile':
        return <StaffDashboard initialTab="profile" />;
      case 'portal':
        return <StudentPortal />;
      case 'accounts':
        return <AccountManagement />;
      case 'config':
        return <ConfigurationPanel />;
      default:
        if (user.role === 'student') return <StudentPortal />;
        if (user.role === 'staff') return <StaffDashboard />;
        return <AdminDashboard />;
    }
  };

  return (
    <MainLayout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
      <PermissionDialog />
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
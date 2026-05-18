import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu as MenuIcon,
  LayoutDashboard,
  FileText,
  Settings,
  BookOpen,
  LogOut,
  Users,
  X
} from 'lucide-react';
import logoImage from '../../imports/566232972_1315196483738875_3654026512146916988_n.jpg';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function MainLayout({ children, currentView, onNavigate }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isStudent = user?.role === 'student';

  const studentMenuItems = [
    { id: 'portal', label: 'My Portal', icon: FileText },
    { id: 'docs', label: 'Documentation', icon: BookOpen }
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Account Management', icon: Users },
    { id: 'config', label: 'Configuration', icon: Settings },
    { id: 'docs', label: 'Documentation', icon: BookOpen }
  ];

  const menuItems = isStudent ? studentMenuItems : adminMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MenuIcon className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <img src={logoImage} alt="BCC Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                BCC Portal
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'student' ? user.studentId : user?.role.toUpperCase()}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white z-30 shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10">
                    <img src={logoImage} alt="BCC Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">BCC Portal</h2>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'student' ? 'Student' : 'Admin'} Panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                {user?.role === 'student' && (
                  <>
                    <p className="text-xs text-gray-500 mt-1">{user.studentId}</p>
                    <p className="text-xs text-gray-500">
                      {user.course} - {user.yearLevel}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <main>{children}</main>
    </div>
  );
}

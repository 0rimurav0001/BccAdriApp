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
    { id: 'portal', label: 'My Portal', icon: FileText }
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Account Management', icon: Users },
    { id: 'config', label: 'Configuration', icon: Settings }
  ];

  const menuItems = isStudent ? studentMenuItems : adminMenuItems;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 md:py-4 safe-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 -ml-2 hover:bg-gray-100 rounded-xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <img src={logoImage} alt="BCC Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 hidden xs:block">
                BCC Portal
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block mr-2">
              <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'student' ? user.studentId : user?.role.toUpperCase()}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white z-40 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8 pt-safe">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12">
                    <img src={logoImage} alt="BCC Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">BCC Portal</h2>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'student' ? 'Student' : 'Admin'} Panel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <nav className="space-y-2">
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
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all active:scale-[0.98] ${
                        isActive
                          ? 'bg-green-500 text-white shadow-md shadow-green-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 pb-safe">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                  {user?.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-600 font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 overflow-x-hidden pb-safe">
        <div className="max-w-screen-xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

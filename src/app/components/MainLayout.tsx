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
  User as UserIcon,
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
  const isStaff = user?.role === 'staff';

  const studentMenuItems = [
    { id: 'portal', label: 'Portal', icon: FileText }
  ];

  const staffMenuItems = [
    { id: 'staff-portal', label: 'Staff Portal', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserIcon }
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Users', icon: Users },
    { id: 'config', label: 'Config', icon: Settings }
  ];

  const getMenuItems = () => {
    if (isStudent) return studentMenuItems;
    if (isStaff) return staffMenuItems;
    return adminMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      {/* Native-feeling Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20 safe-top">
        <div className="flex items-center justify-between px-4 py-3 md:py-4 h-16 md:h-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 -ml-2 hover:bg-gray-100 rounded-2xl transition-colors active:scale-90 flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6 text-gray-800" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                <img src={logoImage} alt="BCC Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight hidden xs:block">
                BCC Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block mr-2">
              <p className="text-sm font-bold text-gray-900">{user?.fullName}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {user?.role === 'student' ? 'Student' : user?.role === 'staff' ? 'Staff' : 'Administrator'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-3 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all active:scale-90 flex items-center justify-center min-h-[44px] min-w-[44px] text-gray-500"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 transition-opacity animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white z-40 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300 ease-out">
            <div className="p-6 flex-1 overflow-y-auto pt-safe">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                    <img src={logoImage} alt="BCC Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-gray-900 leading-tight">BCC Portal</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {user?.role.toUpperCase()} Edition
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors active:scale-90"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <nav className="space-y-1.5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
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
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all active:scale-[0.96] ${
                        isActive
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 pb-safe">
              <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-black shadow-sm shadow-green-100">
                  {user?.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-gray-900 truncate">{user?.fullName}</p>
                  <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-600 font-bold bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-4">
        <div className="max-w-screen-xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-2 pb-safe z-30 flex items-center justify-around shadow-[0_-8px_30px_rgb(0,0,0,0.04)] rounded-t-[2.5rem]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-75 ${
                isActive ? 'text-green-600 scale-110' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-green-50' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-gray-400 active:scale-75 transition-all"
        >
          <div className="p-2 rounded-xl">
            <MenuIcon className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-0">More</span>
        </button>
      </nav>
    </div>
  );
}

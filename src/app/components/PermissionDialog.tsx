import { useState, useEffect } from 'react';
import { ShieldCheck, Bell, Camera, X } from 'lucide-react';

export function PermissionDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPermissions = localStorage.getItem('hasSeenPermissions');
    if (!hasSeenPermissions) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenPermissions', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BCC Portal</h2>
          <p className="text-gray-500 font-medium mb-8">
            To provide the best experience, we need a few permissions to help you stay updated and manage your documents.
          </p>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Real-time Updates</h3>
                <p className="text-xs text-gray-500 mt-0.5">Get notified instantly when your document status changes or when new updates are available.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Camera Access</h3>
                <p className="text-xs text-gray-500 mt-0.5">Required for scanning QR codes or capturing document photos for verification purposes.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-4 bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all text-base"
          >
            Get Started
          </button>

          <p className="text-[10px] text-gray-400 text-center mt-4 font-medium px-4">
            You can manage these permissions at any time in your device system settings.
          </p>
        </div>
      </div>
    </div>
  );
}

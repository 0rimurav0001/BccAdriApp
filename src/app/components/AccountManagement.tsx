import { useState, useMemo } from 'react';
import { useUserManagement } from '../contexts/UserManagementContext';
import { useRegistration } from '../contexts/RegistrationContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, Key, UserCheck, UserX, Plus, X, Edit, AlertCircle, CheckCircle, XCircle, Eye, ImageIcon, ShieldCheck } from 'lucide-react';

export function AccountManagement() {
  const { users, resetPassword, suspendUser, activateUser, addUser, updateUser } = useUserManagement();
  const { pendingRegistrations, approveRegistration, rejectRegistration } = useRegistration();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'staff' | 'admin'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'staff' | 'students' | 'pending'>('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewIdDialogOpen, setViewIdDialogOpen] = useState(false);
  const [selectedIdPhoto, setSelectedIdPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'student' as 'student' | 'staff' | 'admin',
    password: '',
    studentId: '',
    course: '',
    yearLevel: ''
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [selectedRegForId, setSelectedRegForId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => {
    const fullName = u.fullName || '';
    const email = u.email || '';
    const studentId = u.studentId || '';
    const role = u.role || '';

    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         role.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesRole = true;
    if (activeTab === 'staff') {
       matchesRole = u.role === 'staff' || u.role === 'admin';
    } else if (activeTab === 'students') {
       matchesRole = u.role === 'student';
    } else {
       matchesRole = filterRole === 'all' || u.role === filterRole;
    }
    return matchesSearch && matchesRole;
  });

  const handleResetPassword = () => {
    if (selectedUser && newPassword) {
      resetPassword(selectedUser, newPassword);
      setResetDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('Password reset successfully!');
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.fullName || !formData.role || !formData.password) {
      alert("Please fill in all required fields (Email, Name, Role, and Password).");
      return;
    }
    try {
      const roleValue = formData.role.toLowerCase();
      const userPayload: any = {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        role: roleValue,
        password: formData.password
      };
      if (roleValue === 'student') {
        if (!formData.studentId || !formData.course || !formData.yearLevel) {
           alert("Academic details are required for student accounts.");
           return;
        }
        userPayload.studentId = formData.studentId.trim();
        userPayload.course = formData.course.trim();
        userPayload.yearLevel = formData.yearLevel.trim();
      }
      await addUser(userPayload);
      setAddUserDialogOpen(false);
      setFormData({
        email: '', fullName: '', role: 'student', password: '', studentId: '', course: '', yearLevel: ''
      });
      alert(`Account successfully created for ${userPayload.fullName}!`);
    } catch (error: any) {
      alert(`SYSTEM ERROR: ${error.message}`);
    }
  };

  const handleEditUser = () => {
    if (selectedUser && formData.fullName) {
      updateUser(selectedUser, {
        fullName: formData.fullName,
        studentId: formData.role === 'student' ? formData.studentId : undefined,
        course: formData.role === 'student' ? formData.course : undefined,
        yearLevel: formData.role === 'student' ? formData.yearLevel : undefined
      });
      setEditDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const openEditDialog = (userId: string) => {
    const userToEdit = users.find(u => u.uid === userId);
    if (userToEdit) {
      setSelectedUser(userId);
      setFormData({
        email: userToEdit.email,
        fullName: userToEdit.fullName,
        role: userToEdit.role,
        studentId: userToEdit.studentId || '',
        course: userToEdit.course || '',
        yearLevel: userToEdit.yearLevel || '',
        password: ''
      });
      setEditDialogOpen(true);
    }
  };

  const sortedUsers = useMemo(() => {
    const baseList = [...filteredUsers];
    return baseList.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      if (a.role === 'staff' && b.role === 'student') return -1;
      if (a.role === 'student' && b.role === 'staff') return 1;
      return (a.fullName || '').toLowerCase().localeCompare((b.fullName || '').toLowerCase());
    });
  }, [filteredUsers]);

  const studentCount = users.filter(u => u.role === 'student').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const pendingCount = pendingRegistrations.filter(r => r.status === 'pending').length;

  const handleApproveRegistration = async (regId: string) => {
    const registration = pendingRegistrations.find(r => r.id === regId);
    if (registration && user) {
      try {
        if (!registration.password) throw new Error("Password missing.");
        await addUser({
          email: registration.email,
          fullName: registration.fullName,
          role: 'student',
          password: registration.password,
          studentId: registration.studentId,
          course: registration.course,
          yearLevel: registration.yearLevel
        });
        await approveRegistration(regId, user.fullName);
        alert(`Account created for ${registration.fullName}!`);
      } catch (error: any) {
        alert(`Failed: ${error.message}`);
      }
    }
  };

  const openIdView = (registrationId: string, photoUrl?: string) => {
    if (photoUrl) {
      setSelectedIdPhoto(photoUrl);
      setSelectedRegForId(registrationId);
      setViewIdDialogOpen(true);
    } else {
      alert("No ID photo provided.");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and reset passwords</p>
        </div>
        <button
          onClick={() => setAddUserDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Total Users</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Pending</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Staff / Admin</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{staffCount + adminCount}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Active</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{activeCount}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
            {['all', 'staff', 'students'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'staff' ? 'Staff' : 'Students'}
              </button>
            ))}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedUsers.map((userAccount) => (
            <div key={userAccount.uid} className="p-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] hover:bg-white hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="font-black text-gray-900 tracking-tight">{userAccount.fullName}</h4>
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-green-100 text-green-700">
                      {userAccount.role}
                    </span>
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-blue-50 text-blue-700">
                      {userAccount.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 truncate">{userAccount.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditDialog(userAccount.uid)} className="p-3 bg-white border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-50"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => { setSelectedUser(userAccount.uid); setResetDialogOpen(true); }} className="p-3 bg-white border border-gray-100 text-green-600 rounded-xl hover:bg-green-50"><Key className="w-5 h-5" /></button>
                  <button onClick={() => userAccount.status === 'active' ? suspendUser(userAccount.uid) : activateUser(userAccount.uid)} className={`p-3 bg-white border border-gray-100 ${userAccount.status === 'active' ? 'text-red-600' : 'text-green-600'} rounded-xl`}>
                    {userAccount.status === 'active' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {addUserDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <div className="space-y-4">
              <input type="email" placeholder="Email" className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="Full Name" className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <select className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <input type="password" placeholder="Password" className="w-full p-3 bg-gray-50 border rounded-xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <div className="flex gap-3">
                <button onClick={() => setAddUserDialogOpen(false)} className="flex-1 p-3 bg-gray-100 rounded-xl">Cancel</button>
                <button onClick={handleAddUser} className="flex-1 p-3 bg-green-500 text-white rounded-xl">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resetDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reset Password</h3>
            <input type="text" placeholder="New Password" className="w-full p-3 bg-gray-50 border rounded-xl mb-4" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setResetDialogOpen(false)} className="flex-1 p-3 bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleResetPassword} className="flex-1 p-3 bg-green-500 text-white rounded-xl">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

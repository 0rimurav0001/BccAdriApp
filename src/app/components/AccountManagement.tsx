import { useState } from 'react';
import { useUserManagement } from '../contexts/UserManagementContext';
import { useRegistration } from '../contexts/RegistrationContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, Key, UserCheck, UserX, Plus, X, Edit, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export function AccountManagement() {
  const { users, resetPassword, suspendUser, activateUser, addUser, updateUser } = useUserManagement();
  const { pendingRegistrations, approveRegistration, rejectRegistration } = useRegistration();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'staff' | 'admin'>('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'student' as 'student' | 'staff' | 'admin',
    studentId: '',
    course: '',
    yearLevel: ''
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-sm text-red-700">
            Account management is only accessible to admin and staff accounts.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
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

  const handleAddUser = () => {
    if (formData.email && formData.fullName && formData.role) {
      addUser({
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        studentId: formData.role === 'student' ? formData.studentId : undefined,
        course: formData.role === 'student' ? formData.course : undefined,
        yearLevel: formData.role === 'student' ? formData.yearLevel : undefined
      });
      setAddUserDialogOpen(false);
      setFormData({
        email: '',
        fullName: '',
        role: 'student',
        studentId: '',
        course: '',
        yearLevel: ''
      });
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
        yearLevel: userToEdit.yearLevel || ''
      });
      setEditDialogOpen(true);
    }
  };

  const studentCount = users.filter(u => u.role === 'student').length;
  const staffCount = users.filter(u => u.role === 'staff' || u.role === 'admin').length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const pendingCount = pendingRegistrations.filter(r => r.status === 'pending').length;

  const handleApproveRegistration = (regId: string) => {
    const registration = pendingRegistrations.find(r => r.id === regId);
    if (registration && user) {
      // Create the user account
      addUser({
        email: registration.email,
        fullName: registration.fullName,
        role: 'student',
        studentId: registration.studentId,
        course: registration.course,
        yearLevel: registration.yearLevel
      });
      // Mark registration as approved
      approveRegistration(regId, user.fullName);
      alert(`Account created for ${registration.fullName}!`);
    }
  };

  const handleRejectRegistration = () => {
    if (selectedRegistration && user) {
      rejectRegistration(selectedRegistration, user.fullName, rejectionNotes);
      setReviewDialogOpen(false);
      setSelectedRegistration(null);
      setRejectionNotes('');
      alert('Registration rejected');
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
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{studentCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pending Registrations</h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg">
              {pendingCount} New
            </span>
          </div>
          <div className="space-y-3">
            {pendingRegistrations
              .filter(reg => reg.status === 'pending')
              .map((registration) => (
                <div key={registration.id} className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{registration.fullName}</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg">
                          NEW
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span> {registration.email}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Student ID:</span> {registration.studentId}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Course:</span> {registration.course}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Year:</span> {registration.yearLevel}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Phone:</span> {registration.phoneNumber}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">DOB:</span> {new Date(registration.dateOfBirth).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 md:col-span-3">
                          <span className="font-medium">Address:</span> {registration.address}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(registration.dateSubmitted).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRegistration(registration.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                        title="Approve & Create Account"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRegistration(registration.id);
                          setReviewDialogOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                        title="Reject Registration"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((userAccount) => (
            <div key={userAccount.uid} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{userAccount.fullName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      userAccount.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      userAccount.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {userAccount.role.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      userAccount.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {userAccount.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{userAccount.email}</p>
                  {userAccount.studentId && (
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>ID: {userAccount.studentId}</span>
                      <span>{userAccount.course}</span>
                      <span>{userAccount.yearLevel}</span>
                    </div>
                  )}
                  {userAccount.lastLogin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last login: {new Date(userAccount.lastLogin).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditDialog(userAccount.uid)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(userAccount.uid);
                      setResetDialogOpen(true);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Reset Password"
                  >
                    <Key className="w-4 h-4 text-green-600" />
                  </button>
                  {userAccount.status === 'active' ? (
                    <button
                      onClick={() => suspendUser(userAccount.uid)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Suspend User"
                    >
                      <UserX className="w-4 h-4 text-red-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => activateUser(userAccount.uid)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Activate User"
                    >
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resetDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              <button
                onClick={() => setResetDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-sm text-blue-700">
                  You are resetting the password for:{' '}
                  <span className="font-semibold">
                    {users.find(u => u.uid === selectedUser)?.fullName}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setResetDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={!newPassword}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addUserDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setAddUserDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="user@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="2024-001234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                    <input
                      type="text"
                      value={formData.yearLevel}
                      onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="3rd Year"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAddUserDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => setEditDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read Only)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                    <input
                      type="text"
                      value={formData.yearLevel}
                      onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reject Registration</h3>
              <button
                onClick={() => setReviewDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-700">
                  You are rejecting the registration for:{' '}
                  <span className="font-semibold">
                    {pendingRegistrations.find(r => r.id === selectedRegistration)?.fullName}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setReviewDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectRegistration}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

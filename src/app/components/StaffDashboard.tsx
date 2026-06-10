import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData, DocumentRequest } from '../contexts/DataContext';
import { useUserManagement } from '../contexts/UserManagementContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Search,
  ArrowUpDown,
  ChevronRight,
  User as UserIcon,
  Calendar,
  IdCard,
  Mail,
  MoreVertical,
  Filter,
  DollarSign,
  Edit2,
  Save,
  X as CloseIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';

type TabType = 'overview' | 'requests' | 'profile';
type SortField = 'urgency' | 'revenue' | 'docType' | 'docName' | 'date';

interface StaffDashboardProps {
  initialTab?: TabType;
}

export function StaffDashboard({ initialTab = 'overview' }: StaffDashboardProps) {
  const { user } = useAuth();
  const { requests, updateRequestStatus, uploadProcessedDocument } = useData();
  const { updateUser } = useUserManagement();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentRequest['status'] | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortFieldOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditName] = useState(user?.fullName || '');
  const [editedPosition, setEditedPosition] = useState(user?.role || '');
  const [editedEmployeeId, setEditedEmployeeId] = useState(user?.studentId || ''); // Using studentId field for employee ID in context
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Summary counts
  const stats = useMemo(() => {
    return {
      pending: requests.filter(r => r.status === 'Pending').length,
      processing: requests.filter(r => r.status === 'Processing').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      ready: requests.filter(r => r.status === 'Ready for Download').length,
      revenue: requests.filter(r => r.status !== 'Rejected').reduce((acc, r) => acc + r.fee, 0)
    };
  }, [requests]);

  // Filtering and Sorting
  const filteredRequests = useMemo(() => {
    let result = requests.filter(req => {
      const matchesSearch = req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           req.documentTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           req.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'revenue':
          comparison = a.fee - b.fee;
          break;
        case 'docType':
          comparison = a.documentTypeName.localeCompare(b.documentTypeName);
          break;
        case 'docName':
          comparison = a.requesterName.localeCompare(b.requesterName);
          break;
        case 'urgency':
          // Simple logic: Pending > Processing > Approved
          const priority: Record<string, number> = { 'Pending': 3, 'Processing': 2, 'Approved': 1, 'Ready for Download': 0, 'Rejected': 0 };
          comparison = priority[a.status] - priority[b.status];
          break;
        case 'date':
        default:
          comparison = new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [requests, searchQuery, statusFilter, sortField, sortOrder]);

  const handleFileUpload = async (requestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingId(requestId);
      await uploadProcessedDocument(requestId, file, user.uid, user.fullName);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error("Upload error:", error);
      alert('Failed to upload document.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateUser(user.uid, {
        fullName: editedName,
        studentId: editedEmployeeId // Map employee id to studentId field for now
      });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(null);
    const file = e.dataTransfer.files[0];
    if (file && user) {
      try {
        setUploadingId(id);
        await uploadProcessedDocument(id, file, user.uid, user.fullName);
        alert('Document uploaded successfully!');
      } catch (error) {
        alert('Failed to upload document.');
      } finally {
        setUploadingId(null);
      }
    }
  };

  const navigateToStatus = (status: DocumentRequest['status']) => {
    setStatusFilter(status);
    setActiveTab('requests');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Ready for Download': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Portal</h1>
          <p className="text-sm text-slate-500 font-medium">Binalatongan Community College</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['overview', 'requests', 'profile'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Greeting */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">Hello, {user?.fullName.split(' ')[0]}!</h2>
                <p className="text-green-50 opacity-90 max-w-md font-medium">
                  You have <span className="underline decoration-white underline-offset-4 font-bold">{stats.pending} pending requests</span> to review today.
                </p>
              </div>
              <FileText className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-10 rotate-12" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigateToStatus('Pending')}
                className="group text-left"
              >
                <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-slate-200 group-hover:ring-amber-500 overflow-hidden">
                  <div className="h-1 w-full bg-amber-500" />
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">PENDING</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.pending}</h3>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>

              <button
                onClick={() => navigateToStatus('Processing')}
                className="group text-left"
              >
                <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-500 overflow-hidden">
                  <div className="h-1 w-full bg-blue-500" />
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">PROCESSING</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.processing}</h3>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                        <Clock className="w-5 h-5 animate-spin-slow" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>

              <button
                onClick={() => navigateToStatus('Approved')}
                className="group text-left"
              >
                <Card className="hover:shadow-md transition-all border-none shadow-sm ring-1 ring-slate-200 group-hover:ring-emerald-500 overflow-hidden">
                  <div className="h-1 w-full bg-emerald-500" />
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">APPROVED</p>
                        <h3 className="text-3xl font-black text-slate-900">{stats.approved}</h3>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>

              <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="h-1 w-full bg-slate-800" />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">TOTAL REVENUE</p>
                      <h3 className="text-3xl font-black text-slate-900">₱{stats.revenue}</h3>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-700">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Mini List */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black">Recent Requests</CardTitle>
                  <CardDescription className="font-medium">The latest document submissions</CardDescription>
                </div>
                <Button variant="ghost" className="text-green-600 font-bold" onClick={() => setActiveTab('requests')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.slice(0, 5).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-white ring-1 ring-slate-100 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{req.documentTypeName}</p>
                          <p className="text-xs text-slate-500 font-medium">{req.requesterName} • {new Date(req.dateSubmitted).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(req.status)} border-none font-bold rounded-lg px-2 py-1`}>
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters & Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search students or documents..."
                  className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="lg:col-span-8 flex flex-wrap gap-2">
                <div className="flex items-center space-x-2 mr-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Status:</span>
                </div>
                {['All', 'Pending', 'Processing', 'Approved', 'Ready for Download'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      statusFilter === status
                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* List Header / Sorters */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 rounded-xl">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-black text-slate-500 uppercase">Sort by:</span>
                {(['urgency', 'revenue', 'docType', 'docName', 'date'] as SortField[]).map(field => (
                  <button
                    key={field}
                    onClick={() => {
                      if (sortField === field) setSortFieldOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortField(field); setSortFieldOrder('desc'); }
                    }}
                    className={`flex items-center space-x-1 text-xs font-bold transition-colors ${
                      sortField === field ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                    {sortField === field && <ArrowUpDown className="w-3 h-3" />}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500">{filteredRequests.length} results found</p>
            </div>

            {/* Requests List */}
            <div className="space-y-4 pb-20">
              {filteredRequests.map((req) => (
                <Card
                  key={req.id}
                  className={`border-none shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-all rounded-3xl overflow-hidden group ${dragOverId === req.id ? 'ring-2 ring-green-500 bg-green-50/30' : ''}`}
                  onDragOver={(e) => handleDragOver(e, req.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, req.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Status side indicator */}
                    <div className={`w-2 md:w-3 self-stretch ${
                      req.status === 'Pending' ? 'bg-amber-500' :
                      req.status === 'Processing' ? 'bg-blue-500' :
                      req.status === 'Approved' ? 'bg-emerald-500' :
                      req.status === 'Ready for Download' ? 'bg-purple-500' : 'bg-rose-500'
                    }`} />

                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                      {/* Left: Request Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getStatusColor(req.status)} border-none font-bold rounded-lg uppercase text-[10px]`}>
                            {req.status}
                          </Badge>
                          <span className="text-xs font-bold text-slate-400">#{req.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 group-hover:text-green-600 transition-colors">
                          {req.documentTypeName}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                          <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {req.requesterName}</span>
                          <span className="flex items-center gap-1"><IdCard className="w-3 h-3" /> {req.studentId || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(req.dateSubmitted).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Middle: Fee */}
                      <div className="md:w-24 text-center md:border-x border-slate-100 px-4">
                        <p className="text-xs font-black text-slate-400 uppercase mb-1">Fee</p>
                        <p className="text-xl font-black text-slate-900">₱{req.fee}</p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        {req.status === 'Pending' && (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold px-6"
                            onClick={() => updateRequestStatus(req.id, 'Processing', user!.uid, user!.fullName)}
                          >
                            Start Processing
                          </Button>
                        )}
                        {req.status === 'Processing' && (
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold px-6"
                            onClick={() => updateRequestStatus(req.id, 'Approved', user!.uid, user!.fullName)}
                          >
                            Mark Approved
                          </Button>
                        )}
                        {req.status === 'Approved' && (
                          <div className="relative group/upload flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-2xl transition-all ${dragOverId === req.id ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}>
                              <Upload className={`w-4 h-4 ${dragOverId === req.id ? 'text-green-600 animate-bounce' : 'text-slate-400'}`} />
                              <span className="text-[10px] font-black text-slate-400 uppercase hidden lg:block">Drop File Here</span>
                            </div>
                            <div className="relative">
                              <Button
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50 rounded-2xl font-bold px-6 h-11"
                                disabled={uploadingId === req.id}
                                aria-label={`Upload document for ${req.requesterName}`}
                              >
                                {uploadingId === req.id ? 'Uploading...' : 'Upload'}
                              </Button>
                              <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(req.id, e)}
                                disabled={uploadingId === req.id}
                              />
                            </div>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl ring-1 ring-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No requests found</h3>
                  <p className="text-slate-500 font-medium">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-3xl overflow-hidden bg-white">
              <div className="h-32 bg-gradient-to-r from-green-500 to-green-700" />
              <CardContent className="relative pt-0 px-8 pb-8">
                {/* Avatar Overlay */}
                <div className="absolute -top-12 left-8 w-24 h-24 rounded-3xl bg-white p-1 shadow-lg ring-1 ring-slate-100">
                  <div className="w-full h-full rounded-[20px] bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserIcon className="w-12 h-12" />
                  </div>
                </div>

                <div className="pt-16 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {isEditingProfile ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                            <Input
                              value={editedName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-12 rounded-2xl border-slate-200 focus:ring-green-500 font-bold"
                              placeholder="Full Name"
                              aria-label="Edit Full Name"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-black text-slate-900">{user?.fullName}</h3>
                          <p className="text-green-600 font-black uppercase tracking-widest text-xs">Staff Member</p>
                        </>
                      )}
                    </div>
                    {!isEditingProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-slate-400 hover:text-green-600"
                        onClick={() => setIsEditingProfile(true)}
                        aria-label="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Employee ID</p>
                      {isEditingProfile ? (
                        <Input
                          value={editedEmployeeId}
                          onChange={(e) => setEditedEmployeeId(e.target.value)}
                          className="h-8 p-0 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold text-slate-900"
                          placeholder="Employee ID"
                          aria-label="Edit Employee ID"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-slate-900">
                          <IdCard className="w-4 h-4 text-green-600" />
                          <span className="font-bold">{user?.studentId || `EMP-${user?.uid.slice(0, 8).toUpperCase()}`}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 opacity-60">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address (Read-only)</p>
                      <div className="flex items-center space-x-2 text-slate-900">
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="font-bold">{user?.email}</span>
                      </div>
                    </div>

                    <div className="space-y-1 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date of Birth</p>
                      <div className="flex items-center space-x-2 text-slate-900">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-bold">January 15, 1985</span> {/* Mock data since it\u0027s not in the interface yet */}
                      </div>
                    </div>

                    <div className="space-y-1 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Department</p>
                      {isEditingProfile ? (
                         <div className="flex items-center space-x-2 text-slate-900 font-bold">
                            {user?.role.toUpperCase()}
                         </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-slate-900">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-bold">Registrar's Office</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="pt-4 flex gap-4 animate-in fade-in zoom-in-95 duration-200">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold h-12 shadow-lg shadow-green-100"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-slate-200 text-slate-500 font-bold h-12 px-6"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditName(user?.fullName || '');
                          setEditedEmployeeId(user?.studentId || '');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-3xl overflow-hidden bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-black">Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">Two-Factor Authentication</p>
                      <p className="text-xs font-medium text-amber-700">Recommended for enhanced security</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

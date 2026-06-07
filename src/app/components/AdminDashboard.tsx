import { useState, useMemo, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, CheckCircle, TrendingUp, X, Upload, Loader2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'Pending': 'bg-orange-100 text-orange-700',
  'Processing': 'bg-blue-100 text-blue-700',
  'Approved': 'bg-green-100 text-green-700',
  'Ready for Download': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700'
};

const CHART_COLORS = ['#22C55E', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

export function AdminDashboard() {
  const { requests, updateRequestStatus, uploadProcessedDocument } = useData();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-sm text-red-700">
            This dashboard is only accessible to admin and staff accounts.
          </p>
        </div>
      </div>
    );
  }

  const { statusCounts, totalRevenue } = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const revenue = requests
      .filter(r => r.status !== 'Rejected')
      .reduce((sum, r) => sum + r.fee, 0);

    return { statusCounts: counts, totalRevenue: revenue };
  }, [requests]);

  const { pieData, barData } = useMemo(() => {
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      id: `status-${name.replace(/\s/g, '-').toLowerCase()}`
    }));

    const documentTypeCounts = requests.reduce((acc, req) => {
      acc[req.documentTypeName] = (acc[req.documentTypeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(documentTypeCounts).map(([name, count]) => ({
      name,
      count,
      id: `doctype-${name.replace(/\s/g, '-').toLowerCase()}`
    }));

    return { pieData, barData };
  }, [statusCounts, requests]);

  const handleUpdateStatus = async () => {
    if (selectedRequest && newStatus && user) {
      await updateRequestStatus(selectedRequest, newStatus as any, user.uid, user.fullName, notes);
      setDialogOpen(false);
      setSelectedRequest(null);
      setNewStatus('');
      setNotes('');
    }
  };

  const handleFileUpload = async (requestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      try {
        await uploadProcessedDocument(requestId, file, user.uid, user.fullName);
        alert('Document uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload document.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Manage document requests and view analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Total Requests</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{requests.length}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center self-end md:self-auto">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Pending</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">{statusCounts['Pending'] || 0}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center self-end md:self-auto">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Completed</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                {statusCounts['Ready for Download'] || 0}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center self-end md:self-auto">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-tight">Revenue</p>
              <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                ₱{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center self-end md:self-auto">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Document Type</h3>
          <div className="space-y-3">
            {barData.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-24 text-sm text-gray-700 truncate">{item.name}</div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-green-500 flex items-center justify-end px-2"
                      style={{ width: `${(item.count / Math.max(...barData.map(d => d.count))) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {pieData.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Requests</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{request.requesterName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${STATUS_STYLES[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{request.documentTypeName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{request.id.split('-')[0]}...</span>
                    <span>{request.studentId}</span>
                    <span>{new Date(request.dateSubmitted).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-700">₱{request.fee}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${request.id}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(request.id, e)}
                      accept=".pdf,.doc,.docx,image/*"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor={`file-${request.id}`}
                      className={`flex items-center gap-2 px-4 py-2 ${
                        request.downloadUrl ? 'bg-blue-50 text-blue-600' : 'bg-green-500 text-white'
                      } hover:opacity-90 text-sm rounded-xl transition-all cursor-pointer font-bold`}
                    >
                      {isUploading && selectedRequest === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {request.downloadUrl ? 'Update File' : 'Upload'}
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRequest(request.id);
                      setNewStatus(request.status);
                      setDialogOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
                  >
                    Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Request Status</h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Ready for Download">Ready for Download</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Add any notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, Clock, CheckCircle, Plus, X } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'Pending': 'bg-orange-100 text-orange-700',
  'Processing': 'bg-blue-100 text-blue-700',
  'Approved': 'bg-green-100 text-green-700',
  'Ready for Download': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700'
};

export function StudentPortal() {
  const { documentTypes, requests, submitRequest } = useData();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');

  const myRequests = requests.filter(r => r.requesterUid === user?.uid);

  const handleSubmitRequest = () => {
    if (selectedDocType && user) {
      const docType = documentTypes.find(dt => dt.id === selectedDocType);
      if (docType) {
        submitRequest({
          requesterUid: user.uid,
          requesterName: user.fullName,
          studentId: user.studentId,
          documentTypeId: docType.id,
          documentTypeName: docType.docName,
          fee: docType.fee
        });
        setDialogOpen(false);
        setSelectedDocType('');
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Student Portal</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Request and track documents</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden xs:inline">New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Total Requests</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{myRequests.length}</p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">In Progress</p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {myRequests.filter(r => ['Pending', 'Processing', 'Approved'].includes(r.status)).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/50 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Ready for Pickup</p>
              <p className="text-3xl font-black text-gray-900 mt-2">
                {myRequests.filter(r => r.status === 'Ready for Download').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100/50">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-green-500 rounded-full" />
          Available Documents
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documentTypes.map((docType) => (
            <div key={docType.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] hover:border-green-200 transition-colors group">
              <h4 className="font-bold text-gray-900 text-base">{docType.docName}</h4>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Fee</span>
                  <span className="text-gray-900 font-bold">₱{docType.fee}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Processing Time</span>
                  <span className="text-gray-900 font-bold">{docType.processingDays} days</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-3 leading-relaxed">
                  Prerequisites: <span className="text-gray-600">{docType.prerequisites.join(', ')}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100/50">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-green-500 rounded-full" />
          My Recent Activity
        </h3>
        {myRequests.length === 0 ? (
          <div className="py-12 px-6 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-500">
              No active requests found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Start by clicking "New Request" above
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((request) => (
              <div key={request.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] transition-all hover:bg-white hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 truncate">{request.documentTypeName}</h4>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${STATUS_STYLES[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(request.dateSubmitted).toLocaleDateString()}
                      </p>
                      <p className="text-gray-300">|</p>
                      <p className="font-bold text-gray-700">₱{request.fee}</p>
                      <p className="text-gray-300">|</p>
                      <p className="font-mono">{request.id.split('-')[0]}...</p>
                    </div>
                  </div>
                  {request.status === 'Ready for Download' && (
                    <a
                      href={request.downloadUrl}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all min-h-[48px] text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Get Document
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submit New Request</h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Document Type
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose a document...</option>
                  {documentTypes.map((docType) => (
                    <option key={docType.id} value={docType.id}>
                      {docType.docName} - ₱{docType.fee}
                    </option>
                  ))}
                </select>
              </div>
              {selectedDocType && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700">
                    Prerequisites: {documentTypes.find(dt => dt.id === selectedDocType)?.prerequisites.join(', ')}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!selectedDocType}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Student Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Request and track your academic documents</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{myRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {myRequests.filter(r => ['Pending', 'Processing', 'Approved'].includes(r.status)).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ready</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {myRequests.filter(r => r.status === 'Ready for Download').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentTypes.map((docType) => (
            <div key={docType.id} className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900">{docType.docName}</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Fee: ₱{docType.fee}</p>
                <p className="text-sm text-gray-600">Processing: {docType.processingDays} days</p>
                <p className="text-xs text-gray-500 mt-2">
                  Prerequisites: {docType.prerequisites.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Requests</h3>
        {myRequests.length === 0 ? (
          <div className="p-8 text-center bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600">
              You haven't submitted any requests yet. Click "New Request" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => (
              <div key={request.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{request.documentTypeName}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${STATUS_STYLES[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{request.id}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-gray-600">
                        {new Date(request.dateSubmitted).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">₱{request.fee}</p>
                    </div>
                  </div>
                  {request.status === 'Ready for Download' && (
                    <a
                      href={request.downloadUrl}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
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

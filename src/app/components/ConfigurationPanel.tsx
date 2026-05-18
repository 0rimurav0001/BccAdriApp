import { useState } from 'react';
import { useData, DocumentType } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Settings, Trash2, Edit, X } from 'lucide-react';

export function ConfigurationPanel() {
  const { documentTypes, addDocumentType, updateDocumentType, deleteDocumentType } = useData();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    docName: '',
    fee: '',
    processingDays: '',
    prerequisites: ''
  });

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-sm text-red-700">
            Configuration panel is only accessible to admin and staff accounts.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenDialog = (docType?: DocumentType) => {
    if (docType) {
      setEditingId(docType.id);
      setFormData({
        docName: docType.docName,
        fee: docType.fee.toString(),
        processingDays: docType.processingDays.toString(),
        prerequisites: docType.prerequisites.join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({
        docName: '',
        fee: '',
        processingDays: '',
        prerequisites: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const prerequisites = formData.prerequisites
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const docTypeData = {
      docName: formData.docName,
      fee: parseFloat(formData.fee),
      processingDays: parseInt(formData.processingDays),
      prerequisites
    };

    if (editingId) {
      updateDocumentType(editingId, docTypeData);
    } else {
      addDocumentType(docTypeData);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document type?')) {
      deleteDocumentType(id);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration Panel</h2>
          <p className="text-sm text-gray-500 mt-1">Manage document types, fees, and prerequisites</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Document Type</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Document Types</h3>
        </div>
        <div className="space-y-3">
          {documentTypes.map((docType) => (
            <div key={docType.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{docType.docName}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>₱{docType.fee}</span>
                    <span>{docType.processingDays} days</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docType.prerequisites.map((prereq, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white text-xs text-gray-600 rounded-lg border border-gray-200">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDialog(docType)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(docType.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Total Document Types</p>
            <p className="text-3xl font-semibold text-green-600 mt-2">{documentTypes.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Average Processing Time</p>
            <p className="text-3xl font-semibold text-green-600 mt-2">
              {Math.round(
                documentTypes.reduce((sum, dt) => sum + dt.processingDays, 0) /
                documentTypes.length
              )} days
            </p>
          </div>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Document Type' : 'Add Document Type'}
              </h3>
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
                  Document Name
                </label>
                <input
                  type="text"
                  value={formData.docName}
                  onChange={(e) => setFormData({ ...formData, docName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Official Transcript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee (₱)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Days
                </label>
                <input
                  type="number"
                  value={formData.processingDays}
                  onChange={(e) => setFormData({ ...formData, processingDays: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Clearance, Valid ID, Photo"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple prerequisites with commas</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

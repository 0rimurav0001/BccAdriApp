import { useState } from 'react';
import { useData, DocumentType } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Settings, Trash2, Edit, X, Database, Loader2, CheckCircle } from 'lucide-react';

export function ConfigurationPanel() {
  const { documentTypes, addDocumentType, updateDocumentType, deleteDocumentType, seedDocumentTypes } = useData();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
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

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDocumentTypes();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (error) {
      console.error("Seeding failed:", error);
      alert("Failed to seed database.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration Panel</h2>
          <p className="text-sm text-gray-500 mt-1">Manage document types, fees, and prerequisites</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Document Type</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">Document Types</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Services: {documentTypes.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          {documentTypes.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No document types defined.</p>
              <p className="text-xs text-gray-300">Use the Seed Data utility below or add one manually.</p>
            </div>
          ) : (
            documentTypes.map((docType) => (
              <div key={docType.id} className="p-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] hover:bg-white hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 tracking-tight mb-2 truncate">{docType.docName}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">₱{docType.fee}</span>
                      <span>|</span>
                      <span>{docType.processingDays} Days</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {docType.prerequisites.map((prereq, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white text-[9px] font-bold text-gray-500 rounded-full border border-gray-100 shadow-sm">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDialog(docType)}
                      className="p-3 bg-white border border-gray-100 text-blue-600 rounded-xl shadow-sm hover:bg-blue-50 transition-all active:scale-90"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(docType.id)}
                      className="p-3 bg-white border border-gray-100 text-red-600 rounded-xl shadow-sm hover:bg-red-50 transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">System Status</h3>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] md:text-sm text-gray-500 uppercase font-bold tracking-tight">Doc Types</p>
              <p className="text-2xl md:text-3xl font-black text-green-600 mt-1">{documentTypes.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] md:text-sm text-gray-500 uppercase font-bold tracking-tight">Avg Days</p>
              <p className="text-2xl md:text-3xl font-black text-green-600 mt-1">
                {documentTypes.length > 0 ? Math.round(
                  documentTypes.reduce((sum, dt) => sum + dt.processingDays, 0) /
                  documentTypes.length
                ) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" /> Database Maintenance
          </h3>
          <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest leading-relaxed">
            Synchronize and initialize default document types to your Firebase instance.
          </p>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 ${
              seedSuccess
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 shadow-sm'
            }`}
          >
            {isSeeding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : seedSuccess ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            {isSeeding ? 'Syncing...' : seedSuccess ? 'Sync Complete!' : 'Sync Default Doc Types'}
          </button>
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

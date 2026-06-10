import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserManagement } from '../contexts/UserManagementContext';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  Plus,
  X,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Calendar,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Edit2,
  Save,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

const STATUS_STYLES: Record<string, string> = {
  'Pending': 'bg-orange-50 text-orange-600 border-orange-100',
  'Processing': 'bg-blue-50 text-blue-600 border-blue-100',
  'Approved': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Ready for Download': 'bg-green-500 text-white border-green-600',
  'Rejected': 'bg-red-50 text-red-600 border-red-100'
};

const DOC_ICONS: Record<string, any> = {
  'Transcript': FileText,
  'Certificate': Sparkles,
  'Diploma': CheckCircle,
  'ID': CreditCard,
  'Clearance': ShieldCheck
};

export function StudentPortal() {
  const { documentTypes, requests, submitRequest } = useData();
  const { user } = useAuth();
  const { updateUser } = useUserManagement();

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.fullName || '');
  const [editedYear, setEditedYear] = useState(user?.yearLevel || '');
  const [editedCourse, setEditedCourse] = useState(user?.course || '');
  const [isSaving, setIsSaving] = useState(false);

  const myRequests = requests.filter(r => r.requesterUid === user?.uid);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUser(user.uid, {
        fullName: editedName,
        yearLevel: editedYear,
        course: editedCourse
      });
      setIsEditing(false);
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error("Profile update error:", error);
      await Haptics.notification({ type: NotificationType.Error });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocSelect = async (doc: any) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    setSelectedDoc(doc);
    setConfirming(true);
  };

  const handleSubmitRequest = async () => {
    if (selectedDoc && user) {
      try {
        await submitRequest({
          requesterUid: user.uid,
          requesterName: user.fullName,
          studentId: user.studentId,
          documentTypeId: selectedDoc.id,
          documentTypeName: selectedDoc.docName,
          fee: selectedDoc.fee
        });
        await Haptics.notification({ type: NotificationType.Success });
        setConfirming(false);
        setSelectedDoc(null);
      } catch (error) {
        await Haptics.notification({ type: NotificationType.Error });
      }
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div
          className="group cursor-pointer active:scale-95 transition-all"
          onClick={() => setShowProfile(!showProfile)}
          role="button"
          aria-label="View and edit profile"
          tabIndex={0}
        >
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 group-hover:text-green-600 transition-colors">
            Hi, {user?.fullName.split(' ')[0]}! 👋
            <ChevronRight className={`w-6 h-6 transition-transform ${showProfile ? 'rotate-90 text-green-600' : 'text-gray-300'}`} />
          </h2>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Student Portal</p>
        </div>
        <button
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${showProfile ? 'bg-white text-green-600 ring-2 ring-green-500 shadow-green-50' : 'bg-green-500 text-white shadow-green-100'}`}
          onClick={() => setShowProfile(!showProfile)}
          aria-label={showProfile ? "Close profile" : "Open profile"}
        >
          {showProfile ? <X className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Interactive Profile Section */}
      {showProfile && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-[2.5rem] overflow-hidden bg-white">
            <div className="h-24 bg-gradient-to-r from-green-400 to-green-600" />
            <CardContent className="relative pt-0 px-8 pb-8">
              <div className="absolute -top-10 left-8 w-20 h-20 rounded-[1.5rem] bg-white p-1 shadow-lg ring-1 ring-slate-100">
                <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                  <UserIcon className="w-10 h-10" />
                </div>
              </div>

              <div className="pt-14 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="space-y-4 max-w-sm">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 focus:ring-green-500 font-bold"
                            placeholder="Full Name"
                            aria-label="Edit Full Name"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-black text-slate-900">{user?.fullName}</h3>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">Active Student</p>
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-slate-400 hover:text-green-600 font-bold h-10"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Info
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Student ID</p>
                    <div className="flex items-center space-x-2 text-slate-900">
                      <CreditCard className="w-4 h-4 text-green-500" />
                      <span className="font-bold">{user?.studentId || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 transition-all focus-within:ring-2 focus-within:ring-green-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Year Level</p>
                    {isEditing ? (
                      <Input
                        value={editedYear}
                        onChange={(e) => setEditedYear(e.target.value)}
                        className="h-7 p-0 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold text-slate-900"
                        placeholder="Year Level"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-slate-900">
                        <GraduationCap className="w-4 h-4 text-green-500" />
                        <span className="font-bold">{user?.yearLevel || 'Not Set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 transition-all focus-within:ring-2 focus-within:ring-green-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Course</p>
                    {isEditing ? (
                      <Input
                        value={editedCourse}
                        onChange={(e) => setEditedCourse(e.target.value)}
                        className="h-7 p-0 bg-transparent border-none shadow-none focus-visible:ring-0 font-bold text-slate-900"
                        placeholder="Course"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-slate-900">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        <span className="font-bold">{user?.course || 'Not Set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-2 flex gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-green-100"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-200 text-slate-500 font-bold h-12 px-6"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user?.fullName || '');
                        setEditedYear(user?.yearLevel || '');
                        setEditedCourse(user?.course || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Total</p>
            <p className="text-3xl font-black text-gray-900 leading-tight">{myRequests.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">In Progress</p>
            <p className="text-3xl font-black text-gray-900 leading-tight">
              {myRequests.filter(r => ['Pending', 'Processing', 'Approved'].includes(r.status)).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 col-span-2 lg:col-span-1 flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Ready</p>
            <p className="text-3xl font-black text-gray-900 leading-tight">
              {myRequests.filter(r => r.status === 'Ready for Download').length}
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid (The "3-Tap" Selection) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-green-500 rounded-full" />
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Available Documents</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((docType) => {
            const Icon = DOC_ICONS[docType.docName.split(' ')[0]] || FileText;
            return (
              <button
                key={docType.id}
                onClick={() => handleDocSelect(docType)}
                className="group relative text-left p-6 bg-white border border-gray-100 rounded-[2.5rem] hover:border-green-500 hover:shadow-xl hover:shadow-green-50/50 transition-all active:scale-95 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 bg-gray-50 group-hover:bg-green-50 rounded-2xl flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                    ₱{docType.fee}
                  </div>
                </div>

                <h4 className="font-black text-gray-900 text-lg leading-tight mb-2 pr-8">{docType.docName}</h4>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{docType.processingDays} Days Processing</span>
                </div>

                <div className="absolute right-6 bottom-6 w-8 h-8 bg-gray-50 group-hover:bg-green-500 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-green-500 rounded-full" />
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Your Recent Requests</h3>
        </div>

        {myRequests.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-[3rem] border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-base font-black text-gray-400">No active requests</p>
            <p className="text-xs font-bold text-gray-300 mt-1 uppercase tracking-widest">Select a document above to start</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((request) => (
              <div key={request.id} className="p-5 bg-white border border-gray-50 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-black text-gray-900 tracking-tight truncate">{request.documentTypeName}</h4>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${STATUS_STYLES[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(request.dateSubmitted).toLocaleDateString()}</span>
                      <span className="text-gray-200">|</span>
                      <span>₱{request.fee}</span>
                    </div>
                  </div>

                  {request.status === 'Ready for Download' ? (
                    <a
                      href={request.downloadUrl}
                      className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 active:scale-90 transition-all"
                    >
                      <Download className="w-6 h-6" />
                    </a>
                  ) : (
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Bottom Sheet (Modern UX) */}
      {confirming && selectedDoc && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
            onClick={() => setConfirming(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-[3rem] p-8 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />

            <div className="flex items-start gap-4 mb-8">
              <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">Confirm Request</h3>
                <p className="text-sm font-bold text-gray-400 leading-tight">You are requesting an official document from the registrar.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Document</span>
                <span className="text-sm font-black text-gray-900">{selectedDoc.docName}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Fee</span>
                <span className="text-lg font-black text-green-600">₱{selectedDoc.fee}.00</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Estimated Time</span>
                <span className="text-sm font-black text-gray-900">{selectedDoc.processingDays} Business Days</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-8">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                Required: {selectedDoc.prerequisites.join(' • ')}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-4 px-6 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex-[2] py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                Submit Request <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

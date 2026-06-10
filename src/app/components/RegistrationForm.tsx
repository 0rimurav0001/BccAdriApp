import { useState } from 'react';
import { useRegistration } from '../contexts/RegistrationContext';
import { X, CheckCircle, ChevronRight, ChevronLeft, User, BookOpen, ShieldCheck, Mail, Lock, Phone, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import logoImage from '../../imports/566232972_1315196483738875_3654026512146916988_n.jpg';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface RegistrationFormProps {
  onClose: () => void;
}

type RegistrationStep = 'identity' | 'academic' | 'security' | 'verification';

export function RegistrationForm({ onClose }: RegistrationFormProps) {
  const { submitRegistration } = useRegistration();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('identity');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    studentId: '',
    course: '',
    yearLevel: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const steps: { id: RegistrationStep; label: string; icon: any }[] = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
  ];

  const handleNext = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    if (currentStep === 'identity') setCurrentStep('academic');
    else if (currentStep === 'academic') setCurrentStep('security');
    else if (currentStep === 'security') setCurrentStep('verification');
  };

  const handleBack = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    if (currentStep === 'academic') setCurrentStep('identity');
    else if (currentStep === 'security') setCurrentStep('academic');
    else if (currentStep === 'verification') setCurrentStep('security');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      const url = URL.createObjectURL(file);
      setIdPhotoUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting submission...');

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    // Create a timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        alert('Submission is taking too long. Please check your internet connection or try a smaller image.');
      }
    }, 30000); // 30 second timeout

    try {
      let finalIdPhotoUrl = undefined;

      if (idFile) {
        console.log('Uploading image to Firebase Storage...', idFile.name);
        try {
          const storageRef = ref(storage, `id_verifications/${Date.now()}_${idFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
          const snapshot = await uploadBytes(storageRef, idFile);
          finalIdPhotoUrl = await getDownloadURL(snapshot.ref);
          console.log('Image uploaded successfully:', finalIdPhotoUrl);
        } catch (uploadError: any) {
          console.error('Image upload failed, but continuing with registration:', uploadError);
          // We can decide to continue without the image or stop here.
          // For now, let's warn the user but attempt to save the text data.
          alert('ID Photo upload failed. Your profile will be submitted without the photo.');
        }
      }

      console.log('Submitting registration data to Firestore...');
      const { confirmPassword, ...submissionData } = formData;
      await submitRegistration({
        ...submissionData,
        idPhotoUrl: finalIdPhotoUrl
      });

      console.log('Registration submitted successfully!');
      clearTimeout(timeoutId);
      await Haptics.notification({ type: Haptics.NotificationType.Success });
      setSubmitted(true);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Registration error:', error);
      await Haptics.notification({ type: Haptics.NotificationType.Error });
      alert(`Failed to submit registration: ${error.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm shadow-green-100">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            Successfully Submitted!
          </h3>
          <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
            Your registration is now pending review. The BCC administration will verify your details and activate your account soon.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'identity':
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <User className="w-4 h-4 text-green-500" /> Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <Calendar className="w-4 h-4 text-green-500" /> Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <MapPin className="w-4 h-4 text-green-500" /> Complete Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900 resize-none"
                placeholder="Brgy. San Carlos, Basista, Pangasinan"
                rows={2}
                required
              />
            </div>
          </div>
        );
      case 'academic':
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Student ID Number
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                placeholder="2024-XXXXXX"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <BookOpen className="w-4 h-4 text-green-500" /> Course
              </label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                required
              >
                <option value="">Select Course</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Hospitality Management">Hospitality Management</option>
                <option value="Education">Education</option>
                <option value="Nursing">Nursing</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <ChevronRight className="w-4 h-4 text-green-500" /> Year Level
              </label>
              <select
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                required
              >
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <Mail className="w-4 h-4 text-green-500" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                placeholder="your.email@gmail.com"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <Lock className="w-4 h-4 text-green-500" /> Create Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <Lock className="w-4 h-4 text-green-500" /> Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        );
      case 'verification':
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-2.5 ml-1">
                <Phone className="w-4 h-4 text-green-500" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base font-bold text-gray-900"
                placeholder="09XXXXXXXXX"
                required
              />
            </div>
            <div className="p-6 bg-green-50 border border-green-100 rounded-[2rem] text-center relative overflow-hidden">
              {idPhotoUrl ? (
                <div className="relative group">
                  <img src={idPhotoUrl} alt="ID Preview" className="w-full h-32 object-cover rounded-xl shadow-md" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Tap to Change</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <ImageIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-xs font-black text-green-800 uppercase tracking-widest mb-1">Upload School ID</p>
                  <p className="text-[10px] font-bold text-green-600 leading-tight">Please upload a clear photo of your current School ID for verification.</p>
                  <div className="relative inline-block mt-4">
                    <button type="button" className="px-4 py-2 bg-white text-green-600 font-black text-[10px] uppercase tracking-widest rounded-xl border border-green-100 shadow-sm active:scale-95 transition-all">
                      Choose File
                    </button>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                By submitting, you certify that all information is true and correct. Misrepresentation is grounds for account suspension.
              </p>
            </div>
          </div>
        );
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'identity':
        return formData.fullName.length > 0 && formData.dateOfBirth.length > 0 && formData.address.length > 0;
      case 'academic':
        return formData.studentId.length > 0 && formData.course.length > 0 && formData.yearLevel.length > 0;
      case 'security':
        return formData.email.length > 0 && formData.password.length >= 6 && formData.password === formData.confirmPassword;
      case 'verification':
        return formData.phoneNumber.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto safe-top pb-safe">
      <div className="bg-white rounded-[3rem] p-6 md:p-8 w-full max-w-xl my-4 shadow-2xl relative overflow-hidden">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <img src={logoImage} alt="BCC Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">Student Signup</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {steps.findIndex(s => s.id === currentStep) + 1} of 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-10 px-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const active = steps.findIndex(s => s.id === currentStep) >= idx;
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  active ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-green-600' : 'text-gray-300'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="min-h-[340px]">
          {renderStep()}
        </div>

        {/* Navigation Footer */}
        <div className="flex gap-3 pt-8 mt-4 border-t border-gray-50">
          {currentStep !== 'identity' && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {currentStep === 'verification' ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="flex-[2] px-4 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Finalizing...' : 'Submit Profile'}
              {!isSubmitting && <CheckCircle className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-[2] px-4 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

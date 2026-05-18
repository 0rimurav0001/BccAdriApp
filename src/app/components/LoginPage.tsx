import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationForm } from './RegistrationForm';
import logoImage from '../../imports/566232972_1315196483738875_3654026512146916988_n.jpg';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      // Detailed error for debugging
      const errorCode = err.code || 'unknown';
      const errorMessage = err.message || 'Invalid credentials';
      setError(`Login Error [${errorCode}]: ${errorMessage}`);
    }
  };

  const buildTimestamp = "2024-05-19 12:40 PM"; // Unique timestamp to verify build

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 pb-safe pt-safe">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-gray-200/50">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 mb-6 drop-shadow-sm">
              <img src={logoImage} alt="Binalatongan Community College" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              Academic Portal
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-2 text-center">
              Binalatongan Community College
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 font-bold text-xs">!</span>
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base"
                placeholder="name@school.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-base"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-green-500 hover:bg-green-600 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed mt-8 text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              New student?{' '}
              <button
                onClick={() => setShowRegistration(true)}
                className="text-green-600 hover:text-green-700 font-bold underline underline-offset-4"
              >
                Create Account
              </button>
            </p>
            <p className="text-[10px] text-gray-300 mt-6 uppercase tracking-widest font-bold">
              Build Ver: {buildTimestamp}
            </p>
          </div>
        </div>
      </div>

      {showRegistration && (
        <RegistrationForm onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}

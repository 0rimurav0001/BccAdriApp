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
    } catch (err) {
      setError('Invalid credentials. Try: student@school.edu, staff@school.edu, or admin@school.edu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4">
              <img src={logoImage} alt="Binalatongan Community College" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Academic Document Portal
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Binalatongan Community College
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setShowRegistration(true)}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Register as Student
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-700">Student: student@school.edu</p>
            <p className="text-xs text-gray-700">Staff: staff@school.edu</p>
            <p className="text-xs text-gray-700">Admin: admin@school.edu</p>
            <p className="text-xs text-gray-500 mt-2">(Any password works)</p>
          </div>
        </div>
      </div>

      {showRegistration && (
        <RegistrationForm onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}

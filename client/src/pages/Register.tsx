import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUp } from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signUp({ name, email, password });
      login(response.token, response.user);
      toast.success(`Account created! Welcome, ${response.user.name}!`);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-tr from-orange-50 via-slate-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 overflow-hidden">
      {/* Background blobs for premium glassmorphic effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8d6f] to-[#ff7a59] text-white shadow-xl shadow-orange-500/20 mb-4">
            <span className="text-2xl font-black tracking-tighter">LB</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">
            Join LeadBridge and start managing your leads
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/40 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 transition-all text-gray-900 dark:text-white"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 transition-all text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 transition-all text-gray-900 dark:text-white"
                  placeholder="•••••••• (min 6 chars)"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 transition-all text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#ff8d6f] to-[#ff7a59] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 active:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-150 dark:border-slate-800/60 text-center">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#ff7a59] hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={12} />
                <span>Back to sign in</span>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

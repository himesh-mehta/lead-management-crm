import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signIn, demoLogin } from '../services/api';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    setIsDemo(true);
    try {
      const response = await demoLogin();
      login(response.token, response.user);
      toast.success('🚀 Welcome to the Demo! Explore 20 pre-loaded leads.');
      navigate('/');
    } catch (err: any) {
      toast.error('Failed to load demo. Please try again.');
    } finally {
      setIsDemo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn({ email, password });
      login(response.token, response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please check your credentials.';
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
            Welcome to <span className="text-[#ff7a59]">LeadBridge</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">
            Sign in to access your dashboard and manage leads
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/40 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 transition-all text-gray-900 dark:text-white"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20 transition-all text-gray-900 dark:text-white"
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
              className="w-full py-3 px-4 bg-gradient-to-r from-[#ff8d6f] to-[#ff7a59] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 active:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Account Button */}
          <div className="mt-4">
            <div className="relative flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleDemo}
              disabled={isDemo || isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isDemo ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={15} className="fill-white" />
                  <span>Try Demo Account</span>
                </>
              )}
            </motion.button>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              20 pre-loaded leads · No sign-up needed · Full access
            </p>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-150 dark:border-slate-800/60 text-center">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#ff7a59] hover:underline inline-flex items-center gap-0.5">
                <span>Create one now</span>
                <ArrowRight size={12} />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

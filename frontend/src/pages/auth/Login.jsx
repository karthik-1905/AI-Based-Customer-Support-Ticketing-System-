import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Brain, Eye, EyeOff, CheckCircle, Sparkles, Users, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  'AI-powered candidate ranking',
  'Smart resume parsing in seconds',
  'Visual hiring pipeline management',
  'Deep analytics & reporting',
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: 'recruiter@recruitai.com', password: 'password123', remember: false },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Gradient Panel */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 animated-gradient relative overflow-hidden flex-col justify-between p-12"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">RecruitAI</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight">
            Find Top Talent,<br />Faster Than Ever
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of companies using AI to build world-class teams.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-blue-100">
                <CheckCircle size={18} className="text-accent flex-shrink-0" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Floating card mockup */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-24 right-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-48"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Users size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">Active Users</p>
              <p className="text-white text-lg font-extrabold">2.4M+</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[85, 70, 90, 65, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-white/20 rounded-sm" style={{ height: h * 0.4 + 'px' }} />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Right: Login Form */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center px-6 py-12 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">RecruitAI</span>
          </div>

          <h1 className="text-3xl font-extrabold text-text mb-1">Welcome back</h1>
          <p className="text-text-muted mb-8">Sign in to your account to continue</p>

          {/* Demo hint */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6 text-xs text-primary">
            <strong>Demo:</strong> Use <code>recruiter@recruitai.com</code> / <code>password123</code> or <code>candidate@recruitai.com</code> / <code>password123</code>
          </div>

          {/* Google OAuth (visual) */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-xl text-text font-medium hover:bg-slate-50 transition-colors mb-5">
            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-text-muted">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
                type="email"
                placeholder="you@company.com"
                className="input-field"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field !pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input {...register('remember')} type="checkbox" id="remember" className="w-4 h-4 accent-primary" />
              <label htmlFor="remember" className="text-sm text-text-light cursor-pointer">Remember me for 30 days</label>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Sign up for free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

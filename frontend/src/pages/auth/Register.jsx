import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Brain, Eye, EyeOff, User, Building2, Users, ArrowRight, CheckCircle } from 'lucide-react';

const roles = [
  {
    key: 'candidate',
    icon: User,
    title: 'Job Seeker',
    desc: 'Find your dream job and get matched to roles based on your skills.',
    color: 'from-primary to-blue-600',
  },
  {
    key: 'recruiter',
    icon: Building2,
    title: 'Recruiter',
    desc: 'Post jobs, screen candidates, and manage your hiring pipeline.',
    color: 'from-secondary to-cyan-600',
  },
  {
    key: 'hr_manager',
    icon: Users,
    title: 'HR Manager',
    desc: 'Oversee your entire organization\'s recruitment process.',
    color: 'from-accent to-teal-600',
  },
];

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0 = role pick, 1 = form

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await authRegister({ ...data, role: selectedRole });
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Brain size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">RecruitAI</span>
          </div>
          <h1 className="text-3xl font-extrabold text-text">{step === 0 ? 'Create your account' : `Join as ${roles.find(r => r.key === selectedRole)?.title}`}</h1>
          <p className="text-text-muted mt-1">
            {step === 0 ? 'First, tell us how you plan to use RecruitAI' : 'Fill in your details to get started'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Role Selection */}
          {step === 0 && (
            <motion.div key="role-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid gap-4 mb-6">
                {roles.map((role) => (
                  <motion.div
                    key={role.key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRole(role.key)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-200
                      ${selectedRole === role.key
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <role.icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-text">{role.title}</h3>
                      <p className="text-text-muted text-sm">{role.desc}</p>
                    </div>
                    {selectedRole === role.key && (
                      <CheckCircle size={20} className="text-primary flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => selectedRole && setStep(1)}
                disabled={!selectedRole}
                className="w-full btn-primary !py-3.5 flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={18} />
              </button>

              <p className="text-center text-sm text-text-muted mt-4">
                Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <motion.div key="register-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <input {...register('first_name', { required: 'Required' })} placeholder="John" className="input-field" />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input {...register('last_name', { required: 'Required' })} placeholder="Doe" className="input-field" />
                      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      placeholder="you@company.com"
                      className="input-field"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  {(selectedRole === 'recruiter' || selectedRole === 'hr_manager') && (
                    <div>
                      <label className="label">Company Name</label>
                      <input {...register('company', { required: 'Company name is required' })} placeholder="Your company" className="input-field" />
                      {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
                    </div>
                  )}

                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        className="input-field !pr-11"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      {...register('confirm_password', {
                        required: 'Please confirm your password',
                        validate: (val) => val === password || 'Passwords do not match',
                      })}
                      type="password"
                      placeholder="••••••••"
                      className="input-field"
                    />
                    {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                  </div>

                  <div className="flex items-start gap-2">
                    <input {...register('terms', { required: 'You must accept the terms' })} type="checkbox" id="terms" className="w-4 h-4 mt-0.5 accent-primary" />
                    <label htmlFor="terms" className="text-sm text-text-light cursor-pointer">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(0)} className="px-5 py-3 border border-slate-200 rounded-lg text-sm font-medium text-text-light hover:bg-slate-50 transition-colors">
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary !py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                      ) : (
                        <>Create Account <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <p className="text-center text-sm text-text-muted mt-4">
                Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;

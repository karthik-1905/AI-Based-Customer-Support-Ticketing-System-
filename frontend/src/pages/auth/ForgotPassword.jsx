import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Brain, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api.js';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
    } catch {
      // Mock success
    }
    setLoading(false);
    setSubmitted(true);
    toast.success('Reset email sent!');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md">
              <Brain size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">RecruitAI</span>
          </div>

          {!submitted ? (
            <>
              <div className="mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <Mail size={26} className="text-primary" />
                </div>
                <h1 className="text-2xl font-extrabold text-text mb-2">Forgot your password?</h1>
                <p className="text-text-muted text-sm leading-relaxed">
                  No worries. Enter your email address and we'll send you a link to reset your password.
                </p>
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
                    autoFocus
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary !py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-2">Check your inbox</h2>
              <p className="text-text-muted text-sm mb-6">
                We've sent a password reset link to <span className="font-semibold text-text">{getValues('email')}</span>
              </p>
              <p className="text-xs text-text-muted">Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSubmitted(false)} className="text-primary hover:underline font-medium">try again</button>.
              </p>
            </motion.div>
          )}

          <Link to="/login" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text font-medium mt-6 justify-center transition-colors">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

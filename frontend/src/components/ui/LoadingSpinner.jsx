import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ overlay = false, size = 'md', message = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const Spinner = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-slate-200`} style={{ borderStyle: 'solid' }} />
        <div
          className={`${sizes[size]} rounded-full border-primary absolute inset-0 animate-spin`}
          style={{ borderStyle: 'solid', borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
        />
      </div>
      {message && <p className="text-sm text-text-muted font-medium">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <Spinner />
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Spinner />
    </div>
  );
};

export default LoadingSpinner;

import React from 'react';
import { motion } from 'framer-motion';
import { getTrendInfo } from '../../utils/formatters.js';
import { TrendingUp, TrendingDown } from 'lucide-react';

const variantStyles = {
  primary: 'from-primary/10 to-primary/5 border-primary/10',
  secondary: 'from-secondary/10 to-secondary/5 border-secondary/10',
  accent: 'from-accent/10 to-accent/5 border-accent/10',
  success: 'from-green-50 to-emerald-50 border-green-100',
  warning: 'from-amber-50 to-yellow-50 border-amber-100',
  danger: 'from-red-50 to-rose-50 border-red-100',
  purple: 'from-violet-50 to-purple-50 border-violet-100',
};

const iconBgStyles = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  purple: 'bg-violet-500',
};

const StatsCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendLabel,
  variant = 'primary',
  suffix = '',
  prefix = '',
  loading = false,
  index = 0,
}) => {
  const trendInfo = trend !== undefined ? getTrendInfo(trend) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)' }}
      className={`bg-gradient-to-br ${variantStyles[variant]} border rounded-2xl p-6 cursor-default transition-all duration-300`}
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-10 w-10 bg-slate-200 rounded-xl" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 ${iconBgStyles[variant]} rounded-xl flex items-center justify-center shadow-sm`}>
              <Icon size={20} className="text-white" />
            </div>
            {trendInfo && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trendInfo.color} ${trendInfo.bg}`}>
                {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : null}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-text-light mb-1">{title}</p>
          <p className="text-3xl font-bold text-text">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {trendLabel && (
            <p className="text-xs text-text-muted mt-1">{trendLabel}</p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default StatsCard;

import { format, formatDistanceToNow, parseISO } from 'date-fns';

// ─── Date Formatters ──────────────────────────────────────
export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern);
  } catch {
    return String(date);
  }
};

export const formatRelativeDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return String(date);
  }
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm');

// ─── Salary Formatter ─────────────────────────────────────
export const formatSalary = (min, max, currency = 'USD') => {
  const fmt = (n) => {
    if (!n && n !== 0) return null;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString();
  };
  const c = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  if (min && max) return `${c}${fmt(min)} - ${c}${fmt(max)}`;
  if (min) return `${c}${fmt(min)}+`;
  if (max) return `Up to ${c}${fmt(max)}`;
  return 'Competitive';
};

export const formatNumber = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

// ─── Score to Color Mapping ───────────────────────────────
export const scoreToColor = (score) => {
  if (score >= 85) return { bg: '#DCFCE7', text: '#16A34A', ring: '#22C55E', label: 'Excellent' };
  if (score >= 70) return { bg: '#DBEAFE', text: '#2563EB', ring: '#3B82F6', label: 'Good' };
  if (score >= 50) return { bg: '#FEF3C7', text: '#D97706', ring: '#F59E0B', label: 'Fair' };
  return { bg: '#FEE2E2', text: '#DC2626', ring: '#EF4444', label: 'Low' };
};

export const scoreToTailwind = (score) => {
  if (score >= 85) return 'bg-green-100 text-green-700';
  if (score >= 70) return 'bg-blue-100 text-blue-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

// ─── Stage Labels & Colors ────────────────────────────────
export const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', color: '#64748B', bg: '#F1F5F9' },
  { key: 'screening', label: 'Screening', color: '#2563EB', bg: '#DBEAFE' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#0EA5E9', bg: '#E0F2FE' },
  { key: 'interview', label: 'Interview', color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'offer', label: 'Offer', color: '#14B8A6', bg: '#CCFBF1' },
  { key: 'hired', label: 'Hired', color: '#16A34A', bg: '#DCFCE7' },
  { key: 'rejected', label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
];

export const getStageInfo = (stageKey) => {
  return PIPELINE_STAGES.find((s) => s.key === stageKey) || PIPELINE_STAGES[0];
};

export const getStageBadgeClass = (stage) => {
  const map = {
    applied: 'badge-secondary',
    screening: 'badge-primary',
    shortlisted: 'bg-sky-100 text-sky-700',
    interview: 'bg-violet-100 text-violet-700',
    offer: 'bg-teal-100 text-teal-700',
    hired: 'badge-success',
    rejected: 'badge-danger',
  };
  return `badge ${map[stage] || 'badge-secondary'}`;
};

// ─── Job Type Labels ──────────────────────────────────────
export const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const getJobTypeLabel = (type) => JOB_TYPES.find((t) => t.value === type)?.label || type;

export const getJobTypeBadgeClass = (type) => {
  const map = {
    full_time: 'bg-green-100 text-green-700',
    part_time: 'bg-blue-100 text-blue-700',
    contract: 'bg-amber-100 text-amber-700',
    internship: 'bg-purple-100 text-purple-700',
    remote: 'bg-teal-100 text-teal-700',
    hybrid: 'bg-sky-100 text-sky-700',
  };
  return `badge ${map[type] || 'badge-secondary'}`;
};

// ─── Experience Level Labels ──────────────────────────────
export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 yrs)' },
  { value: 'mid', label: 'Mid Level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5-10 yrs)' },
  { value: 'lead', label: 'Lead / Principal (10+ yrs)' },
  { value: 'executive', label: 'Executive' },
];

export const getExperienceLabel = (level) => EXPERIENCE_LEVELS.find((e) => e.value === level)?.label || level;

// ─── Avatar Initial ───────────────────────────────────────
export const getInitials = (name = '') => {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

// ─── Trend Arrow ──────────────────────────────────────────
export const getTrendInfo = (value) => {
  if (value > 0) return { symbol: '↑', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (value < 0) return { symbol: '↓', color: 'text-red-500', bg: 'bg-red-50' };
  return { symbol: '→', color: 'text-slate-500', bg: 'bg-slate-50' };
};

// ─── File Size ────────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─── Truncate ─────────────────────────────────────────────
export const truncate = (str, n = 100) => {
  if (!str || str.length <= n) return str;
  return str.slice(0, n) + '...';
};

// ─── Chart Colors ─────────────────────────────────────────
export const CHART_COLORS = ['#2563EB', '#0EA5E9', '#14B8A6', '#7C3AED', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];

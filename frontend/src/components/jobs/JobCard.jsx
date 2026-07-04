import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ScoreBadge from '../ui/ScoreBadge.jsx';
import { formatSalary, formatRelativeDate, getJobTypeBadgeClass, getJobTypeLabel } from '../../utils/formatters.js';
import { MapPin, Clock, DollarSign, Briefcase, Building2, Sparkles } from 'lucide-react';

const JobCard = ({ job, index = 0, onApply }) => {
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const companyInitials = job.company?.slice(0, 2).toUpperCase() || 'CO';
  const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-violet-500', 'bg-amber-500'];
  const color = colors[job.id?.charCodeAt(0) % colors.length] || 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 transition-all duration-300 cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {companyInitials}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-text leading-tight line-clamp-1">{job.title}</h3>
            <p className="text-sm text-text-light mt-0.5 flex items-center gap-1">
              <Building2 size={12} />
              {job.company}
            </p>
          </div>
        </div>
        {isCandidate && job.aiMatchScore != null && (
          <div className="flex flex-col items-center flex-shrink-0">
            <ScoreBadge score={job.aiMatchScore} size="sm" />
            <span className="text-[10px] text-text-muted mt-0.5">AI Match</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={getJobTypeBadgeClass(job.type)}>{getJobTypeLabel(job.type)}</span>
        {job.remote && <span className="badge bg-teal-50 text-teal-600">🌐 Remote</span>}
        <span className="badge badge-secondary capitalize">{job.experience?.replace('_', ' ')} level</span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-text-light">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-slate-400" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-slate-400" />
          <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase size={12} className="text-slate-400" />
          <span>{job.applicationsCount || 0} applicants</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-slate-400" />
          <span>{formatRelativeDate(job.postedDate)}</span>
        </div>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center text-sm font-medium text-primary border border-primary/30 py-2 rounded-lg hover:bg-primary/5 transition-colors"
        >
          View Details
        </Link>
        {isCandidate ? (
          <button
            onClick={() => onApply?.(job)}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-primary text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Sparkles size={14} /> Apply Now
          </button>
        ) : (
          <Link
            to={`/candidates?jobId=${job.id}`}
            className="flex-1 text-center text-sm font-medium bg-slate-100 text-text py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            View Applicants
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default JobCard;

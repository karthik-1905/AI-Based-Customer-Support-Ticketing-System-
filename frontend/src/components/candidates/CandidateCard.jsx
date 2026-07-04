import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScoreBadge from '../ui/ScoreBadge.jsx';
import { formatRelativeDate, getStageBadgeClass, getStageInfo, getInitials } from '../../utils/formatters.js';
import { Mail, Phone, MapPin, Eye, MessageSquare } from 'lucide-react';

const CandidateCard = ({ candidate, index = 0, onView, onContact }) => {
  const stageInfo = getStageInfo(candidate.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {candidate.avatar ? (
            <img src={candidate.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : getInitials(candidate.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text truncate">{candidate.name}</h3>
          <p className="text-sm text-text-light truncate">{candidate.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400" />
            <span className="text-xs text-text-muted truncate">{candidate.location}</span>
          </div>
        </div>
        <ScoreBadge score={candidate.aiScore} size="sm" />
      </div>

      {/* Stage Badge */}
      <div className="flex items-center justify-between">
        <span className={getStageBadgeClass(candidate.stage)}
          style={{ backgroundColor: stageInfo.bg, color: stageInfo.color }}>
          {stageInfo.label}
        </span>
        <span className="text-xs text-text-muted">{formatRelativeDate(candidate.appliedDate)}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills?.slice(0, 4).map((skill) => (
          <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
            {skill}
          </span>
        ))}
        {candidate.skills?.length > 4 && (
          <span className="text-xs text-slate-400 px-2 py-0.5">+{candidate.skills.length - 4}</span>
        )}
      </div>

      {/* Contact */}
      <div className="text-xs text-text-muted space-y-1">
        <div className="flex items-center gap-1.5">
          <Mail size={11} /><span className="truncate">{candidate.email}</span>
        </div>
        {candidate.phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={11} /><span>{candidate.phone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Link
          to={`/candidates/${candidate.id}`}
          onClick={() => onView?.(candidate)}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-primary border border-primary/30 py-2 rounded-lg hover:bg-primary/5 transition-colors"
        >
          <Eye size={14} /> View Profile
        </Link>
        <button
          onClick={() => onContact?.(candidate)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-text-light rounded-lg hover:bg-slate-200 transition-colors"
        >
          <MessageSquare size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default CandidateCard;

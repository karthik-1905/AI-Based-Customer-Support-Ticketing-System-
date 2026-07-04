import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import ScoreBadge from '../../components/ui/ScoreBadge.jsx';
import CandidateCard from '../../components/candidates/CandidateCard.jsx';
import { mockJobs, mockCandidates } from '../../data/mockData.js';
import { formatDate, formatSalary, getJobTypeBadgeClass, getJobTypeLabel, getExperienceLabel } from '../../utils/formatters.js';
import { MapPin, DollarSign, Clock, Users, Calendar, ArrowLeft, Share2, Bookmark, Sparkles, Building2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

const tabs = ['Description', 'Requirements', 'Company', 'Candidates'];

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Description');
  const [applied, setApplied] = useState(false);
  const isCandidate = user?.role === 'candidate';

  const job = mockJobs.find((j) => j.id === id) || mockJobs[0];
  const candidates = mockCandidates.filter((c) => c.jobId === job.id);

  const handleApply = () => {
    setApplied(true);
    toast.success(`Applied to ${job.title}!`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors font-medium">
          <ArrowLeft size={16} /> Back to jobs
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
              {job.company?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-text">{job.title}</h1>
                  <p className="text-text-light mt-0.5 flex items-center gap-1.5">
                    <Building2 size={14} />
                    <span className="font-medium">{job.company}</span>
                    <span className="text-text-muted">· {job.department}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Bookmark size={16} className="text-slate-400" />
                  </button>
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Share2 size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className={getJobTypeBadgeClass(job.type)}>{getJobTypeLabel(job.type)}</span>
                {job.remote && <span className="badge bg-teal-50 text-teal-600">🌐 Remote OK</span>}
                <span className="badge badge-secondary capitalize">{getExperienceLabel(job.experience)}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm text-text-light">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" />{job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={13} className="text-slate-400" />{formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />{job.applicationsCount} applicants
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />Closes {formatDate(job.deadline)}
                </div>
              </div>
            </div>
          </div>

          {/* Apply / AI Score */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5 pt-5 border-t border-slate-100">
            {isCandidate && job.aiMatchScore != null && (
              <div className="flex items-center gap-3">
                <ScoreBadge score={job.aiMatchScore} size="md" showLabel />
                <div>
                  <p className="text-sm font-semibold text-text">AI Match Score</p>
                  <p className="text-xs text-text-muted">Based on your profile & resume</p>
                </div>
              </div>
            )}
            {isCandidate ? (
              <button
                onClick={handleApply}
                disabled={applied}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  applied
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-md shadow-primary/20'
                }`}
              >
                {applied ? <><CheckCircle size={16} /> Applied</> : <><Sparkles size={16} /> Apply Now</>}
              </button>
            ) : (
              <Link to={`/pipeline?jobId=${job.id}`} className="btn-primary flex items-center gap-2 text-sm !px-6 !py-2.5">
                <Users size={16} /> Manage Applicants
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-100 p-1 shadow-sm">
          {(isCandidate ? tabs.slice(0, 3) : tabs).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-light hover:text-text hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          {activeTab === 'Description' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-text-light leading-relaxed">{job.description}</p>
              {job.skills?.length > 0 && (
                <>
                  <h3 className="font-bold text-text mt-6 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'Requirements' && (
            <div>
              <h3 className="font-bold text-text mb-4">Job Requirements</h3>
              <ul className="space-y-3">
                {job.requirements?.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-light">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'Company' && (
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {job.company?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-text text-xl">{job.company}</h3>
                  <p className="text-text-muted text-sm">{job.department}</p>
                </div>
              </div>
              <p className="text-text-light text-sm leading-relaxed">
                {job.company} is a leading technology company focused on building innovative solutions. We're passionate about creating products that make a real difference in people's lives. Our team values collaboration, creativity, and continuous learning.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[['Founded', '2018'], ['Size', '200-500'], ['Funding', 'Series B']].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="font-bold text-text text-lg">{val}</p>
                    <p className="text-xs text-text-muted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'Candidates' && !isCandidate && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-text">{candidates.length} Applicants</h3>
                <span className="text-xs text-text-muted">Sorted by AI Score</span>
              </div>
              {candidates.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {candidates.map((c, i) => <CandidateCard key={c.id} candidate={c} index={i} />)}
                </div>
              ) : (
                <p className="text-text-muted text-sm text-center py-8">No candidates applied yet for this position.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;

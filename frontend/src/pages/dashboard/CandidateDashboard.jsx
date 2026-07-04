import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import JobCard from '../../components/jobs/JobCard.jsx';
import { mockCandidateApplications, mockJobs } from '../../data/mockData.js';
import { getStageBadgeClass, getStageInfo, formatDate } from '../../utils/formatters.js';
import { FileText, Calendar, Bookmark, Eye, Upload, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const profileCompletion = 72;
  const applications = mockCandidateApplications;
  const recommendedJobs = mockJobs.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-text">Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
          <p className="text-text-muted text-sm mt-0.5">Here's your job search overview.</p>
        </div>

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex-1">
            <p className="font-bold mb-1">Complete your profile to get better matches</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/20 rounded-full max-w-xs">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <span className="text-sm font-bold">{profileCompletion}% Complete</span>
            </div>
            <p className="text-blue-100 text-xs mt-1">Add your resume and skills to unlock AI-powered matching</p>
          </div>
          <Link to="/resume-analyzer" className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors flex-shrink-0">
            <Upload size={16} /> Upload Resume
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={FileText} title="Applications Sent" value={applications.length} trend={25} variant="primary" index={0} />
          <StatsCard icon={Calendar} title="Interviews" value={2} trend={100} variant="accent" index={1} />
          <StatsCard icon={Bookmark} title="Saved Jobs" value={8} trend={12} variant="secondary" index={2} />
          <StatsCard icon={Eye} title="Profile Views" value={34} trend={41} variant="success" index={3} />
        </div>

        {/* No Resume CTA */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Upload your resume to get AI-matched jobs</p>
              <p className="text-amber-600 text-xs">Our AI will analyze your skills and match you to the best opportunities</p>
            </div>
          </div>
          <Link to="/resume-analyzer" className="flex-shrink-0 text-sm font-semibold text-amber-700 border border-amber-300 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors">
            Upload Now
          </Link>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-text">My Applications</h2>
            <Link to="/jobs" className="text-xs text-primary hover:underline font-medium">Browse more jobs</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-text-muted pb-3">Position</th>
                  <th className="text-left text-xs font-semibold text-text-muted pb-3 hidden sm:table-cell">Company</th>
                  <th className="text-left text-xs font-semibold text-text-muted pb-3 hidden md:table-cell">Applied</th>
                  <th className="text-left text-xs font-semibold text-text-muted pb-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-muted pb-3 hidden lg:table-cell">Next Step</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const stageInfo = getStageInfo(app.stage);
                  return (
                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-semibold text-text">{app.jobTitle}</p>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <p className="text-sm text-text-light">{app.company}</p>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <p className="text-sm text-text-muted">{formatDate(app.appliedDate)}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: stageInfo.bg, color: stageInfo.color }}>
                          {stageInfo.label}
                        </span>
                      </td>
                      <td className="py-3 hidden lg:table-cell">
                        <p className="text-xs text-text-muted">{app.nextStep || '—'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text">Recommended for You</h2>
            <Link to="/jobs" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatsCard from '../../components/ui/StatsCard.jsx';
import ApplicationTrendChart from '../../components/charts/ApplicationTrendChart.jsx';
import HiringFunnelChart from '../../components/charts/HiringFunnelChart.jsx';
import SkillsDistributionChart from '../../components/charts/SkillsDistributionChart.jsx';
import { mockDashboardStats, mockApplicationTrends, mockFunnelData, mockSkillsData, mockCandidates, mockJobs } from '../../data/mockData.js';
import { analyticsAPI } from '../../services/api.js';
import { formatRelativeDate, getStageBadgeClass, getStageInfo } from '../../utils/formatters.js';
import { Briefcase, Users, FileText, UserCheck, Calendar, TrendingUp, Plus, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScoreBadge from '../../components/ui/ScoreBadge.jsx';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(mockDashboardStats);
  const [trends, setTrends] = useState(mockApplicationTrends);
  const [funnel, setFunnel] = useState(mockFunnelData);
  const [skills, setSkills] = useState(mockSkillsData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dash, trendData, funnelData] = await Promise.all([
          analyticsAPI.getDashboard(),
          analyticsAPI.getTrends(),
          analyticsAPI.getFunnel(),
        ]);
        if (dash) setStats(dash);
        if (trendData) setTrends(trendData);
        if (funnelData) setFunnel(funnelData);
      } catch { /* use mock */ }
    };
    fetch();
  }, []);

  const recentApplications = mockCandidates.slice(0, 5);
  const topJobs = mockJobs.slice(0, 4);

  const quickActions = [
    { icon: Plus, label: 'Post New Job', to: '/jobs/create', color: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
    { icon: Search, label: 'Find Candidates', to: '/candidates', color: 'bg-secondary', text: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: Calendar, label: 'Schedule Interview', to: '/interviews', color: 'bg-accent', text: 'text-accent', bg: 'bg-accent/10' },
    { icon: TrendingUp, label: 'View Analytics', to: '/analytics', color: 'bg-violet-500', text: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-text">Recruiter Dashboard</h1>
            <p className="text-text-muted text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
          </div>
          <Link to="/jobs/create" className="btn-primary flex items-center gap-2 !px-5 !py-2.5 text-sm">
            <Plus size={16} /> Post Job
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard icon={Briefcase} title="Total Jobs" value={stats.totalJobs} trend={8} trendLabel="vs last month" variant="primary" index={0} />
          <StatsCard icon={FileText} title="Active Jobs" value={stats.activeJobs} trend={4} variant="secondary" index={1} />
          <StatsCard icon={Users} title="Applications" value={stats.totalApplications} trend={23} trendLabel="this month" variant="accent" index={2} />
          <StatsCard icon={UserCheck} title="Shortlisted" value={stats.shortlisted} trend={12} variant="success" index={3} />
          <StatsCard icon={Calendar} title="Interviews" value={stats.interviewsScheduled} trend={-5} variant="warning" index={4} />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-text">Application Trends</h2>
              <span className="text-xs text-text-muted bg-slate-100 px-3 py-1 rounded-full">Last 6 months</span>
            </div>
            <ApplicationTrendChart data={trends} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-text">Hiring Funnel</h2>
              <Eye size={16} className="text-slate-400" />
            </div>
            <HiringFunnelChart data={funnel} />
          </div>
        </div>

        {/* Applications Table + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-text">Recent Applications</h2>
              <Link to="/candidates" className="text-xs text-primary hover:underline font-medium">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-text-muted pb-3">Candidate</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-3 hidden sm:table-cell">Position</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-3 hidden md:table-cell">Applied</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-3">Stage</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((c) => {
                    const stageInfo = getStageInfo(c.stage);
                    return (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/70 to-accent/70 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {c.name.split(' ').map(w => w[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text leading-tight">{c.name}</p>
                              <p className="text-xs text-text-muted">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 hidden sm:table-cell">
                          <p className="text-sm text-text-light">{c.jobTitle}</p>
                        </td>
                        <td className="py-3 pr-4 hidden md:table-cell">
                          <p className="text-sm text-text-muted">{formatRelativeDate(c.appliedDate)}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="badge text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: stageInfo.bg, color: stageInfo.color }}>
                            {stageInfo.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <ScoreBadge score={c.aiScore} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-text mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map(({ icon: Icon, label, to, bg, text }) => (
                <Link key={label} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={18} className={text} />
                  </div>
                  <span className="text-sm font-medium text-text">{label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">🎯 AI Insight</p>
              <p className="text-xs text-text-light leading-relaxed">
                Your "Senior Frontend Engineer" role has 47 applicants. AI has shortlisted 8 high-fit candidates for you.
              </p>
              <Link to="/candidates" className="text-xs text-primary font-semibold mt-2 inline-block hover:underline">
                Review now →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Jobs */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-text">Top Jobs by Applications</h2>
              <Link to="/jobs" className="text-xs text-primary hover:underline font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {topJobs.map((job, i) => (
                <div key={job.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-lg font-black text-slate-200">#{i + 1}</span>
                  <div className={`w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {job.company?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{job.title}</p>
                    <p className="text-xs text-text-muted">{job.department} · {job.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-text">{job.applicationsCount}</p>
                    <p className="text-xs text-text-muted">applicants</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-text mb-4">Top Candidate Skills</h2>
            <SkillsDistributionChart data={skills.slice(0, 5)} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;

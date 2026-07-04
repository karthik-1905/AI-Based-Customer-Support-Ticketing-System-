import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/ui/StatsCard';
import HiringFunnelChart from '../../components/charts/HiringFunnelChart';
import ApplicationTrendChart from '../../components/charts/ApplicationTrendChart';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import SkillsDistributionChart from '../../components/charts/SkillsDistributionChart';
import { Users, Briefcase, FileText, CheckCircle } from 'lucide-react';

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <select className="border border-slate-300 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium">
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Applicants" value="1,248" icon={Users} trend="up" trendValue="12%" />
        <StatsCard title="Jobs Posted" value="45" icon={Briefcase} trend="up" trendValue="5%" />
        <StatsCard title="Interviews" value="128" icon={FileText} trend="up" trendValue="18%" />
        <StatsCard title="Hired" value="24" icon={CheckCircle} trend="down" trendValue="2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Application Trends</h2>
          <ApplicationTrendChart />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Hiring Funnel</h2>
          <HiringFunnelChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">AI Score Distribution</h2>
          <ScoreDistributionChart />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Top Candidate Skills</h2>
          <SkillsDistributionChart />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;

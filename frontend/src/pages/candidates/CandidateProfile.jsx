import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ScoreBadge from '../../components/ui/ScoreBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { mockCandidates } from '../../data/mockData';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setTimeout(() => {
      const found = mockCandidates?.find(c => c.id === parseInt(id)) || mockCandidates?.[0];
      setCandidate(found);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <DashboardLayout><div className="flex h-64 justify-center items-center"><LoadingSpinner /></div></DashboardLayout>;
  if (!candidate) return <DashboardLayout><div className="p-8 text-center">Candidate not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-800 mb-4 font-medium flex items-center gap-2">
        &larr; Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <img src={candidate.avatar || 'https://via.placeholder.com/150'} alt={candidate.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{candidate.name}</h1>
            <p className="text-slate-500 mb-4">{candidate.email} &bull; {candidate.location || 'Unknown Location'}</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.slice(0, 5).map(skill => (
                <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">{skill}</span>
              ))}
            </div>
          </div>
          <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">AI Match Score</p>
            <ScoreBadge score={candidate.score || 75} size="lg" />
          </div>
        </div>

        <div className="border-t border-slate-200 flex overflow-x-auto">
          {['overview', 'resume', 'ai-insights', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium text-sm capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[400px]">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Professional Summary</h2>
            <p className="text-slate-600 leading-relaxed mb-8">{candidate.summary || 'No summary available.'}</p>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Experience</h2>
            <p className="text-slate-600">{candidate.experience || 'Not specified.'}</p>
          </div>
        )}
        {activeTab === 'resume' && (
          <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center border border-slate-200">
            <p className="text-slate-500">PDF Viewer Placeholder for {candidate.name}'s Resume</p>
          </div>
        )}
        {activeTab === 'ai-insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2"><span className="text-xl">✅</span> Strengths</h3>
              <ul className="list-disc pl-5 text-green-700 space-y-2">
                <li>Strong match in core technologies.</li>
                <li>Excellent academic background.</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h3 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2"><span className="text-xl">⚠️</span> Skill Gaps</h3>
              <ul className="list-disc pl-5 text-amber-700 space-y-2">
                <li>Missing experience with specific CI/CD tools.</li>
              </ul>
            </div>
          </div>
        )}
        {activeTab === 'notes' && (
          <div>
            <textarea className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" rows="4" placeholder="Add a note..."></textarea>
            <div className="mt-4 flex justify-end"><button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Save Note</button></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateProfile;

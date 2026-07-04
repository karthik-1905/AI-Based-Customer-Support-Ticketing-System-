import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import JobForm from '../../components/jobs/JobForm.jsx';
import { jobsAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import { Brain } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await jobsAPI.create(data);
      toast.success('Job posted successfully!');
      navigate('/jobs');
    } catch {
      // Mock success
      toast.success('Job posted successfully! (Demo mode)');
      navigate('/jobs');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text">Create New Job</h1>
          <p className="text-text-muted text-sm mt-0.5">Fill in the details to post a new position and start receiving applications.</p>
        </div>

        {/* AI Tip */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">AI-Enhanced Job Posting</p>
            <p className="text-xs text-text-muted mt-0.5">
              RecruitAI will automatically analyze your job description and match it against our candidate database once posted. Higher quality descriptions lead to better AI matching.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 lg:p-8">
          <JobForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;

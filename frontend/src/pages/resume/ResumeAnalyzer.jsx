import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FileUploader from '../../components/ui/FileUploader';
import ScoreBadge from '../../components/ui/ScoreBadge';

const ResumeAnalyzer = () => {
  const [parsed, setParsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = (files) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setParsed(true);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Resume Analyzer</h1>
        <p className="text-slate-500 mb-8">Upload a resume to instantly extract skills and match against jobs.</p>

        {!parsed && !loading && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <FileUploader onUpload={handleUpload} />
          </div>
        )}

        {loading && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Extracting information using AI...</p>
          </div>
        )}

        {parsed && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Parsed Information</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Name</p>
                  <p className="text-slate-800 font-medium">John Doe</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Email</p>
                  <p className="text-slate-800 font-medium">john.doe@example.com</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Experience</p>
                  <p className="text-slate-800 font-medium">5 Years</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Education</p>
                  <p className="text-slate-800 font-medium">M.S. Computer Science</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm text-slate-500 font-medium mb-2">Extracted Skills</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL'].map(skill => (
                    <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold text-slate-800 mb-6 self-start w-full border-b pb-4">Job Match</h2>
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select a Job to compare</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Senior Full Stack Developer</option>
                  <option>Frontend Engineer</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-slate-500 font-medium mb-4">Compatibility Score</p>
                <ScoreBadge score={88} size="xl" />
                <p className="text-green-600 font-medium mt-4 bg-green-50 px-4 py-1 rounded-full">Excellent Match</p>
              </div>
              <button 
                onClick={() => {setParsed(false)}} 
                className="w-full mt-6 text-primary-600 font-medium hover:text-primary-800"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalyzer;

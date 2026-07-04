import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import KanbanBoard from '../../components/pipeline/KanbanBoard';

const HiringPipeline = () => {
  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hiring Pipeline</h1>
          <p className="text-slate-500">Drag and drop candidates to update their stage.</p>
        </div>
        <select className="border border-slate-300 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium">
          <option>All Jobs</option>
          <option>Senior Frontend Engineer</option>
          <option>Product Manager</option>
        </select>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 overflow-x-auto h-[calc(100vh-200px)]">
        <KanbanBoard />
      </div>
    </DashboardLayout>
  );
};

export default HiringPipeline;

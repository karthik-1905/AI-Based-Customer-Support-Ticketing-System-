import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { mockInterviews } from '../../data/mockData';

const localizer = momentLocalizer(moment);

const InterviewScheduler = () => {
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  
  const events = mockInterviews?.map(inv => ({
    title: `Interview: ${inv.candidateName} - ${inv.jobTitle}`,
    start: new Date(inv.scheduledAt),
    end: new Date(new Date(inv.scheduledAt).getTime() + 60 * 60 * 1000), // +1 hour
    resource: inv
  })) || [];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Interviews</h1>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${view === 'calendar' ? 'bg-primary-100 text-primary-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${view === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            onClick={() => setView('list')}
          >
            List View
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 text-sm ml-2">
            + Schedule Interview
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[700px]">
        {view === 'calendar' ? (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                  <th className="p-4 font-medium">Candidate</th>
                  <th className="p-4 font-medium">Job</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Mode</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockInterviews?.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{inv.candidateName}</td>
                    <td className="p-4 text-slate-600">{inv.jobTitle}</td>
                    <td className="p-4 text-slate-600">{new Date(inv.scheduledAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{inv.mode}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Scheduled</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewScheduler;

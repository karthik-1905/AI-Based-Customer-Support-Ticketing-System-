import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 min-w-36">
      <p className="font-semibold text-text text-sm mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-text-light capitalize">{entry.dataKey}</span>
          </div>
          <span className="font-bold text-text">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ApplicationTrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          formatter={(val) => <span className="text-text-light capitalize">{val}</span>}
        />
        <Area type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2.5} fill="url(#colorApps)" name="Applications" dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        <Area type="monotone" dataKey="interviews" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#colorInterviews)" name="Interviews" dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        <Area type="monotone" dataKey="offers" stroke="#14B8A6" strokeWidth={2.5} fill="url(#colorOffers)" name="Offers" dot={{ r: 4, fill: '#14B8A6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ApplicationTrendChart;

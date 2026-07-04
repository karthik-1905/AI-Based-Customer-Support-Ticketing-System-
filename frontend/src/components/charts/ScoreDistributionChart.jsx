import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3">
      <p className="font-semibold text-text text-sm">Score: {label}</p>
      <p className="text-primary text-sm font-bold">{payload[0]?.value} candidates</p>
    </div>
  );
};

const ScoreDistributionChart = ({ data }) => {
  const getColor = (range) => {
    if (range.startsWith('81') || range.startsWith('100')) return '#22C55E';
    if (range.startsWith('61')) return '#2563EB';
    if (range.startsWith('41')) return '#F59E0B';
    if (range.startsWith('21')) return '#F97316';
    return '#EF4444';
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 12, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.range)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ScoreDistributionChart;

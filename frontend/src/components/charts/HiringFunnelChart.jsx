import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3">
      <p className="font-semibold text-text text-sm">{payload[0]?.payload?.stage}</p>
      <p className="text-primary text-sm font-bold">{payload[0]?.value?.toLocaleString()} candidates</p>
      {payload[0]?.payload?.rate != null && (
        <p className="text-text-muted text-xs mt-0.5">Conversion: {payload[0]?.payload?.rate}%</p>
      )}
    </div>
  );
};

const HiringFunnelChart = ({ data }) => {
  const colors = ['#2563EB', '#0EA5E9', '#14B8A6', '#7C3AED', '#F59E0B', '#10B981'];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
          width={80}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            style={{ fontSize: 12, fontWeight: 600, fill: '#1E293B' }}
            formatter={(v) => v.toLocaleString()}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HiringFunnelChart;

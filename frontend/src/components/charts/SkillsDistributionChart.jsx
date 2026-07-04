import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/formatters.js';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3">
      <p className="font-semibold text-text text-sm">{payload[0]?.name}</p>
      <p className="text-primary text-sm">{payload[0]?.value} candidates</p>
    </div>
  );
};

const SkillsDistributionChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SkillsDistributionChart;

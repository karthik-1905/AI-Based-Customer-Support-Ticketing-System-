import React from 'react';
import { motion } from 'framer-motion';
import { scoreToColor } from '../../utils/formatters.js';

const ScoreBadge = ({ score, size = 'md', showLabel = false, animate = true }) => {
  const colors = scoreToColor(score ?? 0);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const sizeMap = {
    sm: { outer: 'w-14 h-14', text: 'text-base', svg: 70, r: 28, stroke: 4 },
    md: { outer: 'w-20 h-20', text: 'text-xl', svg: 88, r: 36, stroke: 5 },
    lg: { outer: 'w-28 h-28', text: 'text-3xl', svg: 120, r: 50, stroke: 6 },
  };

  const s = sizeMap[size];
  const c = 2 * Math.PI * s.r;
  const d = ((score ?? 0) / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${s.outer} flex items-center justify-center`}>
        <svg
          width={s.svg}
          height={s.svg}
          viewBox={`0 0 ${s.svg} ${s.svg}`}
          className="-rotate-90 absolute inset-0"
        >
          <circle
            cx={s.svg / 2}
            cy={s.svg / 2}
            r={s.r}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={s.stroke}
          />
          <motion.circle
            cx={s.svg / 2}
            cy={s.svg / 2}
            r={s.r}
            fill="none"
            stroke={colors.ring}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - d }}
            transition={{ duration: animate ? 1.2 : 0, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <span className={`relative z-10 font-bold ${s.text}`} style={{ color: colors.text }}>
          {score ?? 0}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {colors.label}
        </span>
      )}
    </div>
  );
};

export default ScoreBadge;

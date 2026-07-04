import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import ScoreBadge from '../ui/ScoreBadge.jsx';
import { formatRelativeDate, getInitials } from '../../utils/formatters.js';
import { Calendar, GripVertical } from 'lucide-react';

const KanbanCard = ({ candidate, index }) => {
  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-xl border p-3.5 mb-2.5 transition-all duration-200 group
            ${snapshot.isDragging
              ? 'shadow-xl border-primary/30 rotate-1 scale-105'
              : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
            }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              {...provided.dragHandleProps}
              className="mt-0.5 text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
            >
              <GripVertical size={14} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {candidate.avatar ? (
                      <img src={candidate.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : getInitials(candidate.candidateName)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/candidates/${candidate.id}`}
                      className="text-sm font-semibold text-text hover:text-primary transition-colors truncate block"
                    >
                      {candidate.candidateName}
                    </Link>
                  </div>
                </div>
                <ScoreBadge score={candidate.score} size="sm" />
              </div>

              <p className="text-xs text-text-muted truncate mb-2">{candidate.jobTitle}</p>

              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Calendar size={11} />
                <span>{formatRelativeDate(candidate.appliedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;

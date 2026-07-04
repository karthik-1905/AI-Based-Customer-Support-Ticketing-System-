import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import KanbanCard from './KanbanCard.jsx';
import { PIPELINE_STAGES } from '../../utils/formatters.js';

const ACTIVE_STAGES = PIPELINE_STAGES.filter((s) => !['rejected'].includes(s.key));

const KanbanBoard = ({ data, onDragEnd, jobFilter }) => {
  const [columns, setColumns] = useState(data);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...(columns[source.droppableId] || [])];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...(columns[destination.droppableId] || [])];

    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    const newColumns = {
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    };

    setColumns(newColumns);
    onDragEnd?.(draggableId, source.droppableId, destination.droppableId);
  };

  // Sync external data changes
  React.useEffect(() => {
    setColumns(data);
  }, [data]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {PIPELINE_STAGES.map((stage) => {
          const cards = columns[stage.key] || [];
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 w-64"
            >
              {/* Column Header */}
              <div
                className="flex items-center justify-between mb-3 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: stage.bg }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: stage.color + '20', color: stage.color }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={stage.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] p-2 rounded-xl transition-all duration-200
                      ${snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-primary/20 border-dashed' : 'bg-slate-50/80'}`}
                  >
                    {cards.map((card, idx) => (
                      <KanbanCard key={card.id} candidate={card} index={idx} />
                    ))}
                    {provided.placeholder}
                    {cards.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 text-slate-300 text-sm">
                        Drop candidates here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </motion.div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

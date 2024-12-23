// ActionsPalette.tsx
import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { WorkflowStep } from '../types/workflow';

export const ActionsPalette: React.FC = () => {
  const predefinedActions: WorkflowStep[] = [
    { id: 'checkout', name: 'Checkout', uses: 'actions/checkout@v3' },
    { id: 'setup-node', name: 'Setup Node', uses: 'actions/setup-node@v3' }
  ];

  return (
    <Droppable droppableId="actions-palette">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {predefinedActions.map((action, index) => (
            <Draggable key={action.id} draggableId={action.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {action.name}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
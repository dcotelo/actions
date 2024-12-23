// StepCard.tsx
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { WorkflowStep } from '../types/workflow';
import '../styles/StepCard.css';

interface StepCardProps {
  step: WorkflowStep;
  index: number;
}

export const StepCard: React.FC<StepCardProps> = ({ step, index }) => {
  return (
    <Draggable draggableId={step.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="step-card"
        >
          <h4>{step.name}</h4>
          {step.uses && <div>Uses: {step.uses}</div>}
          {step.run && <div>Run: {step.run}</div>}
        </div>
      )}
    </Draggable>
  );
};
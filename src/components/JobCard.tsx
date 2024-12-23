import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { WorkflowJob } from '../types/workflow';
import { StepCard } from './StepCard';
import '../styles/JobCard.css';

interface JobCardProps {
  job: WorkflowJob;
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="job-card"
        >
          <div {...provided.dragHandleProps} className="job-header">
            <h3>{job.name}</h3>
            <div className="job-meta">
              <span className="runs-on">Runs on: {job.runsOn}</span>
            </div>
          </div>
          
          <Droppable droppableId={`job-${job.id}-steps`}>
            {(stepsProvided) => (
              <div 
                ref={stepsProvided.innerRef}
                {...stepsProvided.droppableProps}
                className="job-steps"
              >
                {job.steps.map((step, stepIndex) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={stepIndex}
                  />
                ))}
                {stepsProvided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="job-footer">
            <button className="add-step-btn">
              + Add Step
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
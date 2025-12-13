/**
 * StepsList - Displays list of steps for a job
 */
import React from 'react';
import PropTypes from 'prop-types';
import StepCard from './StepCard';

const StepsList = ({ steps, jobId }) => {
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return (
      <div className="steps-list-empty">
        <p>No steps defined</p>
      </div>
    );
  }

  return (
    <div className="steps-list" role="list">
      {steps.map((step, index) => (
        <StepCard
          key={index}
          step={step}
          stepIndex={index}
          jobId={jobId}
        />
      ))}
    </div>
  );
};

StepsList.propTypes = {
  steps: PropTypes.array,
  jobId: PropTypes.string.isRequired,
};

export default StepsList;


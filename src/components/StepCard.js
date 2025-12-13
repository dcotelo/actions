/**
 * StepCard - Displays a single step
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const StepCard = ({ step, stepIndex, jobId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stepName = step.name || step.uses || `Step ${stepIndex + 1}`;
  const hasDetails = step.run || step.with || step.env || step.if;

  return (
    <div className="step-card" role="listitem">
      <div
        className="step-card-header"
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (hasDetails && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role={hasDetails ? "button" : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        aria-expanded={hasDetails ? isExpanded : undefined}
      >
        <div className="step-title">
          <span className="step-number">{stepIndex + 1}</span>
          <span className="step-name">{stepName}</span>
          {step.if && (
            <span className="step-condition-badge" title="Conditional step">
              if
            </span>
          )}
        </div>
        {hasDetails && (
          <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
        )}
      </div>

      {isExpanded && hasDetails && (
        <div className="step-card-details">
          {step.uses && (
            <div className="step-detail">
              <label>Uses:</label>
              <code>{step.uses}</code>
            </div>
          )}
          {step.run && (
            <div className="step-detail">
              <label>Run:</label>
              <pre>{step.run}</pre>
            </div>
          )}
          {step.if && (
            <div className="step-detail">
              <label>Condition:</label>
              <code>{step.if}</code>
            </div>
          )}
          {step.with && (
            <div className="step-detail">
              <label>With:</label>
              <pre>{JSON.stringify(step.with, null, 2)}</pre>
            </div>
          )}
          {step.env && (
            <div className="step-detail">
              <label>Environment:</label>
              <pre>{JSON.stringify(step.env, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

StepCard.propTypes = {
  step: PropTypes.object.isRequired,
  stepIndex: PropTypes.number.isRequired,
  jobId: PropTypes.string.isRequired,
};

export default StepCard;


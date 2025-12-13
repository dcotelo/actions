/**
 * WorkflowOverview - Displays workflow metadata
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const WorkflowOverview = ({ metadata }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!metadata) {
    return null;
  }

  return (
    <div className="workflow-overview" role="region" aria-label="Workflow overview">
      <div 
        className="workflow-overview-header"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <h2>Workflow Overview</h2>
        <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="workflow-overview-content">
          {metadata.name && (
            <div className="workflow-field">
              <label>Name:</label>
              <span>{metadata.name}</span>
            </div>
          )}

          {metadata.triggers && metadata.triggers.length > 0 && (
            <div className="workflow-field">
              <label>Triggers:</label>
              <div className="triggers-list">
                {metadata.triggers.map((trigger, index) => (
                  <div key={index} className="trigger-item">
                    <strong>{trigger.type}</strong>
                    {trigger.branches && (
                      <span className="trigger-detail">
                        Branches: {Array.isArray(trigger.branches) 
                          ? trigger.branches.join(', ') 
                          : trigger.branches}
                      </span>
                    )}
                    {trigger.paths && (
                      <span className="trigger-detail">
                        Paths: {Array.isArray(trigger.paths) 
                          ? trigger.paths.join(', ') 
                          : trigger.paths}
                      </span>
                    )}
                    {trigger.tags && (
                      <span className="trigger-detail">
                        Tags: {Array.isArray(trigger.tags) 
                          ? trigger.tags.join(', ') 
                          : trigger.tags}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {metadata.jobs && Object.keys(metadata.jobs).length > 0 && (
            <div className="workflow-field">
              <label>Jobs:</label>
              <span>{Object.keys(metadata.jobs).length} job(s)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

WorkflowOverview.propTypes = {
  metadata: PropTypes.shape({
    name: PropTypes.string,
    triggers: PropTypes.array,
    jobs: PropTypes.object,
  }),
};

export default WorkflowOverview;


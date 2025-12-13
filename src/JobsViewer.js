import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FlowDiagram from './FlowDiagram';

const JobsViewer = ({ jobs }) => {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (jobId, stepIndex) => {
    setExpandedSteps(prev => ({
      ...prev,
      [`${jobId}-${stepIndex}`]: !prev[`${jobId}-${stepIndex}`]
    }));
  };

  if (!jobs) return null;

  return (
    <div className="jobs-viewer" role="region" aria-label="Workflow jobs viewer">
      <FlowDiagram jobs={jobs} />
      <h3>Workflow Jobs</h3>
      <div className="jobs-grid" role="list">
        {Object.entries(jobs).map(([jobId, jobConfig]) => (
          <div key={jobId} className="job-card" role="listitem">
            <h4>{jobId}</h4>
            <div className="job-details">
              <p>
                <strong>Runs on:</strong> {Array.isArray(jobConfig['runs-on']) ? 
                  jobConfig['runs-on'].join(', ') : 
                  jobConfig['runs-on']}
              </p>
              {jobConfig.steps && (
                <div className="steps">
                  <strong>Steps:</strong>
                  {jobConfig.steps.map((step, index) => {
                    const stepKey = `${jobId}-${index}`;
                    const isExpanded = expandedSteps[stepKey];
                    return (
                      <div key={index} className="step">
                        <div 
                          className="step-header"
                          onClick={() => toggleStep(jobId, index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleStep(jobId, index);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          aria-controls={`step-details-${stepKey}`}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} step ${index + 1} for job ${jobId}`}
                        >
                          <span>{step.name || step.uses || `Step ${index + 1}`}</span>
                          <button 
                            className="step-toggle"
                            aria-label={isExpanded ? 'Collapse step' : 'Expand step'}
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div 
                            className="step-details"
                            id={`step-details-${stepKey}`}
                            role="region"
                          >
                            {step.uses && (
                              <div className="step-field">
                                <label>Uses:</label>
                                <code>{step.uses}</code>
                              </div>
                            )}
                            {step.run && (
                              <div className="step-field">
                                <label>Run:</label>
                                <pre>{step.run}</pre>
                              </div>
                            )}
                            {step.with && (
                              <div className="step-field">
                                <label>With:</label>
                                <pre>{JSON.stringify(step.with, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

JobsViewer.propTypes = {
  jobs: PropTypes.objectOf(PropTypes.shape({
    'runs-on': PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    needs: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    steps: PropTypes.arrayOf(PropTypes.object)
  })).isRequired
};

export default JobsViewer;

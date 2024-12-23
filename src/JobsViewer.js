import React, { useState } from 'react';
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
    <div className="jobs-viewer">
      <FlowDiagram jobs={jobs} />
      <h3>Workflow Jobs</h3>
      <div className="jobs-grid">
        {Object.entries(jobs).map(([jobId, jobConfig]) => (
          <div key={jobId} className="job-card">
            <h4>{jobId}</h4>
            <div className="job-details">
              <p><strong>Runs on:</strong> {Array.isArray(jobConfig['runs-on']) ? 
                jobConfig['runs-on'].join(', ') : 
                jobConfig['runs-on']}</p>
              {jobConfig.steps && (
                <div className="steps">
                  <strong>Steps:</strong>
                  {jobConfig.steps.map((step, index) => (
                    <div key={index} className="step">
                      <div 
                        className="step-header"
                        onClick={() => toggleStep(jobId, index)}
                      >
                        <span>{step.name || step.uses || `Step ${index + 1}`}</span>
                        <button className="step-toggle">
                          {expandedSteps[`${jobId}-${index}`] ? '−' : '+'}
                        </button>
                      </div>
                      {expandedSteps[`${jobId}-${index}`] && (
                        <div className="step-details">
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
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsViewer;
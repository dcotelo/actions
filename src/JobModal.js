import React, { useState } from 'react';

const JobModal = ({ job, jobId, onClose }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  const toggleStep = (index) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{jobId}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="job-info">
            <h3>Configuration</h3>
            <div className="info-group">
              <label>Runs on:</label>
              <span>{Array.isArray(job['runs-on']) ? 
                job['runs-on'].join(', ') : 
                job['runs-on']}</span>
            </div>
            {job.needs && (
              <div className="info-group">
                <label>Depends on:</label>
                <span>{Array.isArray(job.needs) ? 
                  job.needs.join(', ') : 
                  job.needs}</span>
              </div>
            )}
          </div>
          {job.steps && (
            <div className="job-steps">
              <h3>Steps</h3>
              {job.steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div 
                    className="step-header"
                    onClick={() => toggleStep(index)}
                  >
                    <div className="step-title">
                      {step.name && <strong>{step.name}</strong>}
                      {!step.name && step.uses && <code>{step.uses}</code>}
                      {!step.name && !step.uses && <em>Step {index + 1}</em>}
                    </div>
                    <button className="step-toggle">
                      {expandedSteps.has(index) ? '−' : '+'}
                    </button>
                  </div>
                  {expandedSteps.has(index) && (
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
                      {step.env && (
                        <div className="step-field">
                          <label>Environment:</label>
                          <pre>{JSON.stringify(step.env, null, 2)}</pre>
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
    </div>
  );
};

export default JobModal;
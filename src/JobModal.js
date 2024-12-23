
import React from 'react';

const JobModal = ({ job, jobId, onClose }) => {
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
                  <div className="step-header">
                    {step.name && <strong>{step.name}</strong>}
                    {step.uses && <code>{step.uses}</code>}
                  </div>
                  {step.with && (
                    <div className="step-with">
                      <pre>{JSON.stringify(step.with, null, 2)}</pre>
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
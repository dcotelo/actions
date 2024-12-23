import React from 'react';
import FlowDiagram from './FlowDiagram';

const JobsViewer = ({ jobs }) => {
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
                      {step.name || step.uses || `Step ${index + 1}`}
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
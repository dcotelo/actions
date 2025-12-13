/**
 * JobCard - Displays a single job
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StepsList from './StepsList';
import { hasMatrixStrategy } from '../utils/workflowModel';

const JobCard = ({ jobId, job }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const runsOn = Array.isArray(job['runs-on']) 
    ? job['runs-on'].join(', ') 
    : job['runs-on'] || 'Not specified';

  const needs = job.needs 
    ? (Array.isArray(job.needs) ? job.needs : [job.needs])
    : [];

  const hasMatrix = hasMatrixStrategy(job);

  return (
    <div className="job-card" role="listitem" data-job-id={jobId}>
      <div
        className="job-card-header"
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
        <div className="job-title">
          <h3>{jobId}</h3>
          {job.name && <span className="job-name">({job.name})</span>}
          {hasMatrix && (
            <span className="matrix-badge" title="Uses matrix strategy">
              Matrix
            </span>
          )}
        </div>
        <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
      </div>

      <div className="job-card-summary">
        <div className="job-info-item">
          <label>Runs on:</label>
          <span>{runsOn}</span>
        </div>
        {needs.length > 0 && (
          <div className="job-info-item">
            <label>Depends on:</label>
            <span>{needs.join(', ')}</span>
          </div>
        )}
        {job.environment && (
          <div className="job-info-item">
            <label>Environment:</label>
            <span>
              {typeof job.environment === 'string' 
                ? job.environment 
                : job.environment.name || 'Custom'}
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="job-card-details">
          {job.steps && (
            <div className="job-steps-section">
              <h4>Steps</h4>
              <StepsList steps={job.steps} jobId={jobId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

JobCard.propTypes = {
  jobId: PropTypes.string.isRequired,
  job: PropTypes.object.isRequired,
};

export default JobCard;


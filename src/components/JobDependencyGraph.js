/**
 * JobDependencyGraph - Simple CSS-based dependency visualization
 * Replaces the complex SVG FlowDiagram
 */
import React from 'react';
import PropTypes from 'prop-types';
import { groupJobsByLevel, calculateJobDependencies } from '../utils/workflowModel';

const JobDependencyGraph = ({ jobs, onJobClick }) => {
  if (!jobs || typeof jobs !== 'object' || Object.keys(jobs).length === 0) {
    return (
      <div className="dependency-graph-empty">
        <p>No jobs to display</p>
      </div>
    );
  }

  const jobGroups = groupJobsByLevel(jobs);
  const dependencies = calculateJobDependencies(jobs);
  const levels = Object.keys(jobGroups).map(Number).sort((a, b) => a - b);

  return (
    <div className="dependency-graph" role="region" aria-label="Job dependency graph">
      <h3>Job Dependencies</h3>
      <div className="dependency-graph-container">
        {levels.map(level => (
          <div key={level} className="dependency-level" data-level={level}>
            <div className="level-label">Level {level}</div>
            <div className="level-jobs">
              {jobGroups[level].map(jobId => {
                const job = jobs[jobId];
                const deps = dependencies[jobId];
                const runsOn = Array.isArray(job['runs-on']) 
                  ? job['runs-on'].join(', ') 
                  : job['runs-on'] || 'Not specified';

                return (
                  <div
                    key={jobId}
                    className="dependency-job-node"
                    onClick={() => onJobClick && onJobClick(jobId)}
                    onKeyDown={(e) => {
                      if (onJobClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onJobClick(jobId);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Job ${jobId}, runs on ${runsOn}`}
                  >
                    <div className="job-node-content">
                      <div className="job-node-id">{jobId}</div>
                      <div className="job-node-runs-on">{runsOn}</div>
                      {deps.needs.length > 0 && (
                        <div className="job-node-deps">
                          Depends on: {deps.needs.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

JobDependencyGraph.propTypes = {
  jobs: PropTypes.object.isRequired,
  onJobClick: PropTypes.func,
};

export default JobDependencyGraph;


/**
 * WorkflowViewer - Main viewer component
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import WorkflowOverview from './WorkflowOverview';
import JobDependencyGraph from './JobDependencyGraph';
import FlowGraph from './FlowGraph';
import GraphTextualFallback from './GraphTextualFallback';
import JobsList from './JobsList';
import JobModal from '../JobModal';

const WorkflowViewer = ({ workflowMetadata, validationWarnings }) => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [graphViewMode, setGraphViewMode] = useState('graph'); // 'simple', 'graph', 'textual' - default to graph
  const jobsListRef = useRef(null);

  if (!workflowMetadata || !workflowMetadata.jobs) {
    return (
      <div className="workflow-viewer-empty">
        <p>No workflow loaded. Switch to Editor mode to load or create a workflow.</p>
      </div>
    );
  }

  const selectedJob = selectedJobId ? workflowMetadata.jobs[selectedJobId] : null;

  return (
    <div className="workflow-viewer" role="main">
      {validationWarnings && validationWarnings.length > 0 && (
        <div className="viewer-warnings" role="alert">
          <h3>Warnings</h3>
          <ul>
            {validationWarnings.map((warning, index) => (
              <li key={index}>
                {typeof warning === 'string' ? warning : warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <WorkflowOverview metadata={workflowMetadata} />

      <div className="dependency-view-section">
        <div className="dependency-view-header">
          <h3>Job Dependencies</h3>
          <div className="dependency-view-toggle">
            <button
              className={`view-toggle-btn ${graphViewMode === 'simple' ? 'active' : ''}`}
              onClick={() => setGraphViewMode('simple')}
              aria-pressed={graphViewMode === 'simple'}
            >
              Simple
            </button>
            <button
              className={`view-toggle-btn ${graphViewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setGraphViewMode('graph')}
              aria-pressed={graphViewMode === 'graph'}
            >
              Graph
            </button>
            <button
              className={`view-toggle-btn ${graphViewMode === 'textual' ? 'active' : ''}`}
              onClick={() => setGraphViewMode('textual')}
              aria-pressed={graphViewMode === 'textual'}
            >
              Textual
            </button>
          </div>
        </div>

        {graphViewMode === 'simple' && (
          <JobDependencyGraph
            jobs={workflowMetadata.jobs}
            onJobClick={(jobId) => {
              setSelectedJobId(jobId);
              // Scroll to job in list
              if (jobsListRef.current) {
                const jobElement = jobsListRef.current.querySelector(`[data-job-id="${jobId}"]`);
                if (jobElement) {
                  jobElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }}
          />
        )}

        {graphViewMode === 'graph' && (
          <FlowGraph
            jobs={workflowMetadata.jobs}
            onNodeClick={(jobId) => {
              setSelectedJobId(jobId);
              // Scroll to job in list
              if (jobsListRef.current) {
                const jobElement = jobsListRef.current.querySelector(`[data-job-id="${jobId}"]`);
                if (jobElement) {
                  jobElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }}
          />
        )}

        {graphViewMode === 'textual' && (
          <GraphTextualFallback jobs={workflowMetadata.jobs} />
        )}
      </div>

      <div ref={jobsListRef}>
        <JobsList jobs={workflowMetadata.jobs} />
      </div>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

WorkflowViewer.propTypes = {
  workflowMetadata: PropTypes.shape({
    name: PropTypes.string,
    triggers: PropTypes.array,
    jobs: PropTypes.object,
  }),
  validationWarnings: PropTypes.array,
};

export default WorkflowViewer;


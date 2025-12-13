/**
 * JobsList - Displays list of jobs
 */
import React from 'react';
import PropTypes from 'prop-types';
import JobCard from './JobCard';

const JobsList = ({ jobs }) => {
  if (!jobs || typeof jobs !== 'object' || Object.keys(jobs).length === 0) {
    return (
      <div className="jobs-list-empty">
        <p>No jobs defined</p>
      </div>
    );
  }

  return (
    <div className="jobs-list" role="list" aria-label="Workflow jobs">
      <h2>Jobs</h2>
      {Object.entries(jobs).map(([jobId, job]) => (
        <JobCard key={jobId} jobId={jobId} job={job} />
      ))}
    </div>
  );
};

JobsList.propTypes = {
  jobs: PropTypes.object,
};

export default JobsList;


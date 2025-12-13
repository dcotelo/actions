/**
 * GraphTextualFallback - Textual representation of graph for accessibility
 */
import React from 'react';
import PropTypes from 'prop-types';
import { buildGraphData } from '../utils/graphLayout';

const GraphTextualFallback = ({ jobs }) => {
  if (!jobs || typeof jobs !== 'object' || Object.keys(jobs).length === 0) {
    return (
      <div className="graph-textual-fallback-empty">
        <p>No jobs to display</p>
      </div>
    );
  }

  const graphData = buildGraphData(jobs);

  return (
    <div className="graph-textual-fallback" role="region" aria-label="Textual dependency graph">
      <h3>Job Dependencies (Textual View)</h3>
      <table className="graph-textual-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Depends On</th>
            <th>Dependents</th>
            <th>Runs On</th>
          </tr>
        </thead>
        <tbody>
          {graphData.nodes.map(node => {
            const dependents = graphData.edges
              .filter(e => e.source === node.id)
              .map(e => e.target);
            
            return (
              <tr key={node.id}>
                <td>
                  <strong>{node.id}</strong>
                  {node.isRoot && <span className="badge badge-root">Root</span>}
                  {node.isTerminal && <span className="badge badge-terminal">Terminal</span>}
                </td>
                <td>{node.needs.length > 0 ? node.needs.join(', ') : 'None'}</td>
                <td>{dependents.length > 0 ? dependents.join(', ') : 'None'}</td>
                <td>
                  {Array.isArray(node.job['runs-on']) 
                    ? node.job['runs-on'].join(', ') 
                    : node.job['runs-on'] || 'Not specified'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

GraphTextualFallback.propTypes = {
  jobs: PropTypes.object.isRequired,
};

export default GraphTextualFallback;


/**
 * GraphNode - Individual node in the graph
 */
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { hasMatrixStrategy } from '../utils/workflowModel';

const GraphNode = ({ node, isHighlighted, isInCycle, onClick, onHover, onLeave }) => {
  const { id, job, x, y, width, height, isRoot, isTerminal } = node;
  
  const runsOn = Array.isArray(job['runs-on']) 
    ? job['runs-on'].join(', ') 
    : job['runs-on'] || 'Not specified';

  const hasMatrix = hasMatrixStrategy(job);
  const isReusable = job.uses && typeof job.uses === 'string';

  const nodeClasses = [
    'graph-node',
    isRoot && 'graph-node-root',
    isTerminal && 'graph-node-terminal',
    isHighlighted && 'graph-node-highlighted',
    isInCycle && 'graph-node-cycle',
  ].filter(Boolean).join(' ');

  return (
    <g
      className={nodeClasses}
      transform={`translate(${x - width / 2}, ${y - height / 2})`}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(id);
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        if (onHover) onHover(id, e);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        if (onLeave) onLeave(e);
      }}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Job ${id}, runs on ${runsOn}`}
    >
      <rect
        width={width}
        height={height}
        rx="6"
        className="graph-node-rect"
      />
      <text
        x={width / 2}
        y={20}
        textAnchor="middle"
        className="graph-node-title"
        fontSize="14"
        fontWeight="600"
      >
        {id}
      </text>
      {job.name && (
        <text
          x={width / 2}
          y={38}
          textAnchor="middle"
          className="graph-node-subtitle"
          fontSize="11"
          fill="#586069"
        >
          {job.name}
        </text>
      )}
      <text
        x={width / 2}
        y={height - 25}
        textAnchor="middle"
        className="graph-node-runs-on"
        fontSize="10"
        fill="#586069"
      >
        {runsOn}
      </text>
      
      {/* Indicators */}
      <g transform={`translate(${width - 30}, 10)`}>
        {hasMatrix && (
          <circle r="8" fill="#28a745" className="graph-node-indicator" />
        )}
        {isReusable && (
          <circle r="8" fill="#0366d6" className="graph-node-indicator" cx="20" />
        )}
        {job.environment && (
          <circle r="8" fill="#ffc107" className="graph-node-indicator" cx="40" />
        )}
      </g>
    </g>
  );
};

GraphNode.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    job: PropTypes.object.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    isRoot: PropTypes.bool,
    isTerminal: PropTypes.bool,
  }).isRequired,
  isHighlighted: PropTypes.bool,
  isInCycle: PropTypes.bool,
  onClick: PropTypes.func,
  onHover: PropTypes.func,
  onLeave: PropTypes.func,
};

export default memo(GraphNode);


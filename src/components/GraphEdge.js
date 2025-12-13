/**
 * GraphEdge - Edge (arrow) between nodes
 */
import React, { memo } from 'react';
import PropTypes from 'prop-types';

const GraphEdge = ({ edge, isHighlighted, isInCycle }) => {
  if (!edge.points || edge.points.length < 2) {
    return null;
  }

  const points = edge.points;
  const start = points[0];
  const end = points[points.length - 1];

  // Create path through all points
  let pathData = `M ${start.x} ${start.y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  const edgeClasses = [
    'graph-edge',
    isHighlighted && 'graph-edge-highlighted',
    isInCycle && 'graph-edge-cycle',
  ].filter(Boolean).join(' ');

  return (
    <g className={edgeClasses}>
      <path
        d={pathData}
        fill="none"
        strokeWidth="2"
        markerEnd={isHighlighted ? "url(#arrowhead-highlighted)" : "url(#arrowhead)"}
        className="graph-edge-path"
      />
    </g>
  );
};

GraphEdge.propTypes = {
  edge: PropTypes.shape({
    id: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    points: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })),
  }).isRequired,
  isHighlighted: PropTypes.bool,
  isInCycle: PropTypes.bool,
};

export default memo(GraphEdge);


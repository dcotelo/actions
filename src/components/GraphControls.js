/**
 * GraphControls - Zoom, pan, and layout controls
 */
import React from 'react';
import PropTypes from 'prop-types';

const GraphControls = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToView,
  layoutDirection,
  onLayoutDirectionChange,
}) => {
  return (
    <div className="graph-controls" role="toolbar" aria-label="Graph controls">
      <div className="graph-controls-group">
        <button
          onClick={onZoomIn}
          className="graph-control-btn"
          aria-label="Zoom in"
          disabled={zoom >= 2}
        >
          +
        </button>
        <span className="graph-zoom-level" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomOut}
          className="graph-control-btn"
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
        >
          −
        </button>
      </div>

      <div className="graph-controls-group">
        <button
          onClick={onReset}
          className="graph-control-btn"
          aria-label="Reset view"
        >
          Reset
        </button>
        <button
          onClick={onFitToView}
          className="graph-control-btn"
          aria-label="Fit to viewport"
        >
          Fit
        </button>
      </div>

      <div className="graph-controls-group">
        <label className="graph-layout-label">
          Layout:
          <select
            value={layoutDirection}
            onChange={(e) => onLayoutDirectionChange(e.target.value)}
            className="graph-layout-select"
            aria-label="Layout direction"
          >
            <option value="LR">Left to Right</option>
            <option value="TB">Top to Bottom</option>
          </select>
        </label>
      </div>
    </div>
  );
};

GraphControls.propTypes = {
  zoom: PropTypes.number.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onFitToView: PropTypes.func.isRequired,
  layoutDirection: PropTypes.oneOf(['LR', 'TB']).isRequired,
  onLayoutDirectionChange: PropTypes.func.isRequired,
};

export default GraphControls;


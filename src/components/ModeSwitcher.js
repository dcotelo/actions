/**
 * ModeSwitcher - Toggle between Viewer and Editor modes
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MODES } from '../hooks/useMode';

const ModeSwitcher = ({ currentMode, onSwitch, canSwitchToViewer, validationMessage }) => {
  const isViewer = currentMode === MODES.VIEWER;
  const isEditor = currentMode === MODES.EDITOR;

  const handleSwitch = () => {
    if (isViewer) {
      // Always allow switching to editor
      onSwitch(MODES.EDITOR);
    } else {
      // Check if we can switch to viewer
      if (canSwitchToViewer) {
        onSwitch(MODES.VIEWER);
      }
    }
  };

  return (
    <div className="mode-switcher" role="group" aria-label="Mode switcher">
      <button
        className={`mode-btn ${isViewer ? 'active' : ''}`}
        onClick={() => onSwitch(MODES.VIEWER)}
        disabled={!canSwitchToViewer && !isViewer}
        aria-pressed={isViewer}
        aria-label="Switch to viewer mode"
      >
        Viewer
      </button>
      <button
        className={`mode-btn ${isEditor ? 'active' : ''}`}
        onClick={() => onSwitch(MODES.EDITOR)}
        aria-pressed={isEditor}
        aria-label="Switch to editor mode"
      >
        Editor
      </button>
      {!canSwitchToViewer && !isViewer && validationMessage && (
        <span className="mode-switch-message" role="alert">
          {validationMessage}
        </span>
      )}
    </div>
  );
};

ModeSwitcher.propTypes = {
  currentMode: PropTypes.oneOf([MODES.VIEWER, MODES.EDITOR]).isRequired,
  onSwitch: PropTypes.func.isRequired,
  canSwitchToViewer: PropTypes.bool,
  validationMessage: PropTypes.string,
};

export default ModeSwitcher;


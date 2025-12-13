/**
 * ValidationPanel - Displays validation errors and warnings
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ValidationPanel = ({ validationResult, onErrorClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!validationResult || (!validationResult.errors.length && !validationResult.warnings.length)) {
    return (
      <div className="validation-panel validation-panel-success">
        <div className="validation-status">
          <span className="status-icon">✓</span>
          <span>YAML is valid</span>
        </div>
      </div>
    );
  }

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;

  return (
    <div className={`validation-panel ${hasErrors ? 'validation-panel-error' : 'validation-panel-warning'}`}>
      <div
        className="validation-panel-header"
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
        <div className="validation-status">
          <span className="status-icon">{hasErrors ? '✗' : '⚠'}</span>
          <span>
            {hasErrors && `${validationResult.errors.length} error(s)`}
            {hasErrors && hasWarnings && ', '}
            {hasWarnings && `${validationResult.warnings.length} warning(s)`}
          </span>
        </div>
        <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="validation-panel-content">
          {hasErrors && (
            <div className="validation-errors" role="alert">
              <h4>Errors</h4>
              <ul>
                {validationResult.errors.map((error, index) => (
                  <li key={index}>
                    {error.message || error}
                    {error.line && (
                      <button
                        className="error-line-link"
                        onClick={() => onErrorClick && onErrorClick(error.line)}
                        aria-label={`Go to line ${error.line}`}
                      >
                        (Line {error.line})
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasWarnings && (
            <div className="validation-warnings">
              <h4>Warnings</h4>
              <ul>
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>
                    {typeof warning === 'string' ? warning : warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ValidationPanel.propTypes = {
  validationResult: PropTypes.shape({
    valid: PropTypes.bool,
    errors: PropTypes.array,
    warnings: PropTypes.array,
  }),
  onErrorClick: PropTypes.func,
};

export default ValidationPanel;


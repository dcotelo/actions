import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const JobModal = ({ job, jobId, onClose }) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const toggleStep = (index) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Focus trap and ESC key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, []);

  if (!job) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        role="document"
      >
        <div className="modal-header">
          <h2 id="modal-title">{jobId}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            ref={closeButtonRef}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="job-info">
            <h3>Configuration</h3>
            <div className="info-group">
              <label>Runs on:</label>
              <span>{Array.isArray(job['runs-on']) ? 
                job['runs-on'].join(', ') : 
                job['runs-on']}</span>
            </div>
            {job.needs && (
              <div className="info-group">
                <label>Depends on:</label>
                <span>{Array.isArray(job.needs) ? 
                  job.needs.join(', ') : 
                  job.needs}</span>
              </div>
            )}
          </div>
          {job.steps && (
            <div className="job-steps">
              <h3>Steps</h3>
              {job.steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div 
                    className="step-header"
                    onClick={() => toggleStep(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleStep(index);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expandedSteps.has(index)}
                    aria-controls={`step-details-${index}`}
                    aria-label={`${expandedSteps.has(index) ? 'Collapse' : 'Expand'} step ${index + 1}`}
                  >
                    <div className="step-title">
                      {step.name && <strong>{step.name}</strong>}
                      {!step.name && step.uses && <code>{step.uses}</code>}
                      {!step.name && !step.uses && <em>Step {index + 1}</em>}
                    </div>
                    <button 
                      className="step-toggle"
                      aria-label={expandedSteps.has(index) ? 'Collapse step' : 'Expand step'}
                    >
                      {expandedSteps.has(index) ? '−' : '+'}
                    </button>
                  </div>
                  {expandedSteps.has(index) && (
                    <div 
                      className="step-details"
                      id={`step-details-${index}`}
                      role="region"
                    >
                      {step.uses && (
                        <div className="step-field">
                          <label>Uses:</label>
                          <code>{step.uses}</code>
                        </div>
                      )}
                      {step.run && (
                        <div className="step-field">
                          <label>Run:</label>
                          <pre>{step.run}</pre>
                        </div>
                      )}
                      {step.with && (
                        <div className="step-field">
                          <label>With:</label>
                          <pre>{JSON.stringify(step.with, null, 2)}</pre>
                        </div>
                      )}
                      {step.env && (
                        <div className="step-field">
                          <label>Environment:</label>
                          <pre>{JSON.stringify(step.env, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

JobModal.propTypes = {
  job: PropTypes.shape({
    'runs-on': PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    needs: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    steps: PropTypes.arrayOf(PropTypes.object)
  }),
  jobId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default JobModal;

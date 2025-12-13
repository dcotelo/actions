/**
 * Main App Component
 * GitHub Actions Workflow Viewer & Editor
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWorkflow } from './hooks/useWorkflow';
import { useValidation } from './hooks/useValidation';
import { useMode, MODES } from './hooks/useMode';
import { readFileAsText, downloadFile, validateFile } from './utils/fileHandler';
import { EXAMPLE_WORKFLOWS } from './constants/examples';
import ModeSwitcher from './components/ModeSwitcher';
import WorkflowViewer from './components/WorkflowViewer';
import WorkflowEditor from './components/WorkflowEditor';
import ValidationPanel from './components/ValidationPanel';
import './App.css';

function App() {
  // Hooks
  const workflow = useWorkflow();
  const validation = useValidation(workflow.yamlContent, true);
  const mode = useMode(MODES.EDITOR);

  // State
  const [toast, setToast] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Toast notifications
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await readFileAsText(file);
      workflow.loadWorkflow(result.content, file);
      showToast('File loaded successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Error loading file', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [workflow, showToast]);

  // File input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  }, [handleFileUpload]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Download handler
  const handleDownload = useCallback(() => {
    if (!workflow.yamlContent) {
      showToast('No content to download', 'error');
      return;
    }

    const success = downloadFile(workflow.yamlContent, workflow.filename);
    if (success) {
      workflow.markAsSaved();
      showToast('File downloaded', 'success');
    } else {
      showToast('Error downloading file', 'error');
    }
  }, [workflow, showToast]);

  // Load example
  const handleLoadExample = useCallback((exampleKey) => {
    const example = EXAMPLE_WORKFLOWS[exampleKey];
    if (example) {
      workflow.loadWorkflow(example.yaml);
      showToast(`Loaded ${example.name} example`, 'success');
    }
  }, [workflow, showToast]);

  // Clear workflow
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the workflow? This action cannot be undone.')) {
      workflow.clearWorkflow();
      showToast('Workflow cleared', 'success');
    }
  }, [workflow, showToast]);

  // Mode switching with validation
  const handleModeSwitch = useCallback((newMode) => {
    if (newMode === MODES.VIEWER) {
      // Validate before switching to viewer
      const result = validation.validateImmediate(workflow.yamlContent);
      if (!result.valid || result.errors.length > 0) {
        showToast('Cannot switch to Viewer: Please fix validation errors first', 'error');
        return;
      }
      mode.switchToViewer();
    } else if (newMode === MODES.EDITOR) {
      mode.switchToEditor();
    }
  }, [validation, workflow, mode, showToast]);

  // Check if can switch to viewer
  const canSwitchToViewer = validation.isValid && workflow.yamlContent.trim().length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to download
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleDownload();
      }
      // Ctrl/Cmd + O to open file
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDownload]);

  const hasContent = workflow.yamlContent.trim().length > 0;

  return (
    <div 
      className="App" 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="app-header">
        <h1>GitHub Actions Workflow Viewer & Editor</h1>
        <div className="header-actions">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            aria-label="Upload workflow file"
          >
            Upload
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-primary"
            disabled={!hasContent}
            aria-label="Download workflow file"
          >
            Download
          </button>
          <button
            onClick={handleClear}
            className="btn btn-secondary"
            disabled={!hasContent}
            aria-label="Clear workflow"
          >
            Clear
          </button>
        </div>
      </header>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}

      {isDragging && (
        <div className="drag-overlay" aria-hidden="true">
          <div className="drag-overlay-content">
            <p>Drop your YAML file here</p>
          </div>
        </div>
      )}

      {!hasContent && (
        <div className="empty-state" role="region" aria-label="Welcome screen">
          <h2>Welcome to GitHub Actions Workflow Editor</h2>
          <p>Get started by uploading a YAML file, choosing an example template, or start writing in the editor below:</p>
          <div className="example-templates">
            {Object.entries(EXAMPLE_WORKFLOWS).map(([key, example]) => (
              <button
                key={key}
                onClick={() => handleLoadExample(key)}
                className="example-btn"
                aria-label={`Load ${example.name} example`}
              >
                {example.name}
              </button>
            ))}
          </div>
          <div className="drag-drop-zone">
            <p>Or drag and drop a YAML file here</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
              aria-label="Upload YAML file"
            >
              Upload YAML File
            </button>
          </div>
        </div>
      )}

      <ModeSwitcher
        currentMode={mode.currentMode}
        onSwitch={handleModeSwitch}
        canSwitchToViewer={canSwitchToViewer && hasContent}
        validationMessage={!canSwitchToViewer && hasContent ? 'Fix validation errors to view workflow' : null}
      />

      {isLoading && (
        <div className="loading-overlay" aria-label="Loading">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}

      {hasContent && (
        <ValidationPanel
          validationResult={validation.validationResult}
          onErrorClick={(lineNumber) => {
            // Error click handled by editor
          }}
        />
      )}

      {mode.isViewer && hasContent && (
        <WorkflowViewer
          workflowMetadata={workflow.workflowMetadata}
          validationWarnings={validation.validationResult.warnings}
        />
      )}

      {mode.isEditor && (
        <WorkflowEditor
          value={workflow.yamlContent}
          onChange={workflow.updateContent}
          validationErrors={validation.validationResult.errors}
          onErrorClick={(lineNumber) => {
            // Handled by editor component
          }}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".yml,.yaml"
        style={{ display: 'none' }}
        aria-label="File input for YAML upload"
      />
    </div>
  );
}

export default App;

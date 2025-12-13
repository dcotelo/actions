/**
 * WorkflowEditor - Editor component wrapper
 */
import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import MonacoEditor from '../editor/MonacoEditor';

const WorkflowEditor = ({
  value,
  onChange,
  validationErrors = [],
  onErrorClick,
}) => {
  const [editorOptions, setEditorOptions] = useState({
    lineNumbers: 'on',
    wordWrap: 'on',
    minimap: { enabled: true },
  });
  const editorRef = useRef(null);

  // Convert validation errors to Monaco markers
  const markers = React.useMemo(() => {
    return validationErrors
      .filter(error => error.line)
      .map(error => ({
        startLineNumber: error.line,
        startColumn: 1,
        endLineNumber: error.line,
        endColumn: 1000,
        message: error.message || 'Validation error',
        severity: 8, // Error
      }));
  }, [validationErrors]);

  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
  }, []);

  const toggleOption = (option) => {
    setEditorOptions(prev => {
      if (option === 'minimap') {
        return {
          ...prev,
          minimap: { enabled: !prev.minimap.enabled },
        };
      }
      return {
        ...prev,
        [option]: prev[option] === 'on' ? 'off' : 'on',
      };
    });
  };

  const handleErrorClick = useCallback((lineNumber) => {
    if (editorRef.current && lineNumber) {
      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.focus();
    }
    if (onErrorClick) {
      onErrorClick(lineNumber);
    }
  }, [onErrorClick]);

  return (
    <div className="workflow-editor" role="region" aria-label="Workflow editor">
      <div className="editor-controls">
        <div className="editor-options">
          <button
            onClick={() => toggleOption('lineNumbers')}
            className="option-btn"
            aria-label={`Toggle line numbers (currently ${editorOptions.lineNumbers})`}
            title="Toggle line numbers"
          >
            LN
          </button>
          <button
            onClick={() => toggleOption('wordWrap')}
            className="option-btn"
            aria-label={`Toggle word wrap (currently ${editorOptions.wordWrap})`}
            title="Toggle word wrap"
          >
            WW
          </button>
          <button
            onClick={() => toggleOption('minimap')}
            className="option-btn"
            aria-label={`Toggle minimap (currently ${editorOptions.minimap.enabled ? 'on' : 'off'})`}
            title="Toggle minimap"
          >
            MM
          </button>
        </div>
      </div>

      <MonacoEditor
        value={value}
        onChange={onChange}
        onMount={handleEditorMount}
        options={{
          ...editorOptions,
          markers,
        }}
        height="70vh"
      />
    </div>
  );
};

WorkflowEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.array,
  onErrorClick: PropTypes.func,
};

export default WorkflowEditor;


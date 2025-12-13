/**
 * MonacoEditor - Wrapper for Monaco Editor
 */
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

const MonacoEditor = ({
  value,
  onChange,
  onMount,
  options = {},
  height = '60vh',
  ...props
}) => {
  const editorRef = useRef(null);

  const defaultOptions = {
    lineNumbers: 'on',
    wordWrap: 'on',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    automaticLayout: true,
    ...options,
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  // Set error markers
  useEffect(() => {
    if (!editorRef.current || !options.markers) return;

    const monaco = window.monaco;
    if (!monaco) return;

    const model = editorRef.current.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, 'validation', options.markers);
    }
  }, [options.markers]);

  return (
    <Editor
      height={height}
      defaultLanguage="yaml"
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={defaultOptions}
      onMount={handleEditorDidMount}
      {...props}
    />
  );
};

MonacoEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onMount: PropTypes.func,
  options: PropTypes.object,
  height: PropTypes.string,
};

export default MonacoEditor;


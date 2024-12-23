// src/App.js
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import yaml from 'js-yaml';
import JobsViewer from './JobsViewer';
import './App.css';

function App() {
  const [yamlContent, setYamlContent] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [parsedJobs, setParsedJobs] = useState(null);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const fileInputRef = useRef(null);

  const validateYaml = (content) => {
    try {
      const parsed = yaml.load(content);
      setValidationErrors([]);
      setParsedJobs(parsed?.jobs || null);
    } catch (e) {
      setValidationErrors([e.message]);
      setParsedJobs(null);
    }
  };

  const handleEditorChange = (value) => {
    setYamlContent(value);
    validateYaml(value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setYamlContent(e.target.result);
        validateYaml(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="App">
      <h1>GitHub Actions Validator</h1>
      
      {parsedJobs && !validationErrors.length && (
        <JobsViewer jobs={parsedJobs} />
      )}

      <div className="editor-controls">
        <button onClick={() => fileInputRef.current?.click()} className="upload-btn">
          Upload YAML
        </button>
        <button onClick={() => setIsEditorCollapsed(!isEditorCollapsed)} className="collapse-btn">
          {isEditorCollapsed ? 'Show Editor' : 'Hide Editor'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".yml,.yaml"
          style={{ display: 'none' }}
        />
      </div>

      <div className={`editor-container ${isEditorCollapsed ? 'collapsed' : ''}`}>
        <Editor
          height="500px"
          defaultLanguage="yaml"
          value={yamlContent}
          onChange={handleEditorChange}
          theme="vs-dark"
        />
      </div>
      <div className="validation-results">
        {validationErrors.length > 0 ? (
          <div className="errors">
            <h3>Validation Errors:</h3>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="success">YAML is valid</div>
        )}
      </div>
    </div>
  );
}

export default App;
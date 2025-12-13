/**
 * Custom hook for workflow state management
 */
import { useState, useCallback, useEffect } from 'react';
import { parseYaml } from '../utils/yamlParser';
import { extractWorkflowMetadata } from '../utils/workflowModel';

export const useWorkflow = (initialContent = '') => {
  const [yamlContent, setYamlContent] = useState(initialContent);
  const [parsedWorkflow, setParsedWorkflow] = useState(null);
  const [workflowMetadata, setWorkflowMetadata] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [filename, setFilename] = useState('workflow.yml');

  // Parse YAML and extract metadata when content changes
  useEffect(() => {
    if (!yamlContent || yamlContent.trim() === '') {
      setParsedWorkflow(null);
      setWorkflowMetadata(null);
      return;
    }

    const parseResult = parseYaml(yamlContent);
    if (parseResult.success && parseResult.parsed) {
      setParsedWorkflow(parseResult.parsed);
      const metadata = extractWorkflowMetadata(parseResult.parsed);
      setWorkflowMetadata(metadata);
    } else {
      setParsedWorkflow(null);
      setWorkflowMetadata(null);
    }
  }, [yamlContent]);

  // Update YAML content
  const updateContent = useCallback((newContent) => {
    setYamlContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  // Load workflow from content
  const loadWorkflow = useCallback((content, file = null) => {
    setYamlContent(content);
    setHasUnsavedChanges(false);
    if (file) {
      setFilename(file.name || 'workflow.yml');
    }
  }, []);

  // Clear workflow
  const clearWorkflow = useCallback(() => {
    setYamlContent('');
    setParsedWorkflow(null);
    setWorkflowMetadata(null);
    setHasUnsavedChanges(false);
    setFilename('workflow.yml');
  }, []);

  // Mark as saved
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    yamlContent,
    parsedWorkflow,
    workflowMetadata,
    hasUnsavedChanges,
    filename,
    updateContent,
    loadWorkflow,
    clearWorkflow,
    markAsSaved,
    setFilename,
  };
};


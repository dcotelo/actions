/**
 * Custom hook for mode switching logic
 */
import { useState, useCallback } from 'react';

export const MODES = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
};

export const useMode = (initialMode = MODES.EDITOR) => {
  const [currentMode, setCurrentMode] = useState(initialMode);

  const switchToViewer = useCallback(() => {
    setCurrentMode(MODES.VIEWER);
  }, []);

  const switchToEditor = useCallback(() => {
    setCurrentMode(MODES.EDITOR);
  }, []);

  const toggleMode = useCallback(() => {
    setCurrentMode(prev => 
      prev === MODES.VIEWER ? MODES.EDITOR : MODES.VIEWER
    );
  }, []);

  const isViewer = currentMode === MODES.VIEWER;
  const isEditor = currentMode === MODES.EDITOR;

  return {
    currentMode,
    isViewer,
    isEditor,
    switchToViewer,
    switchToEditor,
    toggleMode,
  };
};


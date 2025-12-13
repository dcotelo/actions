export const STORAGE_KEYS = {
  YAML_CONTENT: 'github-actions-editor-yaml',
  EDITOR_COLLAPSED: 'github-actions-editor-collapsed',
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

export const loadFromStorage = (key, defaultValue = '') => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage:`, error);
    return defaultValue;
  }
};

export const clearStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
  }
};


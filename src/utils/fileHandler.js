/**
 * File handling utilities for import/export
 */

/**
 * Read file as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file type
    if (!file.name.match(/\.(yml|yaml)$/i)) {
      reject(new Error('File must be a .yml or .yaml file'));
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('File size exceeds 5MB limit'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve({
        content: e.target.result,
        filename: file.name,
        size: file.size,
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Download content as file
 */
export const downloadFile = (content, filename = 'workflow.yml') => {
  try {
    const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

/**
 * Extract filename from file path or use default
 */
export const getFilename = (file, defaultName = 'workflow.yml') => {
  if (!file) return defaultName;
  
  if (typeof file === 'string') {
    // If it's already a filename
    return file.endsWith('.yml') || file.endsWith('.yaml') ? file : `${file}.yml`;
  }
  
  if (file.name) {
    return file.name;
  }
  
  return defaultName;
};

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  if (!file.name.match(/\.(yml|yaml)$/i)) {
    return { valid: false, error: 'File must be a .yml or .yaml file' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  return { valid: true, error: null };
};


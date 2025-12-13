/**
 * YAML parsing utilities with error handling
 */
import yaml from 'js-yaml';

/**
 * Parse YAML content with error handling
 */
export const parseYaml = (content) => {
  if (!content || typeof content !== 'string') {
    return {
      success: false,
      error: 'Content is empty or not a string',
      parsed: null,
    };
  }

  try {
    const parsed = yaml.load(content, {
      schema: yaml.DEFAULT_SCHEMA,
    });
    return {
      success: true,
      error: null,
      parsed,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown YAML parsing error',
      parsed: null,
      line: extractLineNumber(error.message),
    };
  }
};

/**
 * Extract line number from error message
 */
export const extractLineNumber = (errorMessage) => {
  if (!errorMessage) return null;
  
  const match = errorMessage.match(/line (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Stringify object to YAML
 */
export const stringifyYaml = (obj) => {
  try {
    return yaml.dump(obj, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
  } catch (error) {
    throw new Error(`Failed to stringify YAML: ${error.message}`);
  }
};


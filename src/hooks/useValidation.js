/**
 * Custom hook for validation logic
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { validateWorkflow } from '../utils/workflowValidator';
import { debounce } from '../utils/debounce';

export const useValidation = (yamlContent, enabled = true) => {
  const [validationResult, setValidationResult] = useState({
    valid: true,
    errors: [],
    warnings: [],
  });
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation function
  const debouncedValidateRef = useRef(null);

  useEffect(() => {
    debouncedValidateRef.current = debounce((content) => {
      setIsValidating(true);
      const result = validateWorkflow(content);
      setValidationResult(result);
      setIsValidating(false);
    }, 300);
  }, []);

  // Validate when content changes
  useEffect(() => {
    if (!enabled) {
      setValidationResult({ valid: true, errors: [], warnings: [] });
      return;
    }

    if (!yamlContent || yamlContent.trim() === '') {
      setValidationResult({ valid: true, errors: [], warnings: [] });
      return;
    }

    if (debouncedValidateRef.current) {
      debouncedValidateRef.current(yamlContent);
    }
  }, [yamlContent, enabled]);

  // Immediate validation (for mode switching)
  const validateImmediate = useCallback((content) => {
    setIsValidating(true);
    const result = validateWorkflow(content || yamlContent);
    setValidationResult(result);
    setIsValidating(false);
    return result;
  }, [yamlContent]);

  return {
    validationResult,
    isValidating,
    isValid: validationResult.valid && validationResult.errors.length === 0,
    hasErrors: validationResult.errors.length > 0,
    hasWarnings: validationResult.warnings.length > 0,
    validateImmediate,
  };
};


/**
 * Enhanced workflow validation
 * Validates both YAML syntax and GitHub Actions structure
 */
import { parseYaml } from './yamlParser';
import { detectCycles } from './graphLayout';

/**
 * Validation result structure
 */
export const createValidationResult = () => ({
  valid: true,
  errors: [],
  warnings: [],
});

/**
 * Validate workflow YAML content
 */
export const validateWorkflow = (content) => {
  const result = createValidationResult();

  // Step 1: YAML syntax validation
  const parseResult = parseYaml(content);
  if (!parseResult.success) {
    result.valid = false;
    result.errors.push({
      type: 'syntax',
      message: parseResult.error,
      line: parseResult.line,
    });
    return result;
  }

  const parsed = parseResult.parsed;

  // Step 2: Top-level structure validation
  if (!parsed || typeof parsed !== 'object') {
    result.valid = false;
    result.errors.push({
      type: 'structure',
      message: 'Workflow must be a YAML object',
    });
    return result;
  }

  // Step 3: Check for required top-level keys
  if (!parsed.on && !parsed.on) {
    result.warnings.push({
      type: 'structure',
      message: 'Workflow should have an "on" field defining triggers',
    });
  }

  if (!parsed.jobs || typeof parsed.jobs !== 'object' || Object.keys(parsed.jobs).length === 0) {
    result.warnings.push({
      type: 'structure',
      message: 'Workflow should have at least one job defined',
    });
  }

  // Step 4: Validate each job
  if (parsed.jobs && typeof parsed.jobs === 'object') {
    Object.entries(parsed.jobs).forEach(([jobId, job]) => {
      validateJob(jobId, job, result);
    });
  }

  // Step 5: Check for circular dependencies using graph layout utility
  if (parsed.jobs) {
    const cycles = detectCycles(parsed.jobs);
    if (cycles.length > 0) {
      cycles.forEach(cycle => {
        result.valid = false;
        result.errors.push({
          type: 'dependency',
          message: `Circular dependency detected: ${cycle.join(' → ')}`,
          cycle: cycle,
        });
      });
    }
    
    // Also check with legacy method for missing dependencies
    const circularDeps = checkCircularDependencies(parsed.jobs);
    circularDeps.forEach(error => {
      if (!result.errors.some(e => e.message === error.message)) {
        result.valid = false;
        result.errors.push(error);
      }
    });
  }

  return result;
};

/**
 * Validate a single job
 */
const validateJob = (jobId, job, result) => {
  if (!job || typeof job !== 'object') {
    result.valid = false;
    result.errors.push({
      type: 'job',
      jobId,
      message: `Job "${jobId}" must be an object`,
    });
    return;
  }

  // Check runs-on
  if (!job['runs-on']) {
    result.warnings.push({
      type: 'job',
      jobId,
      message: `Job "${jobId}" is missing "runs-on" field`,
    });
  }

  // Check steps
  if (!job.steps || !Array.isArray(job.steps) || job.steps.length === 0) {
    result.warnings.push({
      type: 'job',
      jobId,
      message: `Job "${jobId}" has no steps defined`,
    });
  } else {
    // Validate each step
    job.steps.forEach((step, index) => {
      validateStep(jobId, index, step, result);
    });
  }

  // Check needs (dependencies)
  if (job.needs) {
    const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
    needs.forEach(neededJobId => {
      if (typeof neededJobId !== 'string') {
        result.warnings.push({
          type: 'job',
          jobId,
          message: `Job "${jobId}" has invalid dependency format`,
        });
      }
    });
  }
};

/**
 * Validate a single step
 */
const validateStep = (jobId, stepIndex, step, result) => {
  if (!step || typeof step !== 'object') {
    result.valid = false;
    result.errors.push({
      type: 'step',
      jobId,
      stepIndex,
      message: `Step ${stepIndex + 1} in job "${jobId}" must be an object`,
    });
    return;
  }

  // Step must have either 'uses' or 'run'
  if (!step.uses && !step.run) {
    result.valid = false;
    result.errors.push({
      type: 'step',
      jobId,
      stepIndex,
      message: `Step ${stepIndex + 1} in job "${jobId}" must have either "uses" or "run"`,
    });
  }

  // Warning for missing step name
  if (!step.name && step.run) {
    result.warnings.push({
      type: 'step',
      jobId,
      stepIndex,
      message: `Step ${stepIndex + 1} in job "${jobId}" has no name (recommended for clarity)`,
    });
  }
};

/**
 * Check for circular dependencies
 */
const checkCircularDependencies = (jobs) => {
  const errors = [];
  const visited = new Set();
  const recursionStack = new Set();

  const hasCycle = (jobId) => {
    if (recursionStack.has(jobId)) {
      return true; // Circular dependency detected
    }
    if (visited.has(jobId)) {
      return false; // Already processed
    }

    visited.add(jobId);
    recursionStack.add(jobId);

    const job = jobs[jobId];
    if (job && job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      for (const needId of needs) {
        if (jobs[needId] && hasCycle(needId)) {
          errors.push({
            type: 'dependency',
            message: `Circular dependency detected involving job "${jobId}"`,
            jobId,
          });
          return true;
        }
      }
    }

    recursionStack.delete(jobId);
    return false;
  };

  Object.keys(jobs).forEach(jobId => {
    if (!visited.has(jobId)) {
      hasCycle(jobId);
    }
  });

  // Check for self-references
  Object.entries(jobs).forEach(([jobId, job]) => {
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      if (needs.includes(jobId)) {
        errors.push({
          type: 'dependency',
          message: `Job "${jobId}" has a circular dependency on itself`,
          jobId,
        });
      }
    }
  });

  return errors;
};

/**
 * Get validation summary
 */
export const getValidationSummary = (result) => {
  return {
    isValid: result.valid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    hasErrors: result.errors.length > 0,
    hasWarnings: result.warnings.length > 0,
  };
};


/**
 * Workflow data model and utilities
 * Provides structured representation of GitHub Actions workflows
 */

/**
 * Extract workflow metadata from parsed YAML
 */
export const extractWorkflowMetadata = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  return {
    name: parsed.name || null,
    on: parsed.on || null,
    triggers: extractTriggers(parsed.on),
    jobs: parsed.jobs || {},
  };
};

/**
 * Extract trigger information from 'on' field
 */
export const extractTriggers = (onField) => {
  if (!onField) return [];

  const triggers = [];

  // Handle string triggers (simple case)
  if (typeof onField === 'string') {
    triggers.push({
      type: onField,
      branches: null,
      paths: null,
    });
    return triggers;
  }

  // Handle array of strings
  if (Array.isArray(onField)) {
    return onField.map(type => ({
      type,
      branches: null,
      paths: null,
    }));
  }

  // Handle object with event types
  if (typeof onField === 'object') {
    Object.entries(onField).forEach(([eventType, config]) => {
      const trigger = {
        type: eventType,
        branches: null,
        paths: null,
        ...(typeof config === 'object' && config !== null ? {
          branches: config.branches || config.branch || null,
          paths: config.paths || config.path || null,
          tags: config.tags || config.tag || null,
          types: config.types || null,
        } : {}),
      };
      triggers.push(trigger);
    });
  }

  return triggers;
};

/**
 * Calculate job dependencies
 */
export const calculateJobDependencies = (jobs) => {
  if (!jobs || typeof jobs !== 'object') {
    return {};
  }

  const dependencies = {};

  Object.entries(jobs).forEach(([jobId, job]) => {
    dependencies[jobId] = {
      id: jobId,
      name: job.name || null,
      needs: job.needs ? (Array.isArray(job.needs) ? job.needs : [job.needs]) : [],
      dependents: [],
    };
  });

  // Calculate dependents (reverse dependencies)
  Object.entries(dependencies).forEach(([jobId, deps]) => {
    deps.needs.forEach(neededJobId => {
      if (dependencies[neededJobId]) {
        dependencies[neededJobId].dependents.push(jobId);
      }
    });
  });

  return dependencies;
};

/**
 * Get job levels for visualization (0 = no dependencies, 1 = depends on level 0, etc.)
 */
export const calculateJobLevels = (jobs) => {
  const levels = {};
  const visited = new Set();

  const getJobLevel = (jobId) => {
    if (visited.has(jobId)) return levels[jobId];
    visited.add(jobId);

    const job = jobs[jobId];
    if (!job || !job.needs || (Array.isArray(job.needs) && job.needs.length === 0)) {
      levels[jobId] = 0;
      return 0;
    }

    const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
    const dependencyLevels = needs
      .filter(needId => jobs[needId]) // Only count existing jobs
      .map(getJobLevel);
    
    if (dependencyLevels.length === 0) {
      levels[jobId] = 0;
    } else {
      levels[jobId] = Math.max(...dependencyLevels) + 1;
    }
    return levels[jobId];
  };

  Object.keys(jobs).forEach(jobId => getJobLevel(jobId));
  return levels;
};

/**
 * Group jobs by level for visualization
 */
export const groupJobsByLevel = (jobs) => {
  const levels = calculateJobLevels(jobs);
  const groups = {};

  Object.entries(levels).forEach(([jobId, level]) => {
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(jobId);
  });

  return groups;
};

/**
 * Extract step information
 */
export const extractStepInfo = (step, index) => {
  return {
    index,
    name: step.name || null,
    uses: step.uses || null,
    run: step.run || null,
    if: step.if || null,
    with: step.with || null,
    env: step.env || null,
    id: step.id || null,
    continueOnError: step['continue-on-error'] || false,
    timeoutMinutes: step['timeout-minutes'] || null,
  };
};

/**
 * Check if job uses matrix strategy
 */
export const hasMatrixStrategy = (job) => {
  return !!(job && job.strategy && job.strategy.matrix);
};

/**
 * Check if workflow is reusable
 */
export const isReusableWorkflow = (parsed) => {
  return !!(parsed && parsed.on && parsed.on.workflow_call);
};


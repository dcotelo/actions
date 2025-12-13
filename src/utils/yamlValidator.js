import yaml from 'js-yaml';

export const validateYaml = (content) => {
  const errors = [];
  const warnings = [];
  
  if (!content || content.trim() === '') {
    return { valid: false, errors: ['YAML content is empty'], warnings: [], parsed: null };
  }

  try {
    const parsed = yaml.load(content);
    
    // Basic GitHub Actions structure validation
    if (parsed && typeof parsed === 'object') {
      // Check for jobs
      if (parsed.jobs && typeof parsed.jobs !== 'object') {
        errors.push('Jobs must be an object');
      }
      
      // Validate job structure
      if (parsed.jobs) {
        Object.entries(parsed.jobs).forEach(([jobId, job]) => {
          if (!job['runs-on'] && !job['runs-on'] === undefined) {
            warnings.push(`Job "${jobId}" is missing "runs-on" field`);
          }
          
          // Check for circular dependencies
          if (job.needs) {
            const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
            needs.forEach(needId => {
              if (needId === jobId) {
                errors.push(`Job "${jobId}" has a circular dependency on itself`);
              }
              if (parsed.jobs[needId] && parsed.jobs[needId].needs) {
                const needNeeds = Array.isArray(parsed.jobs[needId].needs) 
                  ? parsed.jobs[needId].needs 
                  : [parsed.jobs[needId].needs];
                if (needNeeds.includes(jobId)) {
                  errors.push(`Circular dependency detected between "${jobId}" and "${needId}"`);
                }
              }
            });
          }
        });
      }
    }
    
    return { 
      valid: errors.length === 0, 
      errors, 
      warnings, 
      parsed 
    };
  } catch (e) {
    // Try to extract line number from error message
    const lineMatch = e.message.match(/line (\d+)/i);
    const lineNumber = lineMatch ? parseInt(lineMatch[1]) : null;
    
    return { 
      valid: false, 
      errors: [{ message: e.message, line: lineNumber }], 
      warnings: [], 
      parsed: null 
    };
  }
};

export const getErrorLineNumber = (error) => {
  if (typeof error === 'string') {
    const match = error.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
  return error?.line || null;
};


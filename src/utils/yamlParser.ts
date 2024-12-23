import yaml from 'js-yaml';
import { Workflow } from '../types/workflow';

export const yamlToWorkflow = (yamlContent: string): Workflow => {
  try {
    return yaml.load(yamlContent) as Workflow;
  } catch (error) {
    throw new Error('Invalid YAML format');
  }
};

export const workflowToYaml = (workflow: Workflow): string => {
  try {
    return yaml.dump(workflow);
  } catch (error) {
    throw new Error('Failed to convert workflow to YAML');
  }
};
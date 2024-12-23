export interface WorkflowStep {
    id: string;
    name: string;
    uses?: string;
    run?: string;
    with?: Record<string, string>;
  }
  
  export interface WorkflowJob {
    id: string;
    name: string;
    runsOn: string;
    steps: WorkflowStep[];
  }
  
  export interface Workflow {
    name: string;
    on: string[];
    jobs: Record<string, WorkflowJob>;
  }
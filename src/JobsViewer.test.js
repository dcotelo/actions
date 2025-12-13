import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobsViewer from './JobsViewer';

// Mock FlowDiagram
jest.mock('./FlowDiagram', () => {
  return function MockFlowDiagram({ jobs }) {
    return <div data-testid="flow-diagram">Flow Diagram</div>;
  };
});

describe('JobsViewer', () => {
  const mockJobs = {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { name: 'Checkout', uses: 'actions/checkout@v3' },
        { name: 'Build', run: 'npm run build' }
      ]
    },
    test: {
      'runs-on': 'ubuntu-latest',
      needs: 'build',
      steps: [
        { run: 'npm test' }
      ]
    }
  };

  test('renders workflow jobs', () => {
    render(<JobsViewer jobs={mockJobs} />);
    expect(screen.getByText(/Workflow Jobs/i)).toBeInTheDocument();
    expect(screen.getByText('build')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('renders job details', () => {
    render(<JobsViewer jobs={mockJobs} />);
    expect(screen.getByText(/Runs on:/i)).toBeInTheDocument();
    expect(screen.getByText(/ubuntu-latest/i)).toBeInTheDocument();
  });

  test('expands and collapses steps', () => {
    render(<JobsViewer jobs={mockJobs} />);
    const stepHeaders = screen.getAllByLabelText(/Expand step/i);
    
    fireEvent.click(stepHeaders[0]);
    expect(screen.getByText(/Uses:/i)).toBeInTheDocument();
    
    const collapseBtn = screen.getByLabelText(/Collapse step/i);
    fireEvent.click(collapseBtn);
  });

  test('handles keyboard navigation for steps', () => {
    render(<JobsViewer jobs={mockJobs} />);
    const stepHeader = screen.getAllByRole('button')[0];
    
    fireEvent.keyDown(stepHeader, { key: 'Enter' });
    expect(screen.getByText(/Uses:/i)).toBeInTheDocument();
  });

  test('renders steps with different properties', () => {
    const jobsWithVariousSteps = {
      job1: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { name: 'Named step', run: 'echo test' },
          { uses: 'actions/checkout@v3' },
          { run: 'npm install' }
        ]
      }
    };
    render(<JobsViewer jobs={jobsWithVariousSteps} />);
    expect(screen.getByText('Named step')).toBeInTheDocument();
  });

  test('handles jobs without steps', () => {
    const jobsWithoutSteps = {
      job1: {
        'runs-on': 'ubuntu-latest'
      }
    };
    render(<JobsViewer jobs={jobsWithoutSteps} />);
    expect(screen.getByText('job1')).toBeInTheDocument();
  });

  test('handles array runs-on', () => {
    const jobsWithArrayRunsOn = {
      job1: {
        'runs-on': ['ubuntu-latest', 'windows-latest']
      }
    };
    render(<JobsViewer jobs={jobsWithArrayRunsOn} />);
    expect(screen.getByText(/ubuntu-latest, windows-latest/i)).toBeInTheDocument();
  });
});


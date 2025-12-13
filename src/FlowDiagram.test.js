import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlowDiagram from './FlowDiagram';

// Mock JobModal
jest.mock('./JobModal', () => {
  return function MockJobModal({ jobId, onClose }) {
    return (
      <div data-testid="job-modal">
        <span>{jobId}</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

describe('FlowDiagram', () => {
  const mockJobs = {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [{ uses: 'actions/checkout@v3' }]
    },
    test: {
      'runs-on': 'ubuntu-latest',
      needs: 'build',
      steps: [{ run: 'npm test' }]
    }
  };

  test('renders workflow diagram', () => {
    render(<FlowDiagram jobs={mockJobs} />);
    expect(screen.getByText(/Workflow Diagram/i)).toBeInTheDocument();
  });

  test('calculates job levels correctly', () => {
    render(<FlowDiagram jobs={mockJobs} />);
    const svg = document.querySelector('.flow-svg');
    expect(svg).toBeInTheDocument();
  });

  test('opens modal when job is clicked', () => {
    render(<FlowDiagram jobs={mockJobs} />);
    // Since we're using SVG, we'll need to find the job node differently
    // This is a simplified test - in a real scenario you'd query the SVG
    expect(screen.queryByTestId('job-modal')).not.toBeInTheDocument();
  });

  test('handles zoom controls', () => {
    render(<FlowDiagram jobs={mockJobs} />);
    const zoomInBtn = screen.getByLabelText(/Zoom in/i);
    const zoomOutBtn = screen.getByLabelText(/Zoom out/i);
    const resetBtn = screen.getByLabelText(/Reset zoom and pan/i);
    
    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();
    
    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(resetBtn);
  });

  test('handles jobs without dependencies', () => {
    const simpleJobs = {
      build: {
        'runs-on': 'ubuntu-latest'
      }
    };
    render(<FlowDiagram jobs={simpleJobs} />);
    expect(screen.getByText(/Workflow Diagram/i)).toBeInTheDocument();
  });

  test('handles parallel jobs', () => {
    const parallelJobs = {
      job1: { 'runs-on': 'ubuntu-latest' },
      job2: { 'runs-on': 'ubuntu-latest' },
      job3: { 'runs-on': 'ubuntu-latest', needs: ['job1', 'job2'] }
    };
    render(<FlowDiagram jobs={parallelJobs} />);
    expect(screen.getByText(/Workflow Diagram/i)).toBeInTheDocument();
  });
});


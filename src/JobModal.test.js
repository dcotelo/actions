import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobModal from './JobModal';

describe('JobModal', () => {
  const mockJob = {
    'runs-on': 'ubuntu-latest',
    needs: 'build',
    steps: [
      { name: 'Checkout', uses: 'actions/checkout@v3' },
      { name: 'Build', run: 'npm run build', with: { node-version: '18' } },
      { name: 'Test', run: 'npm test', env: { NODE_ENV: 'test' } }
    ]
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('renders job modal with job details', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    expect(screen.getByText('test-job')).toBeInTheDocument();
    expect(screen.getByText(/Runs on:/i)).toBeInTheDocument();
    expect(screen.getByText(/ubuntu-latest/i)).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    const closeBtn = screen.getByLabelText(/Close modal/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes modal when ESC key is pressed', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('expands and collapses steps', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    const stepHeaders = screen.getAllByLabelText(/Expand step/i);
    
    fireEvent.click(stepHeaders[0]);
    expect(screen.getByText(/Uses:/i)).toBeInTheDocument();
    
    const collapseBtn = screen.getByLabelText(/Collapse step/i);
    fireEvent.click(collapseBtn);
  });

  test('handles keyboard navigation for steps', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    const stepHeader = screen.getAllByRole('button').find(
      btn => btn.getAttribute('aria-label')?.includes('Expand step')
    );
    
    if (stepHeader) {
      fireEvent.keyDown(stepHeader, { key: 'Enter' });
      expect(screen.getByText(/Uses:/i)).toBeInTheDocument();
    }
  });

  test('displays step with properties', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    const stepHeader = screen.getAllByLabelText(/Expand step/i)[1];
    fireEvent.click(stepHeader);
    
    expect(screen.getByText(/Run:/i)).toBeInTheDocument();
    expect(screen.getByText(/With:/i)).toBeInTheDocument();
  });

  test('displays environment variables', () => {
    render(<JobModal job={mockJob} jobId="test-job" onClose={mockOnClose} />);
    const stepHeaders = screen.getAllByLabelText(/Expand step/i);
    fireEvent.click(stepHeaders[2]);
    
    expect(screen.getByText(/Environment:/i)).toBeInTheDocument();
  });

  test('handles job without needs', () => {
    const jobWithoutNeeds = {
      'runs-on': 'ubuntu-latest',
      steps: []
    };
    render(<JobModal job={jobWithoutNeeds} jobId="test-job" onClose={mockOnClose} />);
    expect(screen.getByText('test-job')).toBeInTheDocument();
    expect(screen.queryByText(/Depends on:/i)).not.toBeInTheDocument();
  });

  test('handles array needs', () => {
    const jobWithArrayNeeds = {
      'runs-on': 'ubuntu-latest',
      needs: ['build', 'lint']
    };
    render(<JobModal job={jobWithArrayNeeds} jobId="test-job" onClose={mockOnClose} />);
    expect(screen.getByText(/build, lint/i)).toBeInTheDocument();
  });

  test('handles array runs-on', () => {
    const jobWithArrayRunsOn = {
      'runs-on': ['ubuntu-latest', 'windows-latest']
    };
    render(<JobModal job={jobWithArrayRunsOn} jobId="test-job" onClose={mockOnClose} />);
    expect(screen.getByText(/ubuntu-latest, windows-latest/i)).toBeInTheDocument();
  });
});


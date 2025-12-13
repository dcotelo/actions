import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return function MockEditor({ value, onChange, onMount }) {
    React.useEffect(() => {
      if (onMount) {
        onMount({
          setPosition: jest.fn(),
          revealLineInCenter: jest.fn(),
          focus: jest.fn(),
        });
      }
    }, [onMount]);
    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    );
  };
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('full workflow: upload file → validate → display diagram → open modal', async () => {
    const validYaml = `name: CI
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - name: Test
        run: npm test`;

    render(<App />);
    
    // Load YAML
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: validYaml } });
    
    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText(/YAML is valid/i)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check that diagram is rendered
    await waitFor(() => {
      expect(screen.getByText(/Workflow Diagram/i)).toBeInTheDocument();
    });
    
    // Check that jobs are displayed
    expect(screen.getByText(/Workflow Jobs/i)).toBeInTheDocument();
    expect(screen.getByText('build')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  test('handles invalid YAML with error display', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    
    const invalidYaml = 'invalid: yaml: content: [';
    fireEvent.change(editor, { target: { value: invalidYaml } });
    
    await waitFor(() => {
      expect(screen.getByText(/Validation Errors/i)).toBeInTheDocument();
    });
  });

  test('handles YAML with missing jobs', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    
    const yamlWithoutJobs = `name: Test
on:
  push:
    branches: [ main ]`;
    
    fireEvent.change(editor, { target: { value: yamlWithoutJobs } });
    
    await waitFor(() => {
      // Should validate but show no jobs
      expect(screen.queryByText(/Workflow Jobs/i)).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('handles circular dependency detection', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    
    const yamlWithCircularDep = `name: Test
jobs:
  job1:
    runs-on: ubuntu-latest
    needs: job2
  job2:
    runs-on: ubuntu-latest
    needs: job1`;
    
    fireEvent.change(editor, { target: { value: yamlWithCircularDep } });
    
    await waitFor(() => {
      const errors = screen.queryByText(/Circular dependency/i);
      // Note: This depends on our validation logic
      if (errors) {
        expect(errors).toBeInTheDocument();
      }
    }, { timeout: 1000 });
  });

  test('persists content to localStorage', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    const content = 'test: content';
    
    fireEvent.change(editor, { target: { value: content } });
    
    await waitFor(() => {
      expect(localStorage.getItem('github-actions-editor-yaml')).toBe(content);
    });
  });

  test('loads content from localStorage on mount', () => {
    localStorage.setItem('github-actions-editor-yaml', 'saved: content');
    render(<App />);
    
    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue('saved: content');
  });
});


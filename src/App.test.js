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

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders GitHub Actions Editor title', () => {
    render(<App />);
    expect(screen.getByText('GitHub Actions Editor')).toBeInTheDocument();
  });

  test('shows empty state when no content', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to GitHub Actions Editor/i)).toBeInTheDocument();
  });

  test('loads example template', async () => {
    render(<App />);
    const basicCIButton = screen.getByLabelText(/Load Basic CI example/i);
    fireEvent.click(basicCIButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toHaveValue(expect.stringContaining('name: CI'));
    });
  });

  test('validates YAML content', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    
    fireEvent.change(editor, { target: { value: 'invalid: yaml: content:' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Validation Errors/i)).toBeInTheDocument();
    });
  });

  test('shows success message for valid YAML', async () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    
    const validYaml = `name: Test
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3`;
    
    fireEvent.change(editor, { target: { value: validYaml } });
    
    await waitFor(() => {
      expect(screen.getByText(/YAML is valid/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('toggles editor collapse', () => {
    render(<App />);
    const collapseBtn = screen.getByLabelText(/Hide editor/i);
    fireEvent.click(collapseBtn);
    expect(screen.getByLabelText(/Show editor/i)).toBeInTheDocument();
  });

  test('downloads YAML file', () => {
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: 'test: content' } });
    
    const downloadBtn = screen.getByLabelText(/Download YAML file/i);
    const createElementSpy = jest.spyOn(document, 'createElement');
    const clickSpy = jest.fn();
    
    createElementSpy.mockReturnValueOnce({
      href: '',
      download: '',
      click: clickSpy,
    });
    
    fireEvent.click(downloadBtn);
    expect(clickSpy).toHaveBeenCalled();
  });

  test('clears editor with confirmation', () => {
    window.confirm = jest.fn(() => true);
    render(<App />);
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: 'test: content' } });
    
    const clearBtn = screen.getByLabelText(/Clear editor/i);
    fireEvent.click(clearBtn);
    
    expect(window.confirm).toHaveBeenCalled();
  });
});


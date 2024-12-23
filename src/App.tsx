// src/App.tsx
import React from 'react';
import { WorkflowEditor } from './components/WorkflowEditor';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>GitHub Actions Editor</h1>
      </header>
      <main>
        <WorkflowEditor />
      </main>
    </div>
  );
};

export default App;
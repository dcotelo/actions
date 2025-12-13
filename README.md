# GitHub Actions Workflow Viewer & Editor

An interactive web-based editor and visualizer for GitHub Actions workflow files. This tool helps you create, validate, and visualize your GitHub Actions workflows with an interactive directed graph, detailed job information, and real-time YAML editing.

## 🚀 Live Demo

Visit [https://dcotelo.github.io/actions](https://dcotelo.github.io/actions) to try it out!

![GitHub Actions Workflow Viewer](https://img.shields.io/badge/GitHub-Actions-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Editor Mode
- **Monaco Editor Integration**: Full-featured YAML editor with syntax highlighting, auto-completion, and error markers
- **Real-time Validation**: Instant feedback on YAML syntax and GitHub Actions structure
- **File Management**: Upload, edit, and download workflow files
- **Example Templates**: Quick-start templates for common workflow patterns
- **Persistent Storage**: Automatically saves your work to browser localStorage

### Viewer Mode
- **Three Visualization Modes**:
  - **Simple View**: CSS-based dependency graph for quick overview
  - **Graph View**: Interactive directed graph using Dagre layout engine with zoom, pan, and dependency highlighting
  - **Textual View**: Accessible table-based dependency representation
- **Interactive Flow Diagram**: 
  - Visual representation of job dependencies with directional arrows
  - Hover to highlight complete dependency paths (upstream and downstream)
  - Cycle detection with visual warnings
  - Zoom controls (via percentage buttons)
  - Pan with middle mouse button or Space + drag
  - Layout direction toggle (Left-to-Right or Top-to-Bottom)
- **Job Details**: 
  - Expandable job cards with step-by-step information
  - Matrix strategy indicators
  - Reusable workflow indicators
  - Environment configuration display
  - Runs-on platform information
- **Workflow Overview**: Metadata display including triggers, permissions, and workflow name

### Validation & Error Handling
- **Comprehensive Validation**: 
  - YAML syntax validation
  - GitHub Actions structure validation
  - Circular dependency detection
  - Missing dependency warnings
- **Error Highlighting**: Click on validation errors to jump to the problematic line
- **Warning System**: Non-blocking warnings for best practices

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **ARIA Labels**: Screen reader friendly
- **Textual Fallback**: Alternative view for accessibility
- **Focus Management**: Proper focus trapping in modals

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/dcotelo/actions.git
cd actions
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🛠️ Usage

### Getting Started

1. **Load a Workflow**:
   - Click "Upload YAML File" to load an existing workflow
   - Drag and drop a YAML file onto the page
   - Choose from example templates
   - Start typing in the editor to create a new workflow

2. **Edit Your Workflow**:
   - Switch to Editor mode (default)
   - Use the Monaco editor to write or modify YAML
   - See real-time validation feedback
   - Fix errors by clicking on them in the validation panel

3. **Visualize Your Workflow**:
   - Switch to Viewer mode (requires valid YAML)
   - Choose your preferred view: Simple, Graph, or Textual
   - In Graph view:
     - Hover over jobs to see dependency paths highlighted
     - Use zoom controls (+/-) to adjust view
     - Pan by holding middle mouse button or Space + drag
     - Click "Fit" to auto-fit the graph to viewport
     - Click "Reset" to return to default view
     - Toggle layout direction (LR/TB)

4. **Explore Job Details**:
   - Click on any job in the graph or list
   - View detailed information in the modal
   - See all steps, environment variables, and configurations

### Keyboard Shortcuts

- **Space + Drag**: Pan the graph (in Graph view)
- **Enter/Space**: Activate focused buttons
- **ESC**: Close modals

## 🏗️ Architecture

### Components

- **App.js**: Main application component with mode switching and file handling
- **WorkflowEditor**: Monaco editor wrapper with validation integration
- **WorkflowViewer**: Main viewer component with three visualization modes
- **FlowGraph**: Interactive directed graph using Dagre
- **GraphNode**: Individual job node in the graph
- **GraphEdge**: Dependency arrows between nodes
- **GraphControls**: Zoom, pan, and layout controls
- **JobCard**: Detailed job information display
- **ValidationPanel**: Error and warning display

### Hooks

- **useWorkflow**: Workflow state management
- **useValidation**: YAML and workflow validation logic
- **useMode**: Mode switching (Editor/Viewer)

### Utilities

- **graphLayout.js**: Dagre-based graph layout calculations
- **workflowModel.js**: Workflow data structure extraction
- **workflowValidator.js**: Comprehensive validation logic
- **yamlParser.js**: YAML parsing with error handling
- **fileHandler.js**: File upload/download utilities

## 🧪 Development

### Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run deploy`: Deploy to GitHub Pages

### Project Structure

```
src/
├── components/          # React components
│   ├── FlowGraph.js     # Main graph visualization
│   ├── GraphNode.js     # Individual graph nodes
│   ├── GraphEdge.js     # Graph edges/arrows
│   ├── WorkflowViewer.js
│   ├── WorkflowEditor.js
│   └── ...
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Constants and examples
└── editor/              # Monaco editor wrapper
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow React best practices
- Write tests for new features
- Ensure accessibility (ARIA labels, keyboard navigation)
- Update documentation for new features
- Follow the existing code style

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🛠️ Technologies

- **React 18.2.0**: UI framework
- **Monaco Editor**: Code editor component
- **Dagre**: Graph layout engine
- **js-yaml**: YAML parsing
- **React Scripts**: Build tooling

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Graph visualization powered by [Dagre](https://github.com/dagrejs/dagre)
- Code editing by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 📧 Contact

For issues, questions, or contributions, please open an issue on GitHub.

---

Made with ❤️ for the GitHub Actions community

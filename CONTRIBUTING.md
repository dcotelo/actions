# Contributing to GitHub Actions Workflow Viewer & Editor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/actions.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development Workflow

### Making Changes

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Make your changes** in the `src/` directory

3. **Test your changes**:
   ```bash
   npm test
   ```

4. **Build to check for errors**:
   ```bash
   npm run build
   ```

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and reusable

### Component Guidelines

- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to children
- Add PropTypes for all component props
- Include ARIA labels for accessibility

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test edge cases and error conditions

## Pull Request Process

1. **Update documentation** if you've changed features
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `npm test`
4. **Ensure build succeeds**: `npm run build`
5. **Write a clear PR description** explaining:
   - What changes you made
   - Why you made them
   - How to test them

### PR Checklist

- [ ] Code follows the project style guidelines
- [ ] Tests pass locally
- [ ] Build succeeds without errors
- [ ] Documentation updated (if needed)
- [ ] Accessibility considerations addressed
- [ ] No console errors or warnings

## Feature Areas

### High Priority

- Additional workflow validation rules
- More example templates
- Export to different formats
- Performance optimizations for large workflows

### Graph Visualization

- Additional layout algorithms
- Custom node styling options
- Export graph as image
- Interactive filtering

### Editor Enhancements

- YAML schema validation
- Auto-completion improvements
- Code snippets/templates
- Multi-file workflow support

## Reporting Issues

When reporting issues, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**: Browser, OS, Node version

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Celebrate contributions of all kinds

## Questions?

Feel free to open an issue for questions or discussions about contributions.

Thank you for contributing! 🎉


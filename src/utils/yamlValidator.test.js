import { validateYaml, getErrorLineNumber } from './yamlValidator';

describe('yamlValidator', () => {
  describe('validateYaml', () => {
    test('validates empty content', () => {
      const result = validateYaml('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('YAML content is empty');
    });

    test('validates valid YAML', () => {
      const validYaml = `name: Test
jobs:
  test:
    runs-on: ubuntu-latest`;
      
      const result = validateYaml(validYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.parsed).toBeTruthy();
    });

    test('detects invalid YAML syntax', () => {
      const invalidYaml = 'invalid: yaml: [';
      const result = validateYaml(invalidYaml);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('detects circular dependencies', () => {
      const yamlWithCircular = `jobs:
  job1:
    runs-on: ubuntu-latest
    needs: job2
  job2:
    runs-on: ubuntu-latest
    needs: job1`;
      
      const result = validateYaml(yamlWithCircular);
      expect(result.errors.some(e => 
        (typeof e === 'string' ? e : e.message).includes('Circular dependency')
      )).toBe(true);
    });

    test('detects self-referencing job', () => {
      const yamlWithSelfRef = `jobs:
  job1:
    runs-on: ubuntu-latest
    needs: job1`;
      
      const result = validateYaml(yamlWithSelfRef);
      expect(result.errors.some(e => 
        (typeof e === 'string' ? e : e.message).includes('circular dependency on itself')
      )).toBe(true);
    });

    test('generates warnings for missing runs-on', () => {
      const yamlWithoutRunsOn = `jobs:
  job1:
    steps:
      - run: echo test`;
      
      const result = validateYaml(yamlWithoutRunsOn);
      expect(result.warnings.some(w => w.includes('runs-on'))).toBe(true);
    });

    test('handles jobs with array needs', () => {
      const yamlWithArrayNeeds = `jobs:
  job1:
    runs-on: ubuntu-latest
  job2:
    runs-on: ubuntu-latest
  job3:
    runs-on: ubuntu-latest
    needs: [job1, job2]`;
      
      const result = validateYaml(yamlWithArrayNeeds);
      expect(result.valid).toBe(true);
    });
  });

  describe('getErrorLineNumber', () => {
    test('extracts line number from error message', () => {
      const error = 'YAMLException: bad indentation at line 5';
      const lineNumber = getErrorLineNumber(error);
      expect(lineNumber).toBe(5);
    });

    test('returns null when no line number found', () => {
      const error = 'Some other error';
      const lineNumber = getErrorLineNumber(error);
      expect(lineNumber).toBeNull();
    });

    test('handles error object with line property', () => {
      const error = { message: 'Error', line: 10 };
      const lineNumber = getErrorLineNumber(error);
      expect(lineNumber).toBe(10);
    });
  });
});


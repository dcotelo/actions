export const EXAMPLE_WORKFLOWS = {
  basicCI: {
    name: 'Basic CI',
    yaml: `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
`
  },
  matrixBuild: {
    name: 'Matrix Build',
    yaml: `name: Matrix Build

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14, 16, 18]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node-version }}
      - name: Install and test
        run: |
          npm install
          npm test
`
  },
  deployment: {
    name: 'Deployment',
    yaml: `name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: echo "Deploying..."
`
  },
  parallelJobs: {
    name: 'Parallel Jobs',
    yaml: `name: Parallel Jobs

on:
  push:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run linter
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
`
  }
};


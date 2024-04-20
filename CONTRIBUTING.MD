# 🚀 Contributing to Referral Link Inserter

Hello! We're thrilled that you're interested in contributing to the Referral Link Inserter Chrome extension. Your contributions will help make the extension more efficient and user-friendly.

## 📜 Table of Contents

- [🚀 Contributing to Referral Link Inserter](#-contributing-to-referral-link-inserter)
  - [📜 Table of Contents](#-table-of-contents)
  - [📜 Code of Conduct](#-code-of-conduct)
  - [🏁 Getting Started](#-getting-started)
  - [🛠️ Development Workflow](#️-development-workflow)
    - [Building the Project](#building-the-project)
    - [Running Tests](#running-tests)
    - [Linting](#linting)
    - [Formatting](#formatting)
  - [📏 Coding Guidelines](#-coding-guidelines)
  - [🐛 Reporting Bugs](#-reporting-bugs)
  - [💡 Feature Requests](#-feature-requests)
  - [❓ Questions](#-questions)

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [Referral Link Inserter Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [project-email@example.com].

## 🏁 Getting Started

Before you begin, please ensure you have a GitHub account and have familiarized yourself with the GitHub flow. Detailed instructions can be found at https://guides.github.com/introduction/flow/.

1. Fork the repository on GitHub.
2. Clone your fork to your local machine.
3. Create a new branch for your changes.

## 🛠️ Development Workflow

### Building the Project

To build the project, run the following command in your terminal:

\```
npm run build
\```

This script compiles TypeScript files and copies HTML, JSON, and PNG files from the `src` directory to the `dist` directory.

### Running Tests

We use AVA for testing. To run tests, execute:

\```
npm test
\```

This will run all test files located in `./src/tests/` with TypeScript support.

### Linting

To ensure code quality and consistency, run the linter:

\```
npm run lint
\```

This uses XO to enforce a consistent code style.

### Formatting

To automatically format your code, you can run:

\```
npm run format
\```

This command will fix linting errors and format the code according to the defined rules in XO configuration.

## 📏 Coding Guidelines

- Write code in ES6 where possible.
- Use comments to explain the "why" not the "what".
- Follow the existing code style, enforced by Prettier and ESLint.
- Separate logic into functions or classes for better maintainability.

## 🐛 Reporting Bugs

Bugs are tracked as GitHub issues. When you are creating a bug report, please include as much detail as possible:

- Use a clear and descriptive title.
- Describe the exact steps which reproduce the problem.
- Provide specific examples to demonstrate the steps.
- Describe the behavior you observed after following the steps and why it's a problem.
- Explain which behavior you expected to see instead and why.

## 💡 Feature Requests

Feature requests are also tracked as GitHub issues. Before you submit a request, please search the repository for existing tickets to avoid duplicates. Use a clear and descriptive title. Provide a step-by-step description of the suggested enhancement in as many details as possible.

## ❓ Questions

If you have any questions, please post them as GitHub issues.

Thank you for contributing to the Referral Link Inserter!

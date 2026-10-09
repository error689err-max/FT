# Contributing to Family Tree MVP

Thank you for your interest in contributing to the Family Tree MVP project!

## Code of Conduct

This project and everyone participating in it is governed by the Code of Conduct below. By participating, you are expected to uphold this code.

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please treat all individuals with respect and dignity.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one.

When you are creating a bug report, please include as many details as possible:
- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Before creating enhancement suggestions, please check the issue list as you might find out that you don't need to create one.

When creating an enhancement suggestion, please include:
- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript/JavaScript styleguides
- End all files with a newline
- Write meaningful commit messages
- Test your changes thoroughly

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript/JavaScript Styleguide

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Documentation Styleguide

- Use clear and concise language
- Include code examples where appropriate
- Keep documentation up-to-date
- Use proper markdown formatting

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/family-tree-mvp.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test your changes: `npm run test`
7. Check types: `npm exec tsc -- --noEmit`
8. Commit your changes: `git commit -m "Add feature description"`
9. Push to your fork: `git push origin feature/your-feature-name`
10. Create a Pull Request

## Development Workflow

### Before Starting

- Check if the issue is already being worked on
- Create an issue if one doesn't exist
- Discuss major changes before starting work

### During Development

- Keep commits small and focused
- Write descriptive commit messages
- Test frequently
- Run linting and type checks: `npm run lint && npm exec tsc -- --noEmit`

### Before Submitting PR

- Ensure all tests pass: `npm run test:run`
- Ensure no TypeScript errors: `npm exec tsc -- --noEmit`
- Update documentation if needed
- Rebase against the latest main branch

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Project documentation
- Release notes

## Questions?

Feel free to:
- Open an issue with your question
- Email the project maintainer
- Join our community discussions

## License

By contributing to Family Tree MVP, you agree that your contributions will be licensed under its MIT License.

---

Thank you for contributing to making Family Tree MVP better! 🌳

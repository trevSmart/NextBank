# Contributing to NextBank

Thank you for your interest in contributing to NextBank! We welcome contributions from developers, designers, testers, and anyone passionate about improving digital banking experiences.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- Git installed and configured
- A modern code editor (VS Code recommended)
- Basic understanding of JavaScript, HTML, and CSS

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/nextbank.git
   cd nextbank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your Salesforce credentials
   ```

4. **Start the development server**
   ```bash
   npm run proxy
   ```

5. **Run tests to ensure everything works**
   ```bash
   npm test
   ```

## 📋 Contribution Guidelines

### Code Style

We follow these coding standards:

- **JavaScript**: Use ES6+ features, camelCase for variables and functions
- **HTML**: Semantic markup, proper accessibility attributes
- **CSS**: BEM methodology, mobile-first responsive design
- **Comments**: Clear, concise comments for complex logic
- **Naming**: Descriptive names for variables, functions, and classes

### Commit Messages

Use clear, descriptive commit messages following this format:

```
type(scope): brief description

Detailed explanation of changes (if needed)

Closes #issue-number
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
- `feat(chat): add message timestamp display`
- `fix(dashboard): resolve card balance calculation error`
- `docs(readme): update installation instructions`

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run lint
   npm test
   npm run test:accessibility
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear title and description
   - Link any related issues
   - Include screenshots for UI changes
   - Request review from maintainers

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:smoke          # Basic functionality
npm run test:accessibility  # WCAG compliance
npm run test:performance    # Load time metrics
npm run test:mobile         # Mobile compatibility

# Interactive testing
npm run test:ui
```

### Writing Tests

When adding new features, include appropriate tests:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure WCAG compliance
- **Performance Tests**: Verify load times and optimization

### Test Structure

```javascript
// Example test structure
test('should display account balance correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.saldo-amount')).toBeVisible();
  await expect(page.locator('.saldo-amount')).toContainText('24.567,89');
});
```

## 🎨 Design Guidelines

### UI/UX Principles

- **Accessibility First**: Ensure all users can access the application
- **Mobile Responsive**: Design for mobile-first, then enhance for desktop
- **Consistent Design**: Follow established design patterns and components
- **Performance**: Optimize for fast loading and smooth interactions

### Component Guidelines

- Use semantic HTML elements
- Include proper ARIA labels and roles
- Ensure keyboard navigation support
- Test with screen readers
- Maintain consistent spacing and typography

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: Browser, OS, device information
4. **Screenshots**: Visual evidence of the problem
5. **Console Logs**: Any error messages or warnings

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Device: [e.g., Desktop, Mobile]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

We welcome feature suggestions! When proposing new features:

1. **Check Existing Issues**: Ensure the feature hasn't been requested
2. **Provide Context**: Explain the problem the feature would solve
3. **Include Details**: Describe the desired functionality
4. **Consider Implementation**: Suggest how it might be implemented
5. **User Stories**: Include user scenarios and use cases

## 🔒 Security Contributions

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. **DO** report it privately via email to security@ibm.com
3. **Include** detailed information about the vulnerability
4. **Wait** for our response before public disclosure

See [SECURITY.md](SECURITY.md) for more details.

## 📚 Documentation

### Documentation Types

- **Code Comments**: Explain complex logic and business rules
- **API Documentation**: Document function parameters and return values
- **User Guides**: Help users understand features
- **Developer Guides**: Assist other contributors

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

## 🏷️ Issue Labels

We use these labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: Urgent issues
- `priority: low`: Non-urgent issues
- `status: in progress`: Currently being worked on
- `status: needs review`: Ready for review

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment:

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome people of all backgrounds and experience levels
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that everyone is learning and growing

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and discussions
- **Discussions**: General questions and community chat

## 🎯 Areas for Contribution

### High Priority Areas

- **Accessibility Improvements**: WCAG compliance enhancements
- **Performance Optimization**: Faster loading and smoother interactions
- **Mobile Experience**: Better mobile and tablet support
- **Testing Coverage**: Additional test scenarios and edge cases
- **Documentation**: User guides and developer documentation

### Skill-Specific Contributions

- **Frontend Developers**: UI components, responsive design, JavaScript features
- **Backend Developers**: API improvements, server optimization, security enhancements
- **Designers**: UI/UX improvements, accessibility design, visual consistency
- **Testers**: Test automation, accessibility testing, performance testing
- **Technical Writers**: Documentation, user guides, API documentation

## 📈 Recognition

Contributors are recognized through:

- **Contributor List**: Listed in project documentation
- **Release Notes**: Acknowledged in version releases
- **Community Recognition**: Highlighted in community discussions

## ❓ Questions?

If you have questions about contributing:

1. **Check Documentation**: Review existing docs and guides
2. **Search Issues**: Look for similar questions or discussions
3. **Create Discussion**: Start a new discussion for general questions
4. **Contact Maintainers**: Reach out to project maintainers

---

Thank you for contributing to NextBank! Your efforts help make digital banking better for everyone. 🚀

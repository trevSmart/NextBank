# NextBank Playwright Test Suite

This repository includes a comprehensive Playwright test suite that exhaustively tests the NextBank website.

## Overview

The test suite covers all major features and functionality of the NextBank application:

- **Page Load and Initial State** - Validates the homepage loads correctly with all expected elements
- **Navigation** - Tests all navigation menu items and state changes
- **Support Features** - Tests the support button popover and all support options
- **Dashboard Components** - Validates all dashboard cards and data displays
- **Chat Widget** - Tests the chat assistant functionality
- **Calendar Component** - Tests the calendar component interactions
- **Responsive Design** - Validates the site works across multiple viewport sizes
- **Accessibility and SEO** - Checks for proper semantic HTML, ARIA labels, and meta tags
- **Interactive Elements** - Tests all clickable elements and user interactions
- **Performance and Loading** - Validates resources load correctly and checks for errors

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

## Test Structure

The test suite is organized into 10 test files:

1. `01-initial-load.spec.js` - Page load and initial state tests
2. `02-navigation.spec.js` - Navigation menu tests
3. `03-support.spec.js` - Support button and popover tests
4. `04-dashboard.spec.js` - Dashboard component tests
5. `05-chat.spec.js` - Chat widget tests
6. `06-calendar.spec.js` - Calendar component tests
7. `07-responsive.spec.js` - Responsive design tests
8. `08-accessibility.spec.js` - Accessibility and SEO tests
9. `09-interactions.spec.js` - Interactive element tests
10. `10-performance.spec.js` - Performance and loading tests

## Configuration

The tests are configured via `playwright.config.js`. Key settings:

- **Base URL**: `http://127.0.0.1:8080`
- **Test Directory**: `./tests`
- **Web Server**: Automatically starts http-server on port 8080
- **Browsers**: Chromium (can be extended to Firefox and WebKit)
- **Screenshots**: Captured on test failure
- **Trace**: Captured on first retry for debugging

## CI/CD Integration

The test suite is designed to work in CI/CD environments:

- Tests run in parallel when possible
- Retries are enabled (2 retries in CI)
- HTML report is generated for review
- Screenshots and traces are captured on failures

## Customization

To add new tests:

1. Create a new `.spec.js` file in the `tests/` directory
2. Follow the existing test structure
3. Use descriptive test names with `test.describe()` and `test()`
4. Run tests to verify they work

## Troubleshooting

### Tests fail with 404 errors
- Ensure the http-server is serving from the `public/` directory
- Check that all asset paths are correct in `index.html`

### Browser not installed
- Run `npx playwright install chromium`

### Port 8080 already in use
- Stop any other services using port 8080
- Or modify the port in `playwright.config.js`

## Test Coverage

The test suite includes approximately 60+ test cases covering:

- ✅ Core page functionality
- ✅ User interactions
- ✅ Component behavior
- ✅ Responsive layouts
- ✅ Accessibility standards
- ✅ Performance metrics

## Maintenance

- Review test results regularly
- Update tests when UI changes
- Keep Playwright and dependencies up to date
- Add new tests for new features

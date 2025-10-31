# GitHub Copilot Custom Instructions for NextBank

## Project Overview
NextBank is a demo banking application that showcases the IBM Agentforce Client in a realistic, end-to-end banking scenario. The application demonstrates how AI agents can power intuitive, safe, and productive user experiences in enterprise contexts.

## Technology Stack
- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Libraries**: Chart.js, Luxon (date handling), chartjs-adapter-luxon
- **Build Tools**: ESLint for linting, http-server for local development
- **API Integration**: IBM Agentforce Client API via proxy server
- **No Framework**: This project intentionally uses vanilla JavaScript without frameworks like React, Vue, or Angular

## Code Style Guidelines

### JavaScript
- **Module System**: Use ES6 modules with `import`/`export`
- **Class-Based Components**: Prefer ES6 classes for components
- **Indentation**: Use tabs (not spaces) - enforced by ESLint
- **Quotes**: Always use single quotes for strings
- **Semicolons**: Required at end of statements (except in one-line blocks)
- **Strict Mode**: Use `'use strict';` at the top of files
- **Keyword Spacing**: Maintain space before and after keywords
- **No Trailing Spaces**: Remove trailing whitespace
- **Line Breaks**: Use Unix line endings (LF)

### Naming Conventions
- **Classes**: PascalCase (e.g., `AfClient`, `UiInstance`, `StockViewComponent`)
- **Variables/Functions**: camelCase (e.g., `sessionId`, `startSession`, `sendMessage`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BYPASS_LOGIN`)
- **File Names**: camelCase for JS files, lowercase for HTML/CSS

### Component Architecture
- Components are organized in `/src/components/[ComponentName]/`
- Each component typically has:
  - Main JavaScript file (e.g., `agentforceClient.js`)
  - CSS file if needed (e.g., `login.css`)
  - Optional HTML template file
- Components should be self-contained and reusable
- Use custom elements (Web Components) where appropriate (e.g., `InputMultiline`, `ProgressRing`)

### File Organization
```
/src
  /assets         - Static assets (images, fonts, libraries)
  /components     - Reusable UI components
  /pages          - Page-level styles
  /utils          - Utility functions and helpers
  /main.js        - Application entry point
/public
  /index.html     - Main HTML file
```

## Best Practices

### JavaScript Patterns
1. **Avoid Global Pollution**: Use modules and encapsulation
2. **Event Handling**: Clean up event listeners to prevent memory leaks
3. **Async/Await**: Prefer async/await over raw promises for readability
4. **Error Handling**: Always handle errors in async operations
5. **Comments**: 
   - Use English for code comments
   - Some existing comments may be in Catalan - preserve these unless the surrounding code is being significantly refactored, in which case update to English for consistency
   - Comment complex logic, not obvious code
   - Use JSDoc style for function documentation when helpful

### DOM Manipulation
- Cache DOM queries in variables when used multiple times
- Use `querySelector`/`querySelectorAll` for element selection
- Prefer `classList` methods over direct `className` manipulation
- Use template literals for building HTML strings when needed

### CSS
- Follow existing CSS organization patterns
- Use CSS custom properties (variables) for theming
- Maintain responsive design principles
- Support both light and dark color schemes via `color-scheme` meta tag

### API Integration
- All external API calls go through the proxy server (`/src/utils/proxy-server/`)
- Use `fetchUtils.js` for common fetch patterns
- Handle streaming responses appropriately for Agentforce API
- Always use environment variables for sensitive configuration (via `.env`)

### Security
- Never commit API keys or secrets
- Use the proxy server to hide API credentials from client
- Sanitize user inputs before rendering to DOM
- Follow secure coding practices for authentication/authorization flows

## Agentforce Client Specifics
- Main client code in `/src/components/agentforceClient/`
- Session management is handled through `Session` class
- UI instances are managed through `UiInstance` class
- Support for both streaming and non-streaming modes
- Context-aware interactions - elements can be marked for AI interaction
- The client is always visible and integrated into the page (not a popup)

## Testing and Linting
- Run `npm run lint` before committing code
- Run `npm run lint:fix` to auto-fix style issues
- Currently uses manual testing; consider suggesting automated tests for complex logic or critical functionality
- Test in both light and dark modes
- Verify responsive behavior on different screen sizes

## Development Workflow
1. Install dependencies: `npm install`
2. Run linter: `npm run lint`
3. Start proxy server if needed: `npm run proxy`
4. Serve locally with a static server (e.g., Five Server, http-server)
5. Test changes manually in browser

## Special Considerations
- **Mock Data**: The demo uses synthetic/mock data - no real banking systems
- **Privacy**: All data is demonstration-only
- **Login Bypass**: `BYPASS_LOGIN` flag in `main.js` controls login screen
- **Browser Compatibility**: Modern browsers with ES6 module support required
- **No Build Step**: Code runs directly in browser (no bundler like Webpack/Vite)

## When Suggesting Code Changes
1. **Preserve Existing Patterns**: Follow the established component structure
2. **Minimal Dependencies**: Avoid suggesting new libraries unless absolutely necessary
3. **Vanilla JavaScript**: Don't suggest framework migrations (React, Vue, etc.)
4. **Respect ESLint Rules**: Ensure suggestions comply with `.eslintrc.cjs`
5. **Component Isolation**: Keep components self-contained and reusable
6. **Performance**: Consider performance implications of DOM operations
7. **Accessibility**: Include ARIA attributes and semantic HTML
8. **Progressive Enhancement**: Ensure core functionality works without JavaScript where possible

## Common Tasks

### Adding a New Component
1. Create folder in `/src/components/[ComponentName]/`
2. Create main JS file with ES6 class or Web Component
3. Export the component as default or named export
4. Import in `main.js` or parent component
5. Add CSS file if needed and link in HTML
6. Follow existing patterns for initialization and cleanup

### Modifying Agentforce Integration
- Review `/src/components/agentforceClient/libs/sfAgentApi.js` for API patterns
- Ensure session management is handled correctly
- Test both streaming and non-streaming modes
- Consider UI feedback during async operations

### Styling Changes
- Check if CSS custom properties exist for the value you want to change
- Ensure changes work in both light and dark modes
- Test responsive behavior
- Maintain visual consistency with existing design

## Resources
- ESLint Config: `.eslintrc.cjs`
- Package Info: `package.json`
- Main Entry: `/public/index.html` and `/src/main.js`
- Agentforce Docs: Internal to component implementation

---

**Remember**: This is a demonstration project showcasing IBM Agentforce Client capabilities. Prioritize clarity, maintainability, and alignment with the demo's purpose over cutting-edge practices that might obscure the core functionality being demonstrated.

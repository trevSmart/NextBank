# AGENTS.md - NextBank AI Agent Documentation

## Overview

NextBank integrates AI-powered conversational agents through Salesforce Einstein AI Agent platform to provide intelligent customer assistance and support. The implementation includes both embedded chat widgets and standalone chat components.

## Agent Architecture

### Core Components

• **SfAgentApi** (`src/components/agentforceClient/api/sfAgentApi.js`)
  - Main API client for Salesforce Einstein AI Agent integration
  - Handles authentication, session management, and message exchange
  - Implements OAuth2 client credentials flow for secure access

• **ChatWidget** (`src/components/agentforceClient/script.js`)
  - Interactive chat interface with drag-and-drop functionality
  - Real-time message rendering and user interaction handling
  - Resizable and movable chat window with modern UI components

• **AgentforceSession** (`src/components/agentforceClient/script2.js`)
  - Session management wrapper for simplified agent interactions
  - Message store with timestamp and ID management
  - Event-driven architecture for UI updates

• **Proxy Server** (`src/utils/proxy-server/proxy-server.js`)
  - CORS-enabled proxy for Salesforce API communication
  - Handles authentication token management
  - Express.js server running on port 3000
  - Implements SSRF protection with domain allowlist

## Agent Configuration

### Salesforce Integration Parameters

```javascript
const salesforceParameters = {
    urlMyDomain: 'https://orgfarm-a5b40e9c5b-dev-ed.develop.my.salesforce.com',
    connectedAppClientId: '3MVG9rZjd7MXFdLhSKI7aMVDTapUmHhDlg4uv8l._iSgHKmMrYP0ND3kjdVo3bkwCXrzQAHq6V5qGSsftVEH6',
    connectedAppClientSecret: '49799F9C19F97B8CE413894C5387F5C8AA34E9B0FAB35C051F88FB1F810B71E4',
    agentId: '0XxgK000000D2KDSA0',
    accessToken: null
};
```

### Session Configuration

The agent sessions are configured with:
- **Timezone**: America/Los_Angeles
- **Language**: English (en_US)
- **Streaming Support**: Enabled with text chunking
- **Bypass User**: Enabled for automated interactions
- **External Session Key**: UUID4-generated unique identifiers

## API Endpoints

### Authentication
- **OAuth2 Token**: `POST /services/oauth2/token`
- **Grant Type**: client_credentials
- **Token Storage**: localStorage with key `futureBankSalesforceAccessToken`

### Agent Operations
- **Start Session**: `POST /einstein/ai-agent/v1/agents/{agentId}/sessions`
- **Send Message**: `POST /einstein/ai-agent/v1/sessions/{sessionId}/messages`
- **End Session**: `DELETE /services/data/v59.0/einstein/copilot/agent/sessions/{sessionId}`

## User Interface Components

### Embedded Assistant
Located in the main dashboard (`public/index.html`), the assistant provides:
- Real-time chat interface with message history
- Multiline input support with custom InputMultiline component
- Powered by Salesforce and Agentforce branding
- Pop-out functionality for expanded chat experience

### Standalone Chat Widget
The `agentforceClient.html` component offers:
- Draggable and resizable chat window
- Independent chat session management
- Modern UI with FontAwesome icons
- Responsive design for various screen sizes

## Message Flow

1. **Session Initialization**
   - User interaction triggers session start
   - OAuth2 authentication with Salesforce
   - Session creation with unique external key
   - Welcome message retrieval and display

2. **Message Exchange**
   - User input captured through UI components
   - Message sent to Salesforce Einstein AI Agent
   - Response received and rendered in chat interface
   - Message stored with timestamp and unique ID

3. **Session Management**
   - Automatic token refresh on expiration
   - Session cleanup on component unmount
   - Error handling with user-friendly messages

## Error Handling

The implementation includes comprehensive error handling:
- **Authentication Errors**: Automatic retry with fresh token
- **Network Errors**: User-friendly error messages in Catalan
- **Session Errors**: Graceful fallback and session recreation
- **API Errors**: Detailed error logging for debugging

## Development Setup

### Prerequisites
- Node.js with ES modules support
- Salesforce org with Einstein AI Agent enabled
- Valid Connected App credentials

### Running the Agent System
1. Start the proxy server: `npm run proxy`
2. Ensure Salesforce credentials are configured
3. Access the application and interact with the chat interface

### Testing
The agent functionality is covered by comprehensive Playwright tests with multiple testing strategies and configurations.

#### Scripts de Test Disponibles

**Scripts Bàsics**
- `npm test` - Executa tots els tests
- `npm run test:ui` - Executa tests amb interfície gràfica interactiva
- `npm run test:headed` - Executa tests amb navegador visible
- `npm run test:debug` - Executa tests en mode debug
- `npm run test:report` - Mostra l'informe HTML dels tests

**Scripts d'Instal·lació**
- `npm run test:install` - Instal·la només Chromium
- `npm run test:install-all` - Instal·la tots els navegadors (Chrome, Firefox, Safari)

**Scripts per CI/CD**
- `npm run test:ci` - Executa tests amb reporter GitHub per CI/CD
- `npm run test:watch` - Executa tests en mode watch (re-executa quan canvien fitxers)
- `npm run test:failed` - Re-executa només els tests que han fallat anteriorment

**Scripts de Debugging**
- `npm run test:grep` - Executa tests que coincideixin amb un patró
- `npm run test:list` - Llista tots els tests disponibles
- `npm run test:trace` - Executa tests amb traces habilitades
- `npm run test:video` - Executa tests amb gravació de vídeo

**Scripts per Dispositius**
- `npm run test:mobile` - Executa tests en dispositius mòbils
- `npm run test:desktop` - Executa tests en escriptori

**Scripts Específics per Categoria**
- `npm run test:smoke` - Executa tests de càrrega inicial (smoke tests)
- `npm run test:accessibility` - Executa tests d'accessibilitat
- `npm run test:performance` - Executa tests de rendiment

#### Configuració de Testing

**Navegadors Suportats**
- **Desktop Chrome** - Navegador principal per escriptori
- **Mobile Chrome** - Simulació de dispositius mòbils (Pixel 5)
- **Chromium** - Navegador base

**Reporters**
- **HTML** - Informe visual detallat
- **List** - Llista de resultats a la consola
- **JSON** - Resultats en format JSON per integració

**Timeouts Configurats**
- **Test timeout**: 30 segons
- **Action timeout**: 10 segons
- **Navigation timeout**: 30 segons
- **Expect timeout**: 5 segons

**Funcionalitats de Debug**
- **Screenshots**: Capturades només en fallos
- **Videos**: Gravats només en fallos
- **Traces**: Capturades en primer reintent
- **Retries**: 1 reintent en desenvolupament, 2 en CI

#### Estructura de Tests

Els tests estan organitzats en 10 fitxers:

1. `01-initial-load.spec.js` - Càrrega inicial i estat de la pàgina
2. `02-navigation.spec.js` - Tests de navegació
3. `03-support.spec.js` - Funcionalitats de suport
4. `04-dashboard.spec.js` - Components del dashboard
5. `05-chat.spec.js` - Widget de xat i funcionalitats d'agent
6. `06-calendar.spec.js` - Component de calendari
7. `07-responsive.spec.js` - Disseny responsiu
8. `08-accessibility.spec.js` - Accessibilitat i SEO
9. `09-interactions.spec.js` - Elements interactius
10. `10-performance.spec.js` - Rendiment i càrrega

#### Exemples d'Ús

**Executar tests específics**
```bash
# Executar només tests d'accessibilitat
npm run test:accessibility

# Executar tests que continguin "navigation" al nom
npm run test:grep "navigation"

# Executar tests de càrrega inicial
npm run test:smoke
```

**Debugging**
```bash
# Debug d'un test específic
npm run test:debug -- tests/05-chat.spec.js

# Veure quins tests estan disponibles
npm run test:list

# Re-executar només els tests que han fallat
npm run test:failed
```

**Desenvolupament**
```bash
# Mode watch per desenvolupament
npm run test:watch

# Tests amb interfície gràfica
npm run test:ui
```

#### Resolució de Problemes de Testing

**Tests que fallen**
1. Executar `npm run test:failed` per re-executar només els fallits
2. Utilitzar `npm run test:debug` per debuggar pas a pas
3. Revisar screenshots i traces en `test-results/`

**Problemes de càrrega**
1. Verificar que el servidor HTTP està funcionant
2. Comprovar que tots els recursos es carreguen correctament
3. Revisar la configuració del `webServer` en `playwright.config.js`

**Problemes de rendiment**
1. Executar `npm run test:performance` per tests específics
2. Revisar timeouts en la configuració
3. Utilitzar `npm run test:trace` per analitzar traces

#### Integració CI/CD

Per utilitzar en pipelines de CI/CD:

```bash
# Instal·lar dependències i navegadors
npm install
npm run test:install

# Executar tests amb reporter GitHub
npm run test:ci
```

Els resultats JSON es generen a `test-results/results.json` per integració amb sistemes externs.

## Security Considerations

• **Token Management**: Access tokens stored in localStorage with automatic refresh
• **CORS Protection**: Proxy server handles cross-origin requests securely
• **Credential Security**: Client credentials should be environment variables in production
• **Session Isolation**: Each chat session uses unique external session keys
• **SSRF Protection**: Proxy server implements domain allowlist to prevent Server-Side Request Forgery attacks
• **URL Validation**: Only authorized domains (Salesforce, TwelveData) are permitted for proxy requests
• **HTTPS Enforcement**: All external requests must use HTTPS protocol (except Salesforce login endpoints)

## Future Enhancements

• **Multi-language Support**: Extend language configuration beyond English
• **Voice Integration**: Add speech-to-text and text-to-speech capabilities
• **Advanced Analytics**: Implement conversation analytics and insights
• **Custom Agent Training**: Domain-specific agent training for banking scenarios
• **Integration Expansion**: Connect with additional Salesforce services and external APIs

## Troubleshooting

### Common Issues
- **Authentication Failures**: Verify Connected App credentials and permissions
- **Session Timeouts**: Check token expiration and refresh mechanisms
- **CORS Errors**: Ensure proxy server is running on port 3000
- **Message Delivery**: Verify network connectivity and API endpoint availability

### Debug Mode
Enable detailed logging by setting `console.log` statements in the SfAgentApi class for comprehensive debugging information.


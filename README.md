## IBM Agentforce Client — Live Demo (NextBank)

This repository showcases the IBM Agentforce Client inside a realistic, end‑to‑end banking scenario. The fictional "NextBank" site exists purely to demonstrate how Agentforce can power intuitive, safe and productive user experiences.

### What is IBM Agentforce Client?

IBM Agentforce Client is a front‑end experience that lets users interact with AI agents in familiar, guided ways. It focuses on clarity, safety and task completion, with a UX designed for enterprise use cases.

### Why this demo exists

The NextBank interface is a narrative backdrop to highlight Agentforce's value. Account cards, schedules, and market views are sample screens that make the agent's capabilities tangible, without exposing any real services.

### What you can try here

- Conversational assistance that adapts to the current page context
- Guided actions for common tasks (e.g., finding information or navigating views)
- Safe data handling patterns for enterprise scenarios
- Dynamic UI responses to agent suggestions

All interactions are demonstration‑only and rely on mock or sample data.

### Demo highlights

- Clear hand‑offs between the user and the agent, so people stay in control
- Focused prompts and responses that minimize friction and cognitive load
- Non‑intrusive guidance layered into a standard web app layout

## Running the Application

### Local Development

The application requires a proxy server to connect to Salesforce APIs (for CORS handling and credential injection).

1. **Clone the repository**
   ```bash
   git clone https://github.com/trevSmart/NextBank.git
   cd NextBank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with your Salesforce credentials:
   ```env
   SF_CONNECTED_APP_CLIENT_ID=your_client_id_here
   SF_CONNECTED_APP_CLIENT_SECRET=your_client_secret_here
   TWELVEDATA_API_KEY=your_api_key_here
   ```

4. **Start the proxy server**
   
   In one terminal:
   ```bash
   npm run proxy
   ```
   
   This starts the proxy server on `http://localhost:3000`

5. **Serve the application**
   
   In another terminal, use any static file server:
   ```bash
   npx http-server public -p 8080
   ```
   
   Or use VS Code's Live Server extension, or similar tools.

6. **Open in browser**
   
   Navigate to `http://localhost:8080` (or whichever port your server uses)

### Deploying to Production

To deploy NextBank to a production environment (like GitHub Pages), you need to:

1. **Deploy the proxy server** to a cloud platform (Heroku, Render, Railway, etc.)
   
   The proxy server code is in `src/utils/proxy-server/proxy-server.js`. See deployment guides below.

2. **Configure the proxy URL** in your frontend
   
   Create a `public/config.js` file (see `config.example.js` for template):
   ```javascript
   window.NEXTBANK_CONFIG = {
       PROXY_URL: 'https://your-deployed-proxy.herokuapp.com/proxy'
   };
   ```

3. **Load the config in your HTML**
   
   Add to `public/index.html` before other scripts:
   ```html
   <script src="config.js"></script>
   ```

4. **Deploy the frontend** to your static hosting platform

#### Deploying the Proxy Server

**Option 1: Heroku**
```bash
# From the repository root
heroku create your-app-name
heroku config:set SF_CONNECTED_APP_CLIENT_ID=your_id
heroku config:set SF_CONNECTED_APP_CLIENT_SECRET=your_secret
heroku config:set TWELVEDATA_API_KEY=your_key
heroku config:set PORT=3000
git push heroku main
```

**Option 2: Render**
1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm run proxy`
5. Add environment variables in Render dashboard

**Option 3: Railway**
1. Create a new project on Railway
2. Connect your repository
3. Set start command: `npm run proxy`
4. Add environment variables in Railway dashboard

**Important**: Update `src/utils/proxy-server/proxy-server.js` to include your production frontend URL in the `allowedOrigins` array.

### Data and privacy

This demo uses synthetic data and is not connected to any real banking systems. It is intended solely for evaluation and learning.

### About the NextBank UI

The dashboard, calendar and stocks areas are illustrative surfaces to show how Agentforce augments typical workflows. They provide enough context to explore agent interactions without requiring real accounts.

### License

ISC

/**
 * NextBank Runtime Configuration
 *
 * This file configures the proxy server URL for the application.
 *
 * IMPORTANT: This demo application requires a proxy server to connect to Salesforce APIs.
 * The proxy server handles CORS and injects sensitive credentials server-side.
 *
 * FOR LOCAL DEVELOPMENT:
 * - Leave PROXY_URL as null (will use default localhost:3000)
 * - Run "npm run proxy" in a separate terminal
 * - Serve the app with any static file server
 *
 * FOR PRODUCTION DEPLOYMENT:
 * - Deploy the proxy server to a cloud platform (see README.md)
 * - Update PROXY_URL to point to your deployed proxy
 * - Example: PROXY_URL: 'https://your-proxy.herokuapp.com/proxy'
 *
 * NOTE: Without a configured and running proxy server, the AI assistant
 * will display an error message with instructions to set it up.
 */

window.NEXTBANK_CONFIG = {
	//Set to your deployed proxy server URL, or null for local development
	PROXY_URL: null
};
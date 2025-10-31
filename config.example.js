/**
 * Runtime Configuration Example
 *
 * Copy this file to `public/config.js` and customize for your deployment.
 * This file is loaded before the main application and sets runtime configuration.
 *
 * For GitHub Pages or other static hosting, you can configure the proxy URL here.
 */

//Set global configuration
window.NEXTBANK_CONFIG = {
	/**
	 * Proxy server URL
	 *
	 * Options:
	 * 1. Leave as null to use defaults (localhost in dev, error in production)
	 * 2. Set to your deployed proxy server URL (e.g., 'https://your-proxy.herokuapp.com/proxy')
	 * 3. For local development, you can override the default: 'http://localhost:3000/proxy'
	 *
	 * Example for cloud deployment:
	 * PROXY_URL: 'https://nextbank-proxy.example.com/proxy'
	 */
	PROXY_URL: null
};
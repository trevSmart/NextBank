/**
 * Application configuration
 *
 * This file contains environment-specific configuration that changes
 * between development and production environments.
 */

//Private IP range patterns for development environment detection
// Strict octet pattern: matches 0-255
const OCTET = '(25[0-5]|2[0-4][0-9]|1\\d{2}|[1-9]?\\d)';
const REGEX_192_168 = new RegExp(`^192\\.168\\.${OCTET}\\.${OCTET}$`);
const REGEX_10 = new RegExp(`^10\\.${OCTET}\\.${OCTET}\\.${OCTET}$`);
const REGEX_172 = new RegExp(`^172\\.(1[6-9]|2[0-9]|3[01])\\.${OCTET}\\.${OCTET}$`);

/**
 * Check if hostname is a local or private IP address
 * @param {string} hostname - The hostname to check
 * @returns {boolean} True if hostname is local or private IP
 */
function isLocalHostname(hostname) {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		REGEX_192_168.test(hostname) ||
		REGEX_10.test(hostname) ||
		REGEX_172.test(hostname)
	);
}

/**
 * Get the proxy server URL based on environment
 * Priority:
 * 1. VITE_PROXY_URL environment variable (for build-time injection)
 * 2. window.NEXTBANK_CONFIG.PROXY_URL (for runtime configuration)
 * 3. Default localhost for development
 * 4. null for production (will show error message)
 *
 * @returns {string|null} Proxy server URL or null if not configured
 */
export function getProxyUrl() {
	//Check for build-time environment variable (Vite, Webpack, etc.)
	if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PROXY_URL) {
		return import.meta.env.VITE_PROXY_URL;
	}

	//Check for runtime configuration
	if (typeof window !== 'undefined' && window.NEXTBANK_CONFIG && window.NEXTBANK_CONFIG.PROXY_URL) {
		return window.NEXTBANK_CONFIG.PROXY_URL;
	}

	//Check if we're in development (localhost or private IPs)
	const isDev = typeof window !== 'undefined' && isLocalHostname(window.location.hostname);

	//In development, default to local proxy
	if (isDev) {
		return 'http://localhost:3000/proxy';
	}

	//In production, no default - must be configured
	return null;
}

/**
 * Check if application is running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
	if (typeof window === 'undefined') {
		return false;
	}

	return isLocalHostname(window.location.hostname);
}

/**
 * Check if application is running in production mode
 * @returns {boolean}
 */
export function isProduction() {
	return !isDevelopment();
}
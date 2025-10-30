/**
 * Centralized fetch utility that handles proxy automatically based on environment
 *
 * - In development (localhost): uses local proxy to avoid CORS issues
 * - In production (GitHub Pages): makes direct API calls
 *
 * Usage:
 *   import { smartFetch } from '../utils/fetchUtils.js';
 *   const response = await smartFetch('https://api.example.com/data');
 */

// Detect if we're in development (localhost) or production (GitHub Pages)
const IS_DEVELOPMENT = typeof window !== 'undefined' && (
	window.location.hostname === 'localhost' ||
	window.location.hostname === '127.0.0.1' ||
	window.location.hostname.startsWith('192.168.') ||
	window.location.hostname.startsWith('10.') ||
	window.location.hostname.startsWith('172.')
);

const PROXY_URL = 'http://localhost:3000/proxy';

/**
 * Smart fetch that automatically uses proxy in development and direct calls in production
 * Automatically falls back to direct calls if proxy is not available
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Standard fetch options (method, headers, body, etc.)
 * @param {Object} proxyOptions - Optional proxy-specific options
 * @param {boolean} proxyOptions.forceProxy - Force use of proxy even in production (default: false)
 * @param {boolean} proxyOptions.forceDirect - Force direct call even in development (default: false)
 * @returns {Promise<Response>} - The fetch response
 */
export async function smartFetch(url, options = {}, proxyOptions = {}) {
	const { forceProxy = false, forceDirect = false } = proxyOptions;

	// Determine if we should try proxy first
	const tryProxy = forceProxy || (!forceDirect && IS_DEVELOPMENT);

	if (tryProxy) {
		// Try proxy first in development to avoid CORS issues
		try {
			const proxyResponse = await fetch(PROXY_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					method: options.method || 'GET',
					headers: options.headers || {},
					url: url,
					body: options.body
				})
			});
			// If proxy responds (even with error status), return it
			return proxyResponse;
		} catch (error) {
			// If proxy is not available (connection refused or network error), fallback to direct call
			const isConnectionError =
				error.message?.includes('Failed to fetch') ||
				error.message?.includes('ERR_CONNECTION_REFUSED') ||
				error.message?.includes('NetworkError') ||
				error.name === 'TypeError' ||
				error.code === 'ECONNREFUSED';

			if (isConnectionError) {
				console.info('Proxy not available, falling back to direct API call');
				// Fall through to direct call
			} else {
				// Re-throw other errors (non-connection errors)
				throw error;
			}
		}
	}

	// Direct API call (production, forced, or fallback from failed proxy)
	return fetch(url, options);
}

/**
 * Check if we're currently in development environment
 * @returns {boolean}
 */
export function isDevelopment() {
	return IS_DEVELOPMENT;
}

/**
 * Check if we're currently in production environment
 * @returns {boolean}
 */
export function isProduction() {
	return !IS_DEVELOPMENT;
}


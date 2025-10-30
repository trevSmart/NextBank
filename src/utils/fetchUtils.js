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

	// Determine if we should use proxy
	const useProxy = forceProxy || (!forceDirect && IS_DEVELOPMENT);

	if (useProxy) {
		// Use proxy in development to avoid CORS issues
		return fetch(PROXY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				method: options.method || 'GET',
				headers: options.headers || {},
				url: url,
				body: options.body
			})
		});
	} else {
		// Direct API call (production or forced)
		return fetch(url, options);
	}
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


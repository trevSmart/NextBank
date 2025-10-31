import uuid4 from '../../../assets/libs/uuid4.mjs';
import {createParser} from '../../../assets/libs/eventsource-parser.mjs';
import {isDevelopment} from '../../../utils/fetchUtils.js';
import {getProxyUrl} from '../../../config.js';

const SF_ACCESS_TOKEN_KEY = 'nextBankSalesforceAccessToken';

/**
 * Safely retrieves the Salesforce access token from sessionStorage
 * @returns {string|null} The stored access token (non-empty string), or null if not available, empty, or on error
 */
function getStoredAccessToken() {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			const token = window.sessionStorage.getItem(SF_ACCESS_TOKEN_KEY);
			//Return null for empty/falsy values to ensure consistency
			return token && token.trim().length > 0 ? token : null;
		}
	} catch (error) {
		console.error('Error reading access token from sessionStorage:', error);
	}
	return null;
}

/**
 * Safely stores the Salesforce access token in sessionStorage
 * @param {string} token - The access token to store
 * @returns {boolean} true if successfully stored, false otherwise
 */
function setStoredAccessToken(token) {
	try {
		if (typeof window !== 'undefined' && window.sessionStorage) {
			if (token && typeof token === 'string' && token.trim().length > 0) {
				window.sessionStorage.setItem(SF_ACCESS_TOKEN_KEY, token);
				return true;
			}
		}
	} catch (error) {
		console.error('Error storing access token in sessionStorage:', error);
	}
	return false;
}

const salesforceParameters = {
	urlMyDomain: 'https://orgfarm-a5b40e9c5b-dev-ed.develop.my.salesforce.com',
	//Values injected by the proxy on token requests
	connectedAppClientId: '',
	connectedAppClientSecret: '',
	agentId: '0XxgK000000D2KDSA0',
	//Try to initialize with token from sessionStorage if available
	accessToken: getStoredAccessToken()
};

export default class SfAgentApi extends EventTarget {
	constructor(options = {}) {
		super();
		this.session = {id: null, sequenceId: 0};
		this.streaming = false;
		//Salesforce API calls ALWAYS require a proxy due to CORS restrictions.
		//Browsers cannot make direct cross-origin requests to Salesforce APIs,
		//so all requests must go through a local proxy server (npm run proxy).
		const shouldUseProxy = options.useProxy !== undefined
			? options.useProxy
			: true; //Always use proxy for Salesforce APIs
		this.options = {
			useProxy: shouldUseProxy,
			...options
		};
	}

	async _fetch(url, options) {
		if (this.options.useProxy) {
			const proxyUrl = getProxyUrl();

			if (!proxyUrl) {
				//No proxy URL configured - provide helpful error message
				const prodMessage = 'This application requires a proxy server to connect to Salesforce APIs.\n\n' +
					'To run NextBank:\n' +
					'1. Clone the repository: git clone https://github.com/trevSmart/NextBank.git\n' +
					'2. Install dependencies: npm install\n' +
					'3. Set up environment variables (see README for details)\n' +
					'4. Start the proxy server: npm run proxy\n' +
					'5. Serve the application in another terminal\n\n' +
					'Alternatively, deploy the proxy server to a cloud platform and configure NEXTBANK_CONFIG.PROXY_URL.';
				throw new Error(`Proxy server not configured. ${prodMessage}`);
			}

			try {
				return await fetch(proxyUrl, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({url, ...options})
				});
			} catch (error) {
				//Check if proxy is not available
				const isConnectionError =
					error.message?.includes('Failed to fetch') ||
					error.message?.includes('ERR_CONNECTION_REFUSED') ||
					error.message?.includes('NetworkError') ||
					error.name === 'TypeError';

				if (isConnectionError) {
					//Provide environment-specific guidance
					const devMessage = `Please start the proxy server locally with: npm run proxy\n(Configured proxy URL: ${proxyUrl})`;
					const prodMessage = 'The configured proxy server is not responding.\n\n' +
						`Proxy URL: ${proxyUrl}\n\n` +
						'Please ensure:\n' +
						'1. The proxy server is running and accessible\n' +
						'2. CORS is properly configured on the proxy\n' +
						'3. The proxy URL is correct\n\n' +
						'For local development, clone the repository and run "npm run proxy".';
					const envInfo = isDevelopment() ? devMessage : prodMessage;
					throw new Error(`Proxy server not available. ${envInfo}`);
				}
				throw error;
			}
		} else {
			return fetch(url, options);
		}
	}

	async login() {
		const url = `${salesforceParameters.urlMyDomain}/services/oauth2/token`;
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				'grant_type': 'client_credentials',
				'client_id': salesforceParameters.connectedAppClientId,
				'client_secret': salesforceParameters.connectedAppClientSecret
			}).toString()
		};
		const response = await this._fetch(url, options);

		if (!response.ok) {
			const responseText = await response.text();
			const errorText = JSON.parse(responseText);
			if (errorText.error) {
				throw new Error(`Error starting session: ${errorText.error}`);
			} else {
				throw new Error(`Error starting session: ${errorText}`);
			}
		}

		const data = await response.json();

		const stored = setStoredAccessToken(data.access_token);
		salesforceParameters.accessToken = data.access_token;
		if (!stored) {
			console.error('Warning: Failed to store Salesforce access token in sessionStorage. Token will not persist across sessions.');
		}
		return response;
	}

	async startSession(streaming = false) {
		if (this.session.id) {
			return;
		}

		this.streaming = streaming;

		if (!salesforceParameters.accessToken) {
			try {
				await this.login();
			} catch (loginError) {
				throw new Error('Failed to start Salesforce session: ' + loginError.message);
			}
		}

		const url = `https://api.salesforce.com/einstein/ai-agent/v1/agents/${salesforceParameters.agentId}/sessions`;
		const options = {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${salesforceParameters.accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				externalSessionKey: uuid4(),
				instanceConfig: {
					endpoint: salesforceParameters.urlMyDomain
				},
				tz: 'America/Los_Angeles',
				variables: [
					{
						name: '$Context.EndUserLanguage',
						type: 'Text',
						value: 'en_US'
					}
				],
				featureSupport: 'Streaming',
				streamingCapabilities: {chunkTypes: ['Text']},
				bypassUser: true
			})
		};
		const response = await this._fetch(url, options);

		if (!response.ok) {
			if (response.error === 'Invalid token.') {
				salesforceParameters.accessToken = null;
				await this.login();
				return await this.startSession();
			}
			throw new Error(`Error starting session: ${response.error}`);
		}

		const data = await response.json();
		this.session.id = data.sessionId;
		this.session.sequenceId = 0;

		return {
			sessionId: data.sessionId,
			welcomeMessage: data.messages[0].message
		};
	}


	async sendMessage(text) {
		if (this.streaming) {
			return this._sendMessageStreaming(text);
		} else {
			return this._sendMessageSynchronous(text);
		}
	}

	async _sendMessageSynchronous(text) {
		try {
			if (!this.session.id) {
				throw new Error('No active session');
			}
			const url = `https://api.salesforce.com/einstein/ai-agent/v1/sessions/${this.session.id}/messages`;
			const options = {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${salesforceParameters.accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: {
						sequenceId: ++this.session.sequenceId,
						type: 'Text',
						text
					},
					variables: []
				})
			};
			const response = await this._fetch(url, options);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error('Error sending message: ' + errorText);
			}

			const data = await response.json();
			return data.messages[0].message;
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}

	async _sendMessageStreaming(text) {
		try {
			if (!this.session.id) {
				throw new Error('No active session');
			}
			const url = `https://api.salesforce.com/einstein/ai-agent/v1/sessions/${this.session.id}/messages/stream`;
			const options = {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${salesforceParameters.accessToken}`,
					'Content-Type': 'application/json',
					'Accept': 'text/event-stream'
				},
				body: JSON.stringify({
					message: {
						sequenceId: ++this.session.sequenceId,
						type: 'Text',
						text
					},
					variables: []
				})
			};
			const response = await this._fetch(url, options);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error('Error sending message: ' + errorText);
			}

			const decoder = new TextDecoder('utf-8');
			let lastInformMessage = null;
			let endOfTurnReached = false;

			const parser = createParser({
				onEvent: event => {
					console.log('onEvent');
					console.log(JSON.stringify(event));
					console.log(event.detail);

					const parsed = JSON.parse(event.data);
					console.log('event', parsed.type);
					this.dispatchEvent(new CustomEvent('chunk', {detail: {
						eventType: event.event || event.type,
						data: parsed.message
					}}));
					if (event.event === 'INFORM') {
						lastInformMessage = parsed.message.message;

					} else if (event.event === 'END_OF_TURN') {
						if (!lastInformMessage) {
							throw new Error('Error: Incomplete message received');
						}
						endOfTurnReached = true;
					} else if (event.event === 'ERROR') {
						throw new Error('Error: ' + parsed.message.message);
					}
				}
			});

			for await (const chunk of response.body) {
				parser.feed(decoder.decode(chunk, {stream: true}));
				if (endOfTurnReached) {
					return lastInformMessage;
				}
			}

		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}

	async endSession() {
		if (!this.session.id) {return}

		try {
			const url = `${salesforceParameters.urlMyDomain}/services/data/v59.0/einstein/copilot/agent/sessions/${this.session.id}`;
			const options = {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${salesforceParameters.accessToken}`
				},
				keepalive: true
			};
			const response = await this._fetch(url, options);

			if (!response.ok) {
				throw new Error('Error ending session');
			}

			this.session.id = null;
			this.session.sequenceId = 0;
		} catch (error) {
			console.error('Error ending session:', error);
			throw error;
		}
	}
}
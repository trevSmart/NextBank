import uuid4 from '../../../assets/libs/uuid4.mjs';

const salesforceParameters = {
    urlMyDomain: 'https://orgfarm-a5b40e9c5b-dev-ed.develop.my.salesforce.com',
    connectedAppClientId: '3MVG9rZjd7MXFdLhSKI7aMVDTapUmHhDlg4uv8l._iSgHKmMrYP0ND3kjdVo3bkwCXrzQAHq6V5qGSsftVEH6',
    connectedAppClientSecret: '49799F9C19F97B8CE413894C5387F5C8AA34E9B0FAB35C051F88FB1F810B71E4',
    agentId: '0XxgK000000D2KDSA0',
    accessToken: null
};

class SfAgentApi {
    constructor() {
        this.session = {id: null, sequenceId: 0};
    }

    async login() {
        try {
            console.log('[Agentforce] Authentication started - Requesting access token');
            // Netegem qualsevol token anterior que pugui estar caducat
            localStorage.removeItem('futureBankSalesforceAccessToken');
            salesforceParameters.accessToken = null;
            const body = JSON.stringify({
                endpoint: 'salesforce-org-oauth',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: salesforceParameters.connectedAppClientId,
                    client_secret: salesforceParameters.connectedAppClientSecret
                }).toString()
            });

            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });

            if (!response.ok) {
                const responseText = await response.text();
                const errorText = JSON.parse(responseText)?.error;
                console.error('[Agentforce] Authentication failed:', errorText);
                throw new Error(`Error starting session: ${errorText}`);
            }

            const data = await response.json();
            localStorage.setItem('futureBankSalesforceAccessToken', data.access_token);
            salesforceParameters.accessToken = data.access_token;
            console.log('[Agentforce] Authentication successful - Access token obtained');
            return response;
        } catch (error) {
            console.error('[Agentforce] Authentication error:', error);
            throw error;
        }
    }

    async startSession() {
        try {
            if (this.session.id) {
                console.log('[Agentforce] Session already exists:', this.session.id);
                return;
            }
            console.log('[Agentforce] Starting new session...');
            
            if (!salesforceParameters.accessToken) {
                try {
                    await this.login();
                } catch (loginError) {
                    throw new Error('No s\'ha pogut iniciar sessió amb Salesforce. Si us plau, torneu-ho a provar més tard.');
                }
            }

            const externalSessionKey = uuid4();
            console.log('[Agentforce] Creating session with external key:', externalSessionKey);

            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'salesforce-agent-sessions',
                    dynamicParams: {
                        agentId: salesforceParameters.agentId
                    },
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        externalSessionKey: externalSessionKey,
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
                        streamingCapabilities: { chunkTypes: ['Text'] },
                        bypassUser: true
                    }
                })
            });

            if (!response.ok) {
                const responseText = await response.text();
                const errorText = JSON.parse(responseText)?.error;
                if (errorText === 'Invalid token.') {
                    console.warn('[Agentforce] Token expired, re-authenticating...');
                    salesforceParameters.accessToken = null;
                    await this.login();
                    return await this.startSession();
                }
                console.error('[Agentforce] Session creation failed:', errorText);
                throw new Error(errorText ? `Error starting session: ${errorText}` : 'Unknown error starting session');
            }

            const data = await response.json();
            this.session.id = data.sessionId;
            this.session.sequenceId = 0;

            const welcomeMessage = data.messages?.[0]?.message || 'Welcome to the chat';
            console.log('[Agentforce] Session started successfully');
            console.log('[Agentforce] Session ID:', this.session.id);
            console.log('[Agentforce] Incoming message from agent:', welcomeMessage);

            return {
                sessionId: data.sessionId,
                welcomeMessage: welcomeMessage
            };
        } catch (error) {
            console.error('[Agentforce] Error starting session:', error);
            throw error;
        }
    }

    async sendMessageSynchronous(message) {
        try {
            if (!this.session.id) {
                throw new Error('No active session');
            }
            
            const sequenceId = ++this.session.sequenceId;
            console.log('[Agentforce] Outgoing message to agent (sequence:', sequenceId + '):', message);
            
            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'salesforce-agent-messages',
                    dynamicParams: {
                        sessionId: this.session.id
                    },
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        message: {
                            sequenceId: sequenceId,
                            type: 'Text',
                            text: message
                        },
                        variables: []
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Agentforce] Failed to send message:', errorText);
                throw new Error('Error al enviar el missatge: ' + errorText);
            }

            const data = await response.json();
            const agentResponse = data.messages?.[0]?.message || 'No response from agent';
            console.log('[Agentforce] Incoming message from agent:', agentResponse);
            return agentResponse;
        } catch (error) {
            console.error('[Agentforce] Error sending message:', error);
            throw error;
        }
    }

    async endSession() {
        if (!this.session.id) return;

        console.log('[Agentforce] Ending session:', this.session.id);
        
        try {
            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: 'salesforce-domain-services',
                    dynamicParams: {
                        sessionId: this.session.id
                    },
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`
                    }
                }),
                keepalive: true
            });

            if (!response.ok) {
                console.error('[Agentforce] Failed to end session');
                throw new Error('Error ending session');
            }

            console.log('[Agentforce] Session ended successfully');
            this.session.id = null;
            this.session.sequenceId = 0;
        } catch (error) {
            console.error('[Agentforce] Error ending session:', error);
            throw error;
        }
    }
}

export default new SfAgentApi();

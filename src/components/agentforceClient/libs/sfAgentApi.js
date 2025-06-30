import uuid4 from '../../../assets/libs/uuid4.mjs';
// import { EventSource } from 'eventsource';

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
            const body = JSON.stringify({
                url: `${salesforceParameters.urlMyDomain}/services/oauth2/token`,
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
                throw new Error(`Error starting session: ${errorText}`);
            }

            const data = await response.json();

            localStorage.setItem('nextBankSalesforceAccessToken', data.access_token);
            salesforceParameters.accessToken = data.access_token;
            return response;
        } catch (error) {
            throw error;
        }
    }

    async startSession() {
        try {
            if (this.session.id) {
                return;
            }
            if (!salesforceParameters.accessToken) {
                try {
                    await this.login();
                } catch (loginError) {
                    throw new Error('No s\'ha pogut iniciar sessió amb Salesforce. Si us plau, torneu-ho a provar més tard.');
                }
            }

            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `https://api.salesforce.com/einstein/ai-agent/v1/agents/${salesforceParameters.agentId}/sessions`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
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
                        streamingCapabilities: { chunkTypes: ['Text'] },
                        bypassUser: true
                    }
                })
            });

            if (!response.ok) {
                const responseText = await response.text();
                const errorText = JSON.parse(responseText)?.error;
                if (errorText === 'Invalid token.') {
                    salesforceParameters.accessToken = null;
                    await this.login();
                    return await this.startSession();
                }
                throw new Error(errorText ? `Error starting session: ${errorText}` : 'Unknown error starting session');
            }

            const data = await response.json();
            this.session.id = data.sessionId;
            this.session.sequenceId = 0;

            return {
                sessionId: data.sessionId,
                welcomeMessage: data.messages[0].message
            };
        } catch (error) {
            throw error;
        }
    }

    async sendMessageSynchronous(message) {
        try {
            if (!this.session.id) {
                throw new Error('No active session');
            }
            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `https://api.salesforce.com/einstein/ai-agent/v1/sessions/${this.session.id}/messages`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        message: {
                            sequenceId: ++this.session.sequenceId,
                            type: 'Text',
                            text: message
                        },
                        variables: []
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Error al enviar el missatge: ' + errorText);
            }

            const data = await response.json();
            return data.messages[0].message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async sendMessageStreaming(message, onChunk) {
        try {
            if (!this.session.id) {
                throw new Error('No active session');
            }
            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: `https://api.salesforce.com/einstein/ai-agent/v1/sessions/${this.session.id}/messages/stream`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream'
                    },
                    body: {
                        message: {
                            sequenceId: ++this.session.sequenceId,
                            type: 'Text',
                            text: message
                        },
                        variables: []
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Error al enviar el missatge: ' + errorText);
            }

            // Llegeix el flux per chunks
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    if (onChunk) onChunk(chunk); // Callback per cada chunk rebut
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /*
    sendMessageStreamingOk(
        sessionId,
        text,
        variables = [],
        onMessage,
        onDisconnect = null
    ) {
        try {
            const sequenceId = new Date().getTime();
            const body = JSON.stringify({
                message: {
                    sequenceId,
                    type: 'Text',
                    text
                },
                variables
            });

            const es = new EventSource('/api/events');
            es.onmessage = (event) => {
                console.log(event.data);
            };

            return es;
        } catch (error) {
            throw new Error('Failed to send Agent API streaming message', {
                cause: error
            });
        }
    }
    */

    async endSession() {
        if (!this.session.id) return;

        try {
            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `${salesforceParameters.urlMyDomain}/services/data/v59.0/einstein/copilot/agent/sessions/${this.session.id}`,
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${salesforceParameters.accessToken}`
                    }
                }),
                keepalive: true
            });

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

export default new SfAgentApi();

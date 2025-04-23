import uuid4 from 'https://cdn.jsdelivr.net/gh/tracker1/node-uuid4/browser.mjs';

let salesforceParameters = {
	urlMyDomain: 'https://orgfarm-a5b40e9c5b-dev-ed.develop.my.salesforce.com',
	connectedAppClientId: '3MVG9rZjd7MXFdLhSKI7aMVDTapUmHhDlg4uv8l._iSgHKmMrYP0ND3kjdVo3bkwCXrzQAHq6V5qGSsftVEH6',
	connectedAppClientSecret: '49799F9C19F97B8CE413894C5387F5C8AA34E9B0FAB35C051F88FB1F810B71E4',
	agentId: '0XxgK000000D2KDSA0',
	// accessToken: 'eyJ0bmsiOiJjb3JlL3Byb2QvMDBEZ0swMDAwMDFQWmZsVUFHIiwidmVyIjoiMS4wIiwia2lkIjoiQ09SRV9BVEpXVC4wMERnSzAwMDAwMVBaZmwuMTc0MjgzMzk0NjgzNiIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzY3AiOiJzZmFwX2FwaSBjaGF0Ym90X2FwaSBhcGkgaWQiLCJzdWIiOiJ1aWQ6MDA1Z0swMDAwMDFDM1BsUUFLIiwicm9sZXMiOltdLCJpc3MiOiJodHRwczovL29yZ2Zhcm0tYTViNDBlOWM1Yi1kZXYtZWQuZGV2ZWxvcC5teS5zYWxlc2ZvcmNlLmNvbSIsImNsaWVudF9pZCI6IjNNVkc5clpqZDdNWEZkTGhTS0k3YU1WRFRhcFVtSGhEbGc0dXY4bC5faVNnSEttTXJZUDBORDNramRWbzNia3dDWHJ6UUFIcTZWNXFHU3NmdFZFSDYiLCJjZHBfdGVuYW50IjoiYTM2MC9wcm9kOC9iZGZkZGY1Mzk1OWM0YzFmYmFhYmQwOGZjNTIzNjMyYiIsImF1ZCI6WyJodHRwczovL29yZ2Zhcm0tYTViNDBlOWM1Yi1kZXYtZWQuZGV2ZWxvcC5teS5zYWxlc2ZvcmNlLmNvbSIsImh0dHBzOi8vYXBpLnNhbGVzZm9yY2UuY29tIl0sIm5iZiI6MTc0NTQyNTc1NCwibXR5Ijoib2F1dGgiLCJzZmFwX3JoIjoiYm90LXN2Yy1sbG06YXdzLXByb2Q4LWNhY2VudHJhbDEvZWluc3RlaW4sbXZzL0VEQzphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbixlaW5zdGVpbi10cmFuc2NyaWJlL0VpbnN0ZWluR1BUOmF3cy1wcm9kOC1jYWNlbnRyYWwxL2VpbnN0ZWluLGJvdC1zdmMtbGxtL0Zsb3dHcHQ6YXdzLXByb2QxLXVzZWFzdDEvZWluc3RlaW4sZWluc3RlaW4tYWktZ2F0ZXdheS9FaW5zdGVpbkdQVDphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbixlaW5zdGVpbi1haS1nYXRld2F5L0VEQzphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbiIsInNmaSI6IjliOWM2Y2ViZWM2MDgwODllNWJkNjhlNzk0YzBmYmQ2M2MzZGJhMmMwM2I4ZmZjMjBiZWVmMTJjYjI4MzE3M2IiLCJzZmFwX29wIjoiRWluc3RlaW5IYXdraW5nQzJDRW5hYmxlZCxFR3B0Rm9yRGV2c0F2YWlsYWJsZSxFaW5zdGVpbkdlbmVyYXRpdmVTZXJ2aWNlIiwiaHNjIjpmYWxzZSwiY2RwX3VybCI6Imh0dHBzOi8vYTM2MC5jZHAuY2RwMi5hd3MtcHJvZDgtY2FjZW50cmFsMS5hd3Muc2ZkYy5jbCIsImV4cCI6MTc0NTQyNzU2OSwiaWF0IjoxNzQ1NDI1NzY5fQ.BexZHQVXEF56nSzbIzeeL3KxRsdceFkFEfrOhRQM1PSCxsHmjGZbPk9Jkhs1Q5O1rw_VblTmpNR-8ZYhS_zxKutQ1gb79OWc5gACW80rO7staloKeJs1fgrHnqH9F3xzgxN_umj4ZMu_-5i4jyyKGXzW6d4qd3Hx739VgRrVlP9QtPg_igy1bR7Z2mcJRbHIpi5Ml9fOns0_EuByKvSehoHfMOfzYc-Ckm8JtfYwQ8WFa_nT3CW5YU7iX12w64U9HtdbtlQNYbqLm-NGGEfA5EkoojIQK0uOo93eJXqmmJKmY93o7s08rw4jsmHrJoOjQs0eZPZSyfK4RcseEszPCQ'
	accessToken: null
}

// Chat Widget Controller
const ChatWidget = {
	elements: {
		widget: null,
		dashboardAssistant: null,
		messages: null,
		dashboardMessages: null,
		input: null,
		dashboardInput: null,
		chatButton: null,
		chatContainer: null,
		sendButton: null,
		dashboardSendButton: null,
		resizeState: {
			isResizing: false,
			startX: 0,
			startWidth: 0
		},
		dragState: {
			isDragging: false,
			currentX: 0,
			currentY: 0,
			initialX: 0,
			initialY: 0,
			xOffset: 0,
			yOffset: 0,
			initialRect: null,
			animationFrameId: null,
			lastFrameTime: 0,
			widgetLastX: 0,
			widgetLastY: 0,
			limits: null
		},
		isOpen: false,
		isLoaded: false,
		isWaitingResponse: false
	},

	session: {
		id: null,
		sequenceId: 0
	},

	async salesforceLogin() {
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

			console.log('body', body);

			const response = await fetch('http://localhost:3000/proxy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body
			});

			console.log('response', response);

			if (!response.ok) {
				const responseText = await response.text();
				console.log('responseText', responseText);
				const errorText = JSON.parse(responseText)?.error;
				throw new Error('Error starting session: "' + errorText + '"');
			}

			const data = await response.json();
			salesforceParameters.accessToken = data.access_token;
			console.log('accessToken', salesforceParameters.accessToken);
			return response;
		} catch (error) {
			console.error('Error getting access token:', error);
			return error;
		}
	},

	async init() {
		this.elements.chatContainer = document.getElementById('chatContainer');
		this.elements.dashboardAssistant = document.querySelector('.dashboard-card.assistant');

		if (!this.elements.chatContainer || !this.elements.dashboardAssistant) {
			console.error('Chat containers not found');
			return;
		}

		this.elements.chatButton = document.querySelector('.support-option-live-chat');
		if (this.elements.chatButton) {
			const chatButtonOnclick = async (e) => {
				document.querySelector('.support-popover').classList.remove('visible');
				e.preventDefault();
				e.stopPropagation();
				await this.loadAndShowChat();
			};
			this.elements.chatButton.addEventListener('click', chatButtonOnclick);
		}

		// Inicialitzem el xat del dashboard
		this.initDashboardChat();
	},

	async initDashboardChat() {
		this.elements.dashboardInput = document.getElementById('chatInputFixed');
		this.elements.dashboardMessages = this.elements.dashboardAssistant.querySelector('.chat-messages');
		this.elements.dashboardSendButton = this.elements.dashboardAssistant.querySelector('.send-button');

		// Afegim els event listeners pel xat del dashboard
		if (this.elements.dashboardInput) {
			this.elements.dashboardInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					this.sendDashboardMessage();
				}
			});

			this.elements.dashboardInput.addEventListener('input', () => {
				this.updateDashboardSendButtonState();
			});
		}

		if (this.elements.dashboardSendButton) {
			this.elements.dashboardSendButton.addEventListener('click', () => this.sendDashboardMessage());
		}

		// Iniciem la sessió pel xat del dashboard
		try {
			if (!this.session.id) {
				const startSessionResponse = await this.startSession();
				if (!startSessionResponse.ok) {
					throw new Error('Could not start Salesforce session');
				}
			}
		} catch (error) {
			console.error('Error starting session:', error);
			this.addSystemMessage('There was an error starting the chat session. Please try again later.');
			this.updateDashboardSendButtonState();
		}
	},

	async startSession() {
		try {
			const payload = {
				externalSessionKey: uuid4(),
				instanceConfig: {
					endpoint: salesforceParameters.urlMyDomain
				},
				tz: "America/Los_Angeles",
				variables: [
					{
						name: "$Context.EndUserLanguage",
						type: "Text",
						value: "en_US"
					}
				],
				featureSupport: "Streaming",
				streamingCapabilities: { chunkTypes: ['Text'] },
				bypassUser: true
			}

			if (!salesforceParameters.accessToken) {
				await this.salesforceLogin();
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
					body: payload
				})
			});

			if (!response.ok) {
				const responseText = await response.text();
				const errorText = JSON.parse(responseText)?.error;
				throw new Error('Error starting session: "' + errorText + '"');
			}

			const data = await response.json();
			this.session.id = data.sessionId;
			this.session.sequenceId = 0;
			const welcomeMessage = data.messages[0].message;
			console.log('welcomeMessage', welcomeMessage);
			this.addAgentMessage(welcomeMessage);
			return response;
		} catch (error) {
			console.error('Error starting session:', error);
			return error;
		}
	},

	async sendMessageToAgent(message) {
		try {
			const payload = {
				message: {
					sequenceId: ++this.session.sequenceId,
					type: "Text",
					text: message
				},
				variables: []
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
					body: payload
				})
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error('Error sending message: ' + errorText);
			}

			const data = await response.json();
			const agentMessage = data.messages[0].message;
			console.log('agentMessage', agentMessage);
			this.addAgentMessage(agentMessage);
			return response;
		} catch (error) {
			console.error('Error sending message:', error);
			return null;
		}
	},

	async endSession() {
		if (!this.session.id) return;

		try {
			const response = await fetch(`${salesforceParameters.urlMyDomain}/services/data/v59.0/einstein/copilot/agent/sessions/${this.session.id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${salesforceParameters.accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error('Error ending session');
			}

			this.session.id = null;
			this.session.sequenceId = 0;
		} catch (error) {
			console.error('Error ending session:', error);
		}
	},

	async loadAndShowChat() {
		try {
			const response = await fetch('components/chat/chat.html');
			if (!response.ok) throw new Error('Could not load chat');

			const html = await response.text();
			this.elements.chatContainer.innerHTML = html;
			this.elements.isLoaded = true;
			this.cacheElements();
			this.setupEventListeners();

			// Obrim el xat immediatament
			this.toggle();

			try {
				// Start Salesforce session
				if (!this.session.id) {
					const startSessionResponse = await this.startSession();
					if (!startSessionResponse.ok) {
						throw new Error('Could not start Salesforce session');
					}
				}
			} catch (error) {
				console.error('Error starting session:', error);
				this.addSystemMessage('There was an error starting the chat session. Please try again later.');
				this.updateSendButtonState();
			}
		} catch (error) {
			console.error('Error loading chat:', error);
			this.elements.isLoaded = false;
		}
	},

	cacheElements() {
		this.elements.widget = document.getElementById('chatWidget');
		this.elements.messages = document.querySelector('.chat-messages');
		this.elements.input = document.getElementById('chatInput');
		this.elements.sendButton = document.querySelector('.send-button');
		this.updateSendButtonState();
	},

	setupEventListeners() {
		this.elements.isOpen = false;

		if (this.elements.messages) {
			this.elements.messages.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));
		}

		if (this.elements.input) {
			this.elements.input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					this.sendMessage();
				}
			});

			this.elements.input.addEventListener('input', () => {
				this.updateSendButtonState();
			});
		}

		if (this.elements.widget) {
			const closeButton = this.elements.widget.querySelector('.chat-close');
			if (closeButton) {
				closeButton.addEventListener('click', () => this.toggle());
			}

			const sendButton = this.elements.widget.querySelector('.send-button');
			if (sendButton) {
				sendButton.addEventListener('click', () => this.sendMessage());
			}

			const chatHeader = this.elements.widget.querySelector('.chat-header');
			if (chatHeader) {
				chatHeader.addEventListener('selectstart', (e) => e.preventDefault());
			}
		}

		this.initDragListeners();
	},

	initDragListeners() {
		if (this._dragListenersInitialized) return;
		this._dragListenersInitialized = true;

		const chatHeader = this.elements.widget.querySelector('.chat-header');
		if (!chatHeader) return;

		this._dragMouseMove = this.drag.bind(this);
		this._dragMouseUp = this.dragEnd.bind(this);

		chatHeader.addEventListener('mousedown', this.dragStart.bind(this), false);
	},

	toggle() {
		if (!this.elements.widget || !this.elements.isLoaded) return;

		const isOpen = this.elements.widget.classList.contains('chat-widget-open');

		if (isOpen) {
			//Closing
			this.elements.isOpen = false;
			requestAnimationFrame(() => {
				const handleTransitionEnd = () => {
					this.elements.widget.classList.remove('chat-widget-open');
					this.elements.widget.classList.remove('chat-widget-closing');
					this.elements.widget.removeEventListener('transitionend', handleTransitionEnd);
					this.endSession(); // Close session when chat is closed
				};

				this.elements.widget.addEventListener('transitionend', handleTransitionEnd, { once: true });
				this.elements.widget.classList.add('chat-widget-closing');
			});
		} else if (!this.elements.isOpen) {
			//Opening
			this.elements.isOpen = true;
			requestAnimationFrame(() => {
				this.elements.widget.classList.remove('chat-widget-closing');
				this.elements.widget.classList.add('chat-widget-open');
			});
		}
	},

	updateSendButtonState() {
		if (!this.elements.sendButton) return;

		const isDisabled = !this.session.id ||
						  !this.elements.input.value.trim() ||
						  this.elements.isWaitingResponse;

		this.elements.sendButton.disabled = isDisabled;
	},

	async sendMessage() {
		const input = this.elements.input;
		if (!input || !this.session.id || this.elements.isWaitingResponse) return;

		const message = input.value.trim();
		if (message) {
			this.elements.isWaitingResponse = true;
			this.updateSendButtonState();

			this.addUserMessage(message);
			input.value = '';
			this.updateSendButtonState();

			const typingMessage = this.addTypingIndicator();

			const response = await this.sendMessageToAgent(message);

			if (typingMessage) {
				typingMessage.remove();
			}

			this.elements.isWaitingResponse = false;
			this.updateSendButtonState();
		}
	},

	async sendDashboardMessage() {
		const input = this.elements.dashboardInput;
		if (!input || !this.session.id || this.elements.isWaitingResponse) return;

		const message = input.value.trim();
		if (message) {
			this.elements.isWaitingResponse = true;
			this.updateDashboardSendButtonState();

			this.addUserMessage(message, true);
			input.value = '';
			this.updateDashboardSendButtonState();

			const typingMessage = this.addTypingIndicator(true);

			const response = await this.sendMessageToAgent(message);

			if (typingMessage) {
				typingMessage.remove();
			}

			this.elements.isWaitingResponse = false;
			this.updateDashboardSendButtonState();
		}
	},

	updateDashboardSendButtonState() {
		if (!this.elements.dashboardSendButton) return;

		const isDisabled = !this.session.id ||
						  !this.elements.dashboardInput.value.trim() ||
						  this.elements.isWaitingResponse;

		this.elements.dashboardSendButton.disabled = isDisabled;
	},

	addUserMessage(text, isDashboard = false) {
		const messagesContainer = isDashboard ? this.elements.dashboardMessages : this.elements.messages;
		if (!messagesContainer) return;

		const messageItem = document.createElement('li');
		messageItem.className = 'message user';

		const messageContent = document.createElement('div');
		messageContent.className = 'message-content';

		const messageText = document.createElement('div');
		messageText.className = 'message-text';
		messageText.textContent = text;

		const messageTime = document.createElement('div');
		messageTime.className = 'message-time';
		messageTime.textContent = this.getCurrentTime();

		const messageAvatar = document.createElement('div');
		messageAvatar.className = 'message-avatar';

		const userAvatar = document.createElement('div');
		userAvatar.className = 'user-avatar';
		userAvatar.textContent = 'M';

		messageContent.appendChild(messageText);
		messageContent.appendChild(messageTime);
		messageAvatar.appendChild(userAvatar);
		messageItem.appendChild(messageContent);
		messageItem.appendChild(messageAvatar);

		const messagesList = messagesContainer.querySelector('.messages-list');
		if (messagesList) {
			messagesList.appendChild(messageItem);
			this.scrollToBottom(isDashboard);
		}
	},

	addAgentMessage(text, isDashboard = false) {
		const messagesContainer = isDashboard ? this.elements.dashboardMessages : this.elements.messages;
		if (!messagesContainer) return;

		const messageItem = document.createElement('li');
		messageItem.className = 'message agent';

		const messageContent = document.createElement('div');
		messageContent.className = 'message-content';

		const messageAvatar = document.createElement('div');
		messageAvatar.className = 'message-avatar';

		const avatarImg = document.createElement('img');
		avatarImg.src = '/src/assets/images/agent_astro.svg';
		avatarImg.alt = 'Agent Avatar';
		avatarImg.className = 'agent-avatar';

		const messageName = document.createElement('div');
		messageName.className = 'message-name';
		messageName.textContent = 'Agentforce';

		const messageText = document.createElement('div');
		messageText.className = 'message-text';
		messageText.textContent = text;

		const messageTime = document.createElement('div');
		messageTime.className = 'message-time';
		messageTime.textContent = this.getCurrentTime();

		messageAvatar.appendChild(avatarImg);
		messageContent.appendChild(messageName);
		messageContent.appendChild(messageText);
		messageContent.appendChild(messageTime);
		messageItem.appendChild(messageContent);
		messageItem.appendChild(messageAvatar);

		const messagesList = messagesContainer.querySelector('.messages-list');
		if (messagesList) {
			messagesList.appendChild(messageItem);
			this.scrollToBottom(isDashboard);
		}
	},

	addSystemMessage(text, isDashboard = false) {
		const messagesContainer = isDashboard ? this.elements.dashboardMessages : this.elements.messages;
		if (!messagesContainer) return;

		const messageItem = document.createElement('li');
		messageItem.className = 'message system';
		messageItem.textContent = text;

		const messagesList = messagesContainer.querySelector('.messages-list');
		if (messagesList) {
			messagesList.appendChild(messageItem);
			this.scrollToBottom(isDashboard);
		}
	},

	getCurrentTime() {
		const now = new Date();
		return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
	},

	scrollToBottom(isDashboard = false) {
		const messagesContainer = isDashboard ? this.elements.dashboardMessages : this.elements.messages;
		if (!messagesContainer) return;

		requestAnimationFrame(() => {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		});
	},

	throttle(func, limit) {
		let inThrottle;
		return function (...args) {
			if (!inThrottle) {
				func.apply(this, args);
				inThrottle = true;
				setTimeout(() => inThrottle = false, limit);
			}
		};
	},

	handleScroll() {
		// Space for loading more old messages if needed
	},

	dragStart(e) {
		const { dragState } = this.elements;

		dragState.limits = {
			minX: - (this.elements.widget.offsetLeft) + 20,
			maxX: window.innerWidth - (this.elements.widget.offsetLeft + this.elements.widget.offsetWidth) - 20,
			minY: - (this.elements.widget.offsetTop) + 20,
			maxY: window.innerHeight - (this.elements.widget.offsetTop + this.elements.widget.offsetHeight) - 20
		};

		dragState.initialX = e.clientX - dragState.xOffset;
		dragState.initialY = e.clientY - dragState.yOffset;

		if (e.target.closest('.chat-header')) {
			document.body.style.userSelect = 'none';
			document.addEventListener('mousemove', this._dragMouseMove, false);
			document.addEventListener('mouseup', this._dragMouseUp, false);
			dragState.isDragging = true;
			this.elements.widget.style.transition = 'none';
			this.elements.widget.style.willChange = 'transform';
		}
	},

	dragEnd() {
		const { dragState } = this.elements;
		dragState.isDragging = false;

		if (dragState.animationFrameId) {
			cancelAnimationFrame(dragState.animationFrameId);
			dragState.animationFrameId = null;
		}

		this.elements.widget.style.transition = '';
		this.elements.widget.style.willChange = 'auto';
		document.body.style.userSelect = '';
		document.removeEventListener('mousemove', this._dragMouseMove, false);
		document.removeEventListener('mouseup', this._dragMouseUp, false);
	},

	drag(e) {
		const { dragState } = this.elements;
		if (!dragState.isDragging) return;
		e.preventDefault();

		dragState.currentX = e.clientX - dragState.initialX;
		dragState.currentY = e.clientY - dragState.initialY;

		if (!dragState.animationFrameId) {
			dragState.animationFrameId = requestAnimationFrame(() => this.updatePosition());
		}
	},

	updatePosition() {
		const { dragState } = this.elements;
		dragState.animationFrameId = null;

		dragState.xOffset = dragState.currentX;
		dragState.yOffset = dragState.currentY;

		const { minX, maxX, minY, maxY } = dragState.limits;

		dragState.xOffset = Math.min(Math.max(minX, dragState.xOffset), maxX);
		dragState.yOffset = Math.min(Math.max(minY, dragState.yOffset), maxY);

		if (dragState.widgetLastX === dragState.xOffset && dragState.widgetLastY === dragState.yOffset) {
			return;
		}

		dragState.widgetLastX = dragState.xOffset;
		dragState.widgetLastY = dragState.yOffset;

		this.elements.widget.style.transform = `translate3d(${dragState.xOffset}px, ${dragState.yOffset}px, 0)`;
	},

	addTypingIndicator(isDashboard = false) {
		const messagesContainer = isDashboard ? this.elements.dashboardMessages : this.elements.messages;
		if (!messagesContainer) return null;

		const messageItem = document.createElement('li');
		messageItem.className = 'message agent typing';

		const messageAvatar = document.createElement('div');
		messageAvatar.className = 'message-avatar';

		const avatarImg = document.createElement('img');
		avatarImg.src = '/src/assets/images/agent_astro.svg';
		avatarImg.alt = 'Agent Avatar';
		avatarImg.className = 'agent-avatar';

		const messageContent = document.createElement('div');

		const typingAnimation = document.createElement('div');
		typingAnimation.innerHTML = '<dotlottie-player src="https://lottie.host/9c15d800-18b7-47c1-8bf3-5878651fdee3/ro2FAtILmi.json" background="transparent" speed="1" style="width: 72px"; direction="1" playMode="normal" loop autoplay></dotlottie-player>';

		messageAvatar.appendChild(avatarImg);
		messageContent.appendChild(typingAnimation);
		messageItem.appendChild(messageContent);
		messageItem.appendChild(messageAvatar);

		const messagesList = messagesContainer.querySelector('.messages-list');
		if (messagesList) {
			messagesList.appendChild(messageItem);
			this.scrollToBottom(isDashboard);
		}

		return messageItem;
	},

	initResizeListeners() {
		const resizeHandle = this.elements.fixedWidget.querySelector('.resize-handle');
		if (!resizeHandle) return;

		const startResize = (e) => {
			this.elements.resizeState.isResizing = true;
			this.elements.resizeState.startX = e.clientX;
			this.elements.resizeState.startWidth = this.elements.fixedWidget.offsetWidth;

			resizeHandle.classList.add('resizing');
			document.body.style.cursor = 'ew-resize';
			document.body.style.userSelect = 'none';
		};

		const stopResize = () => {
			if (!this.elements.resizeState.isResizing) return;

			this.elements.resizeState.isResizing = false;
			resizeHandle.classList.remove('resizing');
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};

		const resize = (e) => {
			if (!this.elements.resizeState.isResizing) return;

			const delta = this.elements.resizeState.startX - e.clientX;
			const newWidth = Math.min(Math.max(300, this.elements.resizeState.startWidth + delta), 800);

			this.elements.fixedWidget.style.width = `${newWidth}px`;
			document.body.style.marginRight = `${newWidth}px`;
		};

		resizeHandle.addEventListener('mousedown', startResize);
		document.addEventListener('mousemove', resize);
		document.addEventListener('mouseup', stopResize);
		document.addEventListener('mouseleave', stopResize);
	}
};

document.addEventListener('DOMContentLoaded', () => {
	ChatWidget.init();
});

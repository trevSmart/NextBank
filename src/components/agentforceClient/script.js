import SfAgentApi from './api/sfAgentApi.js';

const ChatWidget = {
	elements: {
		widget: null,
		dashboardGrid: null,
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

	options: {
		initialMessages: true,
		devMode: false
	},

	// Debug utilities
	debug: {
		logLevel: 'info', // 'debug', 'info', 'warn', 'error'
		showDebugPanel: false,
		debugPanel: null,

		log(level, message, data = null) {
			if (!ChatWidget.options.devMode) return;

			const levels = { debug: 0, info: 1, warn: 2, error: 3 };
			if (levels[level] < levels[this.logLevel]) return;

			const timestamp = new Date().toLocaleTimeString();
			const prefix = `[Agentforce Debug ${level.toUpperCase()}] ${timestamp}`;

			if (data) {
				console.log(prefix, message, data);
			} else {
				console.log(prefix, message);
			}

			// Update debug panel if visible
			if (this.showDebugPanel && this.debugPanel) {
				this.updateDebugPanel(level, message, data);
			}
		},

		createDebugPanel() {
			if (this.debugPanel) return;

			this.debugPanel = document.createElement('div');
			this.debugPanel.id = 'agentforce-debug-panel';
			this.debugPanel.innerHTML = `
				<div class="debug-header">
					<h3>Agentforce Debug Panel</h3>
					<button id="debug-toggle">Hide</button>
					<button id="debug-clear">Clear</button>
				</div>
				<div class="debug-controls">
					<label>Log Level:
						<select id="debug-log-level">
							<option value="debug">Debug</option>
							<option value="info" selected>Info</option>
							<option value="warn">Warn</option>
							<option value="error">Error</option>
						</select>
					</label>
					<button id="debug-export">Export Logs</button>
				</div>
				<div class="debug-info">
					<div class="debug-session-info">
						<h4>Session Info</h4>
						<div id="debug-session-details"></div>
					</div>
					<div class="debug-messages-info">
						<h4>Messages</h4>
						<div id="debug-messages-count">0 messages</div>
					</div>
				</div>
				<div class="debug-logs">
					<h4>Debug Logs</h4>
					<div id="debug-log-container"></div>
				</div>
			`;

			// Add styles
			const style = document.createElement('style');
			style.textContent = `
				#agentforce-debug-panel {
					position: fixed;
					top: 20px;
					right: 20px;
					width: 400px;
					max-height: 600px;
					background: #1a1a1a;
					color: #fff;
					border: 2px solid #333;
					border-radius: 8px;
					font-family: 'Courier New', monospace;
					font-size: 12px;
					z-index: 10000;
					overflow: hidden;
					box-shadow: 0 4px 20px rgba(0,0,0,0.5);
				}

				.debug-header {
					background: #333;
					padding: 10px;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.debug-header h3 {
					margin: 0;
					font-size: 14px;
				}

				.debug-header button {
					background: #555;
					color: #fff;
					border: none;
					padding: 4px 8px;
					border-radius: 4px;
					cursor: pointer;
					font-size: 10px;
				}

				.debug-header button:hover {
					background: #666;
				}

				.debug-controls {
					padding: 10px;
					border-bottom: 1px solid #333;
					display: flex;
					gap: 10px;
					align-items: center;
				}

				.debug-controls label {
					font-size: 11px;
				}

				.debug-controls select {
					background: #333;
					color: #fff;
					border: 1px solid #555;
					padding: 2px 4px;
					font-size: 10px;
				}

				.debug-controls button {
					background: #444;
					color: #fff;
					border: none;
					padding: 4px 8px;
					border-radius: 4px;
					cursor: pointer;
					font-size: 10px;
				}

				.debug-info {
					padding: 10px;
					border-bottom: 1px solid #333;
				}

				.debug-info h4 {
					margin: 0 0 5px 0;
					font-size: 12px;
					color: #4CAF50;
				}

				.debug-session-info, .debug-messages-info {
					margin-bottom: 10px;
				}

				.debug-logs {
					padding: 10px;
					max-height: 300px;
					overflow-y: auto;
				}

				.debug-logs h4 {
					margin: 0 0 10px 0;
					font-size: 12px;
					color: #4CAF50;
				}

				.debug-log-entry {
					margin-bottom: 5px;
					padding: 4px;
					border-radius: 3px;
					font-size: 10px;
					word-break: break-all;
				}

				.debug-log-entry.debug { background: #2a2a2a; }
				.debug-log-entry.info { background: #1a3a1a; }
				.debug-log-entry.warn { background: #3a2a1a; }
				.debug-log-entry.error { background: #3a1a1a; }
			`;
			document.head.appendChild(style);

			// Add event listeners
			this.debugPanel.querySelector('#debug-toggle').addEventListener('click', () => {
				this.toggleDebugPanel();
			});

			this.debugPanel.querySelector('#debug-clear').addEventListener('click', () => {
				this.clearDebugLogs();
			});

			this.debugPanel.querySelector('#debug-log-level').addEventListener('change', (e) => {
				this.logLevel = e.target.value;
			});

			this.debugPanel.querySelector('#debug-export').addEventListener('click', () => {
				this.exportDebugLogs();
			});

			document.body.appendChild(this.debugPanel);
		},

		showDebugPanel() {
			if (!this.debugPanel) {
				this.createDebugPanel();
			}
			this.showDebugPanel = true;
			this.debugPanel.style.display = 'block';
			this.updateSessionInfo();
		},

		hideDebugPanel() {
			this.showDebugPanel = false;
			if (this.debugPanel) {
				this.debugPanel.style.display = 'none';
			}
		},

		toggleDebugPanel() {
			if (this.showDebugPanel) {
				this.hideDebugPanel();
			} else {
				this.showDebugPanel();
			}
		},

		updateDebugPanel(level, message, data) {
			if (!this.debugPanel) return;

			const logContainer = this.debugPanel.querySelector('#debug-log-container');
			const logEntry = document.createElement('div');
			logEntry.className = `debug-log-entry ${level}`;

			const timestamp = new Date().toLocaleTimeString();
			let logText = `[${timestamp}] ${message}`;
			if (data) {
				logText += ` | Data: ${JSON.stringify(data)}`;
			}

			logEntry.textContent = logText;
			logContainer.appendChild(logEntry);

			// Keep only last 50 entries
			while (logContainer.children.length > 50) {
				logContainer.removeChild(logContainer.firstChild);
			}

			// Auto-scroll to bottom
			logContainer.scrollTop = logContainer.scrollHeight;
		},

		updateSessionInfo() {
			if (!this.debugPanel) return;

			const sessionDetails = this.debugPanel.querySelector('#debug-session-details');
			const messagesCount = this.debugPanel.querySelector('#debug-messages-count');

			sessionDetails.innerHTML = `
				<div>Session ID: ${ChatWidget.session.id || 'None'}</div>
				<div>Sequence: ${ChatWidget.session.sequenceId}</div>
				<div>Widget Open: ${ChatWidget.elements.isOpen}</div>
				<div>Waiting Response: ${ChatWidget.elements.isWaitingResponse}</div>
			`;

			const messageCount = ChatWidget.messageStore.getMessages().length;
			messagesCount.textContent = `${messageCount} messages`;
		},

		clearDebugLogs() {
			if (!this.debugPanel) return;
			const logContainer = this.debugPanel.querySelector('#debug-log-container');
			logContainer.innerHTML = '';
		},

		exportDebugLogs() {
			if (!this.debugPanel) return;

			const logContainer = this.debugPanel.querySelector('#debug-log-container');
			const logs = Array.from(logContainer.children).map(entry => entry.textContent);

			const exportData = {
				timestamp: new Date().toISOString(),
				sessionId: ChatWidget.session.id,
				logs: logs,
				messageCount: ChatWidget.messageStore.getMessages().length
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `agentforce-debug-${Date.now()}.json`;
			a.click();
			URL.revokeObjectURL(url);
		}
	},

	messageStore: {
		messages: [],
		lastId: 0,

		addMessage(message) {
			message.id = ++this.lastId;
			message.timestamp = new Date();
			this.messages.push(message);
			return message;
		},

		addUserMessage(text) {
			return this.addMessage({ type: 'user', text });
		},

		addUserHiddenMessage(text) {
			return this.addMessage({ type: 'userHidden', text });
		},

		addAgentMessage(text) {
			// Detectem si el missatge conté l'emoji ⚠️ per marcar-lo com a important
			if (text.includes('⚠️')) {
				return this.addAgentImportantMessage(text);
			}
			return this.addMessage({ type: 'agent', text, name: 'Agentforce'});
		},

		addAgentImportantMessage(text) {
			return this.addMessage({ type: 'agentImportant', text, name: 'Agentforce'});
		},

		addSystemMessage(text) {
			return this.addMessage({ type: 'system', text });
		},

		addErrorMessage(text) {
			return this.addMessage({ type: 'error', text });
		},

		removeMessage(messageId) {
			const index = this.messages.findIndex(m => m.id === messageId);
			if (index !== -1) {
				this.messages.splice(index, 1);
			}
		},

		getMessages() {
			return this.messages;
		}
	},

	// Funcions de renderització
	// Funcions de renderització
	renderMessage(message) {
		if (!message || !message.type) {
			console.error('Invalid message format:', message);
			return null;
		}

		// No renderitzem missatges d'usuari ocults
		if (message.type === 'userHidden') {
			return null;
		}

		const messageItem = document.createElement('li');
		let messageClass = message.type === 'typing' ? 'agent' : message.type;

		// Afegim classe especial per missatges importants
		if (message.type === 'agentImportant') {
			messageClass += ' important';
		}

		messageItem.className = `message ${messageClass} new-message`;

		// Eliminem la classe new-message després de l'animació
		messageItem.addEventListener('animationend', () => {
			messageItem.classList.remove('new-message');
		});

		if (message.type === 'system' || message.type === 'error') {
			messageItem.innerHTML = message.text.replace(/\n/g, '<br>');
			return messageItem;
		}

		const messageContent = document.createElement('div');
		if (message.type !== 'typing') {
			messageContent.className = 'message-content';
		}

		const messageAvatar = document.createElement('div');
		messageAvatar.className = 'message-avatar';
		// messageAvatar.draggable = false;
		if (message.type === 'agent' || message.type === 'typing') {
			const avatarImg = document.createElement('img');
			avatarImg.src = '/src/assets/images/agent_astro.svg';
			avatarImg.alt = 'Agent Avatar';
			avatarImg.className = 'agent-avatar';
			avatarImg.title = 'Agentforce';
			avatarImg.draggable = false;
			messageAvatar.appendChild(avatarImg);

			if (message.type === 'agent') {
				const messageName = document.createElement('div');
				messageName.className = 'message-name';
				messageName.textContent = message.name;
				messageContent.appendChild(messageName);
			}
		} else {
			const userAvatar = document.createElement('div');
			userAvatar.className = 'user-avatar';
			userAvatar.textContent = 'E';
			messageAvatar.appendChild(userAvatar);
		}

		const messageText = document.createElement('div');
		messageText.className = 'message-text';
		if (message.type === 'typing') {
			messageText.innerHTML = '<dotlottie-player src="/src/assets/animations/typing.json" background="transparent" speed="1" style="width: 53px"; loop autoplay></dotlottie-player>';
		} else {
			messageText.innerHTML = message.text.replace(/\n/g, '<br>');
		}

		const messageTime = document.createElement('div');
		messageTime.className = 'message-time';
		messageTime.textContent = message.timestamp.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });

		messageContent.appendChild(messageText);
		message.type !== 'typing' && messageContent.appendChild(messageTime);
		messageItem.appendChild(messageContent);
		messageItem.appendChild(messageAvatar);

		return messageItem;
	},

	renderMessages() {
		// Actualitzem el xat flotant
		const floatingMessages = this.elements.messages;
		if (floatingMessages) {
			const floatingMessagesList = floatingMessages.querySelector('.messages-list');
			if (floatingMessagesList) {
				const currentMessageIds = Array.from(floatingMessagesList.children).map(el => parseInt(el.dataset.messageId));
				const storeMessageIds = this.messageStore.getMessages().map(m => m.id);

				// Remove messages that are no longer in the store
				Array.from(floatingMessagesList.children).forEach(el => {
					const messageId = parseInt(el.dataset.messageId);
					if (!storeMessageIds.includes(messageId)) {
						el.remove();
					}
				});

				// Add new messages (excluding hidden messages)
				this.messageStore.getMessages().forEach(message => {
					if (!currentMessageIds.includes(message.id) && message.type !== 'userHidden') {
						const messageElement = this.renderMessage(message);
						if (messageElement) {
							messageElement.dataset.messageId = message.id;
							floatingMessagesList.appendChild(messageElement);
						}
					}
				});

				this.scrollToBottom(false);
			}
		}

		// Actualitzem el xat del dashboard
		const dashboardMessages = this.elements.dashboardMessages;
		if (dashboardMessages) {
			const dashboardMessagesList = dashboardMessages.querySelector('.messages-list');
			if (dashboardMessagesList) {
				const currentMessageIds = Array.from(dashboardMessagesList.children).map(el => parseInt(el.dataset.messageId));
				const storeMessageIds = this.messageStore.getMessages().map(m => m.id);

				// Remove messages that are no longer in the store
				Array.from(dashboardMessagesList.children).forEach(el => {
					const messageId = parseInt(el.dataset.messageId);
					if (!storeMessageIds.includes(messageId)) {
						el.remove();
					}
				});

				// Add new messages (excluding hidden messages)
				this.messageStore.getMessages().forEach(message => {
					if (!currentMessageIds.includes(message.id) && message.type !== 'userHidden') {
						const messageElement = this.renderMessage(message);
						if (messageElement) {
							messageElement.dataset.messageId = message.id;
							dashboardMessagesList.appendChild(messageElement);
						}
					}
				});

				this.scrollToBottom(true);
			}
		}
	},

	async init() {
		this.debug.log('info', 'Initializing ChatWidget');

		this.elements.chatContainer = document.getElementById('chatContainer');
		this.elements.dashboardAssistant = document.querySelector('.dashboard-card.assistant');

		// Si no tenim cap dels dos contenidors, sortim
		if (!this.elements.chatContainer && !this.elements.dashboardAssistant) {
			this.debug.log('warn', 'No chat containers found');
			return;
		}

		this.debug.log('debug', 'Chat containers found', {
			chatContainer: !!this.elements.chatContainer,
			dashboardAssistant: !!this.elements.dashboardAssistant
		});

		// Iniciem la sessió primer
		try {
			if (!this.session.id) {
				this.debug.log('info', 'Starting new session');
				const sessionData = await SfAgentApi.startSession();
				this.session.id = sessionData.sessionId;
				this.messageStore.addSystemMessage('Your AI assistant is ready.');

				this.debug.log('info', 'Session started', { sessionId: this.session.id });

				// Enviem prompt inicial invisible si està habilitat
				if (this.options.initialMessages) {
					this.debug.log('debug', 'Sending initial hidden message');
					const hiddenMessage = await this.addUserHiddenMessage('My name is Elizabeth, give me the initial important messages');
					await this.sendMessageToAgent(hiddenMessage);
				} else {
					this.debug.log('debug', 'Initial messages disabled, using welcome message');
					// Només mostrem el missatge de benvinguda si no estan habilitats els initialMessages
					this.messageStore.addAgentMessage(sessionData.welcomeMessage);
				}
			} else {
				this.debug.log('debug', 'Session already exists', { sessionId: this.session.id });
			}
		} catch (error) {
			this.debug.log('error', 'Failed to initialize session', error);
			console.error('Error starting session:', error);
			this.messageStore.addErrorMessage('There was an error starting the chat session. Please try again later.');
			return;
		}

		this.debug.log('info', 'ChatWidget initialized successfully');
		this.debug.updateSessionInfo();

		// Inicialitzem el xat del dashboard si existeix
		if (this.elements.dashboardAssistant) {
			await this.initDashboardChat();
		}

		// Carreguem el xat flotant si existeix el contenidor
		if (this.elements.chatContainer) {
			// await this.loadAndShowChat(false);
		}

		// Configurem el botó de live chat si existeix
		this.elements.chatButton = document.querySelector('.pop-out-icon');
		if (this.elements.chatButton) {
			const chatButtonOnclick = async (e) => {
				const supportPopover = document.querySelector('.support-popover');
				if (supportPopover) {
					supportPopover.classList.remove('visible');
				}
				e.preventDefault();
				e.stopPropagation();
				this.toggle();
			};
			this.elements.chatButton.addEventListener('click', chatButtonOnclick);
		}

		// Renderitzem els missatges només un cop al final
		this.renderMessages();
	},

	async initDashboardChat() {
		this.elements.dashboardInput = document.querySelector('.chat-input-input');
		const chatContainer = document.getElementById('chatContainer');
		if (chatContainer) {
			this.elements.messages = chatContainer.querySelector('.chat-messages');
		}
		if (this.elements.dashboardAssistant) {
			this.elements.dashboardMessages = this.elements.dashboardAssistant.querySelector('.chat-messages');
			this.elements.dashboardSendButton = this.elements.dashboardAssistant.querySelector('.send-button');
		}

		this.cacheElements();
		// Afegim els event listeners pel xat del dashboard
		if (this.elements.dashboardInput) {
			this.elements.dashboardInput.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
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
	},

	async sendMessageToAgent(message, isDashboard = false) {
		this.debug.log('debug', 'Sending message to agent', {
			messageType: message.type || 'string',
			isDashboard,
			messageText: typeof message === 'string' ? message : message.text
		});

		try {
			// Si el missatge és userHidden, l'enviem però no el mostrem
			if (message.type === 'userHidden') {
				this.debug.log('debug', 'Processing hidden message');
				const agentResponse = await SfAgentApi.sendMessageSynchronous(message.text);
				// Afegim la resposta de l'agent però no el missatge ocult
				this.addAgentMessage(agentResponse, isDashboard);
				this.debug.log('info', 'Hidden message processed successfully');
				return true;
			}

			// Per missatges normals, enviem el text del missatge
			const messageText = typeof message === 'string' ? message : message.text;
			this.debug.log('debug', 'Sending normal message', { messageText });
			const agentMessage = await SfAgentApi.sendMessageSynchronous(messageText);
			this.addAgentMessage(agentMessage, isDashboard);
			this.debug.log('info', 'Message sent successfully');
			return true;
		} catch (error) {
			this.debug.log('error', 'Failed to send message', error);
			console.error('Error sending message:', error);
			this.messageStore.addErrorMessage('Unable to send message. Please try again.', isDashboard);
			this.renderMessages();
			return false;
		}
	},

	async endSession() {
		if (!this.session.id) return;

		try {
			await SfAgentApi.endSession();
			this.session.id = null;
			this.session.sequenceId = 0;
			this.messageStore.addSystemMessage('Agent session ended.', true);
		} catch (error) {
			console.error('Error ending session:', error);
			this.messageStore.addErrorMessage('There was a problem ending the session.', true);
		} finally {
			this.renderMessages();
		}
	},

	async loadAndShowChat(shouldShow = true) {
		try {
			const response = await fetch('index.html');
			if (!response.ok) throw new Error('Could not load chat');

			const html = await response.text();
			this.elements.chatContainer.innerHTML = html;
			this.elements.isLoaded = true;
			this.cacheElements();
			this.setupEventListeners();

			// Assegurem que tenim l'estructura de missatges
			let messagesContainer = this.elements.messages;
			if (!messagesContainer) {
				messagesContainer = document.getElementById('chatContainer').querySelector('.chat-messages');
			}
			let messagesList = messagesContainer.querySelector('.messages-list');
			if (!messagesList) {
				messagesList = document.createElement('ul');
				messagesList.className = 'messages-list';
				messagesContainer.appendChild(messagesList);
			}

			// Renderitzem els missatges
			this.renderMessages();

			// Obrim el xat si cal
			if (shouldShow) {
				this.toggle();
			}
		} catch (error) {
			console.error('Error loading chat:', error);
			this.elements.isLoaded = false;
		}
	},

	cacheElements() {
		this.elements.dashboardGrid = document.querySelector('.dashboard-grid');
		this.elements.widget = document.getElementById('chatWidget');
		this.elements.messages = document.querySelector('.chat-messages');
		this.elements.input = document.querySelector('.chat-input-input');
		this.elements.sendButton = document.querySelector('.send-button');
		this.updateSendButtonState();
	},

	setupEventListeners() {
		this.elements.isOpen = false;

		if (this.elements.messages) {
			this.elements.messages.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));
		}

		if (this.elements.input) {
			this.elements.input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
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

		const chatHeader = this.elements.widget?.querySelector('.chat-header');
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
					this.elements.dashboardGrid.classList.remove('chatDetached');
					this.elements.widget.classList.remove('chat-widget-closing');
					this.elements.widget.removeEventListener('transitionend', handleTransitionEnd);
					// this.endSession(); // Close session when chat is closed
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
				this.elements.dashboardGrid.classList.add('chatDetached');
			});
		}
	},

	updateSendButtonState() {
		if (!this.elements.sendButton) return;

		const isDisabled = !this.session.id ||
			!this.elements.input?.value.trim() ||
			this.elements.isWaitingResponse;

		this.elements.sendButton.disabled = isDisabled;
	},

	async sendMessage() {
		//PENDIENTE
		const message = this.elements.input?.value.trim();
		if (!message || !this.session.id || this.elements.isWaitingResponse) return;

		if (message) {
			this.elements.isWaitingResponse = true;
			this.updateSendButtonState();

			this.addUserMessage(message, false);
			this.elements.input.value = '';
			this.updateSendButtonState();

			// Esperem 1 segon abans de mostrar l'indicador de typing
			await new Promise(resolve => setTimeout(resolve, 1000));
			const typingMessage = this.addTypingIndicator();

			try {
				await this.sendMessageToAgent(message, false);
			} finally {
				if (typingMessage) {
					typingMessage.remove();
				}
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

			// Esperem 1 segon abans de mostrar l'indicador de typing
			await new Promise(resolve => setTimeout(resolve, 1000));
			const typingMessage = this.addTypingIndicator();

			try {
				await this.sendMessageToAgent(message, true);
			} finally {
				if (typingMessage) {
					typingMessage.remove();
				}
			}

			this.elements.isWaitingResponse = false;
			this.updateDashboardSendButtonState();
		}
	},

	updateDashboardSendButtonState() {
		if (!this.elements.dashboardSendButton) return;

		const isDisabled = !this.session.id ||
			!this.elements.dashboardInput?.value.trim() ||
			this.elements.isWaitingResponse;

		this.elements.dashboardSendButton.disabled = isDisabled;
	},

	// Mètode auxiliar per afegir missatge i renderitzar
	async _addMessageAndRender(messageFunction, ...args) {
		const isDashboard = args[args.length - 1] === true;
		const messageArgs = isDashboard ? args.slice(0, -1) : args;
		const message = messageFunction.apply(this.messageStore, messageArgs);
		await new Promise(resolve => setTimeout(resolve, 0)); // Petit retard per permetre que el DOM s'actualitzi
		this.renderMessages();
		return message;
	},

	// Interfície pública simplificada que només afegeix la renderització
	addUserMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addUserMessage, text, isDashboard);
	},

	addUserHiddenMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addUserHiddenMessage, text, isDashboard);
	},

	addAgentMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addAgentMessage, text, isDashboard);
	},

	addAgentImportantMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addAgentImportantMessage, text, isDashboard);
	},

	addSystemMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addSystemMessage, text, isDashboard);
	},

	addErrorMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addErrorMessage, text, isDashboard);
	},

	addTypingIndicator() {
		const message = this.messageStore.addMessage({ type: 'typing', name: 'Agentforce' });
		this.renderMessages();
		return {
			remove: () => {
				this.messageStore.removeMessage(message.id);
				this.renderMessages();
			}
		};
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

	initResizeListeners() {
		if (!this.elements.fixedWidget) return;

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

export default ChatWidget;

document.addEventListener('DOMContentLoaded', () => {
	setTimeout(() => {
		const chatContainer = document.createElement('div');
		chatContainer.id = 'chatContainer';
		document.body.appendChild(chatContainer);
	}, 5000);
});

// Observem quan s'afegeix l'element chatContainer al DOM
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		mutation.addedNodes.forEach((node) => {
			if (node.nodeType === Node.ELEMENT_NODE && node.id === 'chatContainer') {
				ChatWidget.init();
				ChatWidget.elements.messages = document.getElementById('chatContainer').querySelector('.chat-messages');
				observer.disconnect();
			}
		});
	});
});

observer.observe(document.body, { childList: true, subtree: true });

// Tanquem la sessió quan es tanca la finestra
window.addEventListener('beforeunload', async () => {
	if (ChatWidget.session.id) {
		// Eliminem el token d'accés
		localStorage.removeItem('futureBankSalesforceAccessToken');
		// Tanquem la sessió
		await ChatWidget.endSession();
	}
});

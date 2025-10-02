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

		addAgentMessage(text) {
			return this.addMessage({ type: 'agent', text, name: 'Agentforce'});
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
	renderMessage(message) {
		if (!message || !message.type) {
			console.warn('Invalid message format:', message);
			return null;
		}

		const messageItem = document.createElement('li');
		messageItem.className = `message ${message.type === 'typing' ? 'agent' : message.type} new-message`;

		// Eliminem la classe new-message després de l'animació
		messageItem.addEventListener('animationend', () => {
			messageItem.classList.remove('new-message');
		});

		if (message.type === 'system' || message.type === 'error') {
			messageItem.innerHTML = message.text.replace(/\n/g, '<br>');
			return messageItem;
		}

		const messageContent = document.createElement('div');
		messageContent.className = 'message-content';

		const messageAvatar = document.createElement('div');
		messageAvatar.className = 'message-avatar';

		if (message.type === 'agent' || message.type === 'typing') {
			const avatarImg = document.createElement('img');
			avatarImg.src = '/src/assets/images/agent_astro.svg';
			avatarImg.alt = 'Agent Avatar';
			avatarImg.className = 'agent-avatar';
			messageAvatar.appendChild(avatarImg);

			const messageName = document.createElement('div');
			messageName.className = 'message-name';
			messageName.textContent = message.name;
			messageContent.appendChild(messageName);
		} else {
			const userAvatar = document.createElement('div');
			userAvatar.className = 'user-avatar';
			userAvatar.textContent = 'E';
			messageAvatar.appendChild(userAvatar);
		}

		const messageText = document.createElement('div');
		messageText.className = 'message-text';
		if (message.type === 'typing') {
			messageText.innerHTML = '<dotlottie-player src="/src/assets/animations/typing.json" background="transparent" speed="1" style="width: 62px"; loop autoplay></dotlottie-player>';
		} else {
			messageText.innerHTML = message.text.replace(/\n/g, '<br>');
		}

		const messageTime = document.createElement('div');
		messageTime.className = 'message-time';
		messageTime.textContent = message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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

				this.messageStore.getMessages().forEach(message => {
					if (!currentMessageIds.includes(message.id)) {
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

				this.messageStore.getMessages().forEach(message => {
					if (!currentMessageIds.includes(message.id)) {
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
		console.log('init');
		this.elements.chatContainer = document.getElementById('chatContainer');
		this.elements.dashboardAssistant = document.querySelector('.dashboard-card.assistant');

		// Si no tenim cap dels dos contenidors, sortim
		if (!this.elements.chatContainer && !this.elements.dashboardAssistant) {
			return;
		}

		// Iniciem la sessió primer
		try {
			if (!this.session.id) {
				const sessionData = await SfAgentApi.startSession();
				this.session.id = sessionData.sessionId;
				this.messageStore.addSystemMessage('Your AI assistant is ready.');
				this.messageStore.addAgentMessage(sessionData.welcomeMessage);
			}
		} catch (error) {
			console.error('Error starting session:', error);
			this.messageStore.addErrorMessage('There was an error starting the chat session. Please try again later.');
			return;
		}

		// Inicialitzem el xat del dashboard si existeix
		if (this.elements.dashboardAssistant) {
			await this.initDashboardChat();
		}

		// Carreguem el xat flotant si existeix el contenidor
		if (this.elements.chatContainer) {
			await this.loadAndShowChat(false);
		}

		// Configurem el botó de live chat si existeix
		this.elements.chatButton = document.querySelector('.pop-out-icon');
		if (this.elements.chatButton) {
			const chatButtonOnclick = async (e) => {
				document.querySelector('.support-popover').classList.remove('visible');
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
		this.elements.dashboardInput = document.getElementById('chatInputFixed');
		const chatContainer = document.getElementById('chatContainer');
		if (chatContainer) {
			this.elements.messages = chatContainer.querySelector('.chat-messages');
		}
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
	},

	async sendMessageToAgent(message, isDashboard = false) {
		try {
			const agentMessage = await SfAgentApi.sendMessage(message);
			this.addAgentMessage(agentMessage, isDashboard);
			return true;
		} catch (error) {
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
			!this.elements.dashboardInput.value.trim() ||
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

	addAgentMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addAgentMessage, text, isDashboard);
	},

	addSystemMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addSystemMessage, text, isDashboard);
	},

	addErrorMessage(text, isDashboard = false) {
		return this._addMessageAndRender(this.messageStore.addErrorMessage, text, isDashboard);
	},

	addTypingIndicator() {
		const message = this.messageStore.addMessage({ type: 'typing', name: 'Agentforce'});
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

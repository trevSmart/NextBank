import SfAgentApi from './libs/sfAgentApi.js';
//eslint-disable-next-line no-unused-vars
import InputMultiline from './libs/InputMultiline.js';

class Session {
	constructor(afClient) {
		this.afClient = afClient;
		this.sessionId = null;
		this.sequenceId = 0;
	}

	async startSession() {
		const response = await this.afClient.sfAgentApi.startSession(this.afClient.options.streaming);
		//eslint-disable-next-line no-console
		console.log('Agentforce session started with id:', response.sessionId) ;
		this.sessionId = response.sessionId;
		return response;
	}

	async endSession() {
		if (this.sessionId) {
			await this.afClient.sfAgentApi.endSession();
			this.sessionId = null;
			this.sequenceId = 0;
		}
	}
}

class UiInstance {
	constructor(afClient, id, node) {
		this.afClient = afClient;
		this.id = id || node.id;
		this.node = node;
		this.options = {
			scrollOnResponse: true,
			speak: false,
		};

		const createElements = () => {
			const uiContainer = document.createElement('div') ;
			uiContainer.id = 'uiContainer';
			uiContainer.className = 'ui-container';

			const uiChatMessages = document.createElement('div');
			uiChatMessages.className = 'chat-messages';

			const uiMessagesList = document.createElement('ul');
			uiMessagesList.className = 'messages-list';

			const chatInput = document.createElement('div');
			chatInput.className = 'chat-input';

			const chatInputInput = document.createElement('input-multiline');
			chatInputInput.id = `chatInputInput-${this.id}`;

			const chatInputButtons = document.createElement('div');
			chatInputButtons.className = 'chat-input-buttons';

			const buttonStartConextSelection = document.createElement('button');
			buttonStartConextSelection.className = 'add-context-button';
			//buttonStartConextSelection.innerHTML = '<i class="fas fa-plus"></i>';
			buttonStartConextSelection.innerHTML = '<i class="fas fa-paperclip"></i>';
			buttonStartConextSelection.title = 'Add context';
			buttonStartConextSelection.disabled = true;

			const buttonSendMessage = document.createElement('button');
			buttonSendMessage.id = `buttonSendMessage-${this.id}`;
			buttonSendMessage.className = 'send-button';
			buttonSendMessage.innerHTML = '<i class="fas fa-paper-plane"></i>';
			buttonSendMessage.disabled = this.afClient.session.sessionId === null;

			const contextSelectionBackdrop = document.createElement('div');
			contextSelectionBackdrop.className = 'context-selection-backdrop';

			uiChatMessages.appendChild(uiMessagesList);
			uiChatMessages.appendChild(chatInput);
			chatInput.appendChild(chatInputInput);
			chatInputButtons.appendChild(buttonStartConextSelection);
			chatInputButtons.appendChild(buttonSendMessage);
			chatInput.appendChild(chatInputButtons);
			uiContainer.appendChild(uiChatMessages);
			uiContainer.appendChild(chatInput);

			document.body.insertBefore(contextSelectionBackdrop, document.body.firstChild);

			this.node.appendChild(uiContainer);

			chatInputInput.addEventListener('keydown', async event => {
				if (event.key === 'Enter' && !event.shiftKey)  {
					event.preventDefault();
					if (chatInputInput.value.trim()) {
						this.sendMessage(chatInputInput.value);
						chatInputInput.value = '';
					}
				}
			});

			chatInputInput.addEventListener('input', () => {
				buttonSendMessage.disabled = !this.afClient.isConnected()
				|| !chatInputInput.value.trim()
				|| this.afClient.conversation.awaitingAgentResponse;
			});

			buttonStartConextSelection.addEventListener('click', () => this.afClient.startContextSelection());
			buttonSendMessage.addEventListener('click', () => this.sendMessage(chatInputInput.value.toString()));
			contextSelectionBackdrop.addEventListener('click', () => this.afClient.endContextSelection());

			this.messageListNode = uiMessagesList;
		};

		if (!document.querySelector('link[href$="agentforceClient.css"]')) {
			const linkStyle = document.createElement('link');
			linkStyle.rel = 'stylesheet';
			linkStyle.href = new URL('./agentforceClient.css', import.meta.url).href;
			linkStyle.addEventListener('load', () => {
				createElements();
				this.afClient.conversation.render([this.messageListNode]);
			}, {once: true});
			document.head.appendChild(linkStyle);
		} else {
			createElements();
			this.afClient.conversation.render([this.messageListNode]);
		}
	}

	scrollToBottom(smooth = true) {
		requestAnimationFrame(() => {
			const chatMessages = this.node.querySelector('.chat-messages');
			if (chatMessages) {
				chatMessages.scrollTo({top: chatMessages.scrollHeight, behavior: smooth ? 'smooth' : 'auto'});
			}
		});
	}

	sendMessage(text) {
		if (this.afClient.selectedContext) {
			const contextId = this.afClient.selectedContext.dataset.contextId;
			const contextLabel = this.afClient.selectedContext.dataset.contextLabel;
			text = `${contextLabel} (${contextId})\n\n${text}`;
			this.afClient.removeContext();
		}
		this.afClient.sendMessage(text, null);

		document.getElementById(`chatInputInput-${this.id}`).value = '';
		document.getElementById(`buttonSendMessage-${this.id}`).disabled = true;
	}
}

class Message {
	constructor(id, type, text, context = null, conversation, originEventId = null, status = null) {
		if (!id || !type) {
			return;
		}
		this.id = id;
		this.originEventId = originEventId;
		this.type = type;
		this.text = text;
		this.context = context;
		this.conversation = conversation;
		this.timestamp = new Date();
		this.status = status; //'Streaming' o 'Completed'
		return this;
	}

	async render(nodes) {
		if (!nodes.some(node => node)) {
			return;
		}

		const messageListItem = document.createElement('li');
		const classNameAux = this.type === 'typing' ? 'agent typing' : this.type === 'agentImportant' ? 'agent important' : this.type;
		messageListItem.className = `message new-message ${classNameAux}`;
		messageListItem.dataset.id = this.id;

		//Eliminem la classe new-message després de l'animació
		messageListItem.addEventListener('animationend', () => {
			messageListItem.classList.remove('new-message');
		});

		const messageContent = document.createElement('div');
		if (this.type !== 'typing') {
			messageContent.className = 'message-content';
		}

		const messageAvatar = document.createElement('div');

		const messageSpeak = document.createElement('div');
		//if (this.type === 'agent') {
		//messageSpeak.className = 'message-speak';
		//messageSpeak.innerHTML = '<button class="message-speak-button"><i class="fas fa-volume-high"></i></button>';
		//messageContent.appendChild(messageSpeak);
		//}

		const messageTime = document.createElement('div');
		if (this.type === 'agent' || this.type === 'agentImportant' || this.type === 'typing' || this.type === 'user') {
			messageAvatar.className = 'message-avatar';
			//messageAvatar.draggable = false;
			if (this.type === 'agent' || this.type === 'agentImportant' || this.type === 'typing') {
				if (this.type === 'agentImportant') {
					messageAvatar.innerHTML = '<i class="fas fa-exclamation-triangle" style="position: relative; top: -1px;"></i>';
				} else {
					const avatarImg = document.createElement('img');
					avatarImg.alt = 'Agent Avatar';
					avatarImg.className = 'agent-avatar';
					avatarImg.title = 'Agentforce';
					avatarImg.draggable = false;
					avatarImg.src = '/src/assets/images/agent_astro.svg';
					messageAvatar.appendChild(avatarImg);
				}

				if (this.type === 'agent') {
					const messageName = document.createElement('div');
					messageName.className = 'message-name';
					messageName.textContent = 'Agentforce';
					messageContent.appendChild(messageName);
				}
			} else {
				//avatar d'usuari
				const userAvatar = document.createElement('div');
				userAvatar.className = 'user-avatar';
				userAvatar.textContent = 'E';
				messageAvatar.appendChild(userAvatar);
			}

			messageTime.className = 'message-time';
			messageTime.textContent = this.timestamp.toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit'});
		}

		const messageText = document.createElement('div');
		messageText.className = 'message-text';
		if (this.type === 'typing') {
			messageText.innerHTML = '<dotlottie-player src="/src/assets/animations/typing.json" background="transparent" speed="1" style="width: 53px"; loop autoplay></dotlottie-player>';
		} else if (this.text) {
			//Format the text with HTML tags
			let formattedText = this.text
				.replace(/\n/g, '<br>')
				.replace(/^([^<]*?\([^)]+\))(<br>|$)/, '<span class="context-info"><i class="fa-solid fa-paperclip"></i> $1</span>$2') //First line with Description (Id) -> context-info with icon
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') //**text** -> <strong>text</strong>
				.replace(/\*(.*?)\*/g, '<em>$1</em>') //*text* -> <em>text</em>
				.replace(/`(.*?)`/g, '<code>$1</code>') //`text` -> <code>text</code>
				.replace(/~~(.*?)~~/g, '<del>$1</del>'); //~~text~~ -> <del>text</del>

			messageText.innerHTML = formattedText;
		}

		messageContent.appendChild(messageText);
		messageListItem.appendChild(messageContent);
		if (this.type === 'user' || this.type === 'agent' || this.type === 'agentImportant' || this.type === 'typing') {
			messageListItem.appendChild(messageAvatar);
			this.type === 'agent' && messageContent.appendChild(messageSpeak);
			this.type !== 'typing' && messageContent.appendChild(messageTime);
		}

		nodes.forEach(node => node.appendChild(messageListItem));

		return messageListItem;
	}

	async update(partialText) {
		const textToShow = typeof partialText === 'string' ? partialText : this.text;
		this.conversation.afClient.uiInstances.forEach(async ui => {
			const messageListItem = ui.messageListNode.querySelector(`li[data-id="${this.id}"]`);
			if (messageListItem) {
				messageListItem.querySelector('.message-text').innerHTML = textToShow
					.replace(/\n/g, '<br>')
					.replace(/^([^<]*?\([^)]+\))(<br>|$)/, '<span class="context-info"><i class="fa-solid fa-paperclip"></i> $1</span>$2')
					.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
					.replace(/\*(.*?)\*/g, '<em>$1</em>')
					.replace(/`(.*?)`/g, '<code>$1</code>')
					.replace(/~~(.*?)~~/g, '<del>$1</del>');
			}
		});
		this.conversation.afClient.uiInstances.filter(ui => ui.options.scrollOnResponse).forEach(ui => ui.scrollToBottom());
	}
}

class Conversation {
	constructor(afClient) {
		this.afClient = afClient;
		this.messages = [];
		this.lastMessageId = 0;
		this.awaitingAgentResponse = false;
	}

	async render(nodes) {
		this.messages.filter(message => message.type !== 'userHidden').forEach(async message => {
			await message.render(nodes);
		});
	}

	async addMessage(type, text, context = null, id, originEventId = null, status = 'Completed') {
		const message = new Message(id || ++this.lastMessageId, type, text, context, this, originEventId, status);
		type !== 'userHidden' && this.messages.push(message);

		if (this.afClient.options.devMode) {
			//Safe serialization to avoid circular reference errors
			const safeMessages = this.messages.map(msg => ({
				id: msg.id,
				type: msg.type,
				text: msg.text,
				timestamp: msg.timestamp,
				status: msg.status,
				originEventId: msg.originEventId
			}));
			console.log(safeMessages);
		}

		if (type === 'user' || type === 'userHidden') {
			//Disable all send buttons across all UI instances
			this.awaitingAgentResponse = true;
			document.querySelectorAll('[id^="buttonSendMessage-"]').forEach(button => {
				button.disabled = true;
			});

			if (this.afClient.options.streaming) {
				const afClient = this.afClient;
				afClient.sfAgentApi.addEventListener('chunk', ({detail: chunk}) => {
					if (chunk.eventType === 'PROGRESS_INDICATOR') {
						afClient.addMessage('typing', null, null);

					} else if (chunk.eventType === 'TEXT_CHUNK') {
						console.log(JSON.stringify(chunk));
						const chunkData = chunk.data;
						afClient.addMessage('agent', chunkData.message, null, chunkData.id, chunkData.originEventId, 'Streaming');
					}
				});
			}

			const sendMessageToAgent = async () => {
				try {
					const responseMessage = await this.afClient.sfAgentApi.sendMessage(text);
					await this.afClient.onAgentMessageReceived(responseMessage);
				} catch (error) {
					console.error('Error sending message to agent:', error);
					await this.afClient.addMessage('error', 'Error sending message: ' + error.message);
				} finally {
					this.awaitingAgentResponse = false;
					//Re-enable send buttons for inputs that have content
					document.querySelectorAll('[id^="chatInputInput-"]').forEach(input => {
						const buttonId = input.id.replace('chatInputInput-', 'buttonSendMessage-');
						const button = document.getElementById(buttonId);
						if (button) {
							button.disabled = !this.afClient.isConnected() || !input.value.trim();
						}
					});
				}
			};

			sendMessageToAgent();
		}
		return message;
	}

	removeMessages(ids) {
		//return;
		this.messages = this.messages.filter(message => !ids.includes(message.id));
		this.afClient.uiInstances.forEach(ui => {
			Array.from(ui.messageListNode.querySelectorAll('.message'))
				.filter(msg => ids.map(String).includes(msg.dataset.id))
				.forEach(uiMessage => uiMessage.remove());
		});
	}

	getMessages() {
		return this.messages;
	}

	getMessage(id) {
		return this.messages.find(message => message.id === id);
	}
}

export default class AfClient {
	constructor(options = {}) {
		this.uiInstances = [];
		this.session = new Session(this);
		this.conversation = new Conversation(this);
		this.typingTimeoutId = null;
		this.contextAreaHandlers = new Map();
		this.options = {
			streaming: false,
			initialMessages: true,
			devMode: false,
			...options
		};
		//Control d'animació incremental per missatge (id -> {timeout, targetText, currentText})
		this.streamingAnimations = new Map();

		this.sfAgentApi = new SfAgentApi({useProxy: true});
	}

	isConnected() {
		return this.session.sessionId !== null;
	}

	async startSession() {
		try {
			const {welcomeMessage} = await this.session.startSession();
			this.addMessage('system', 'Your AI assistant is ready');
			//this.addMessage('agent', welcomeMessage);
			if (this.options.initialMessages) {
				this.addMessage('userHidden', 'My name is Elizabeth, give me the initial important messages');
			}

			//Enable all context buttons across all UI instances
			document.querySelectorAll('.add-context-button').forEach(button => {
				button.disabled = false;
			});

		} catch (error) {
			console.error('Error starting session:', error);
			this.addMessage('error', 'Error starting session: ' + error.message);
		}
	}

	async endSession() {
		await this.session.endSession();

		//Disable all context buttons across all UI instances
		document.querySelectorAll('.add-context-button').forEach(button => {
			button.disabled = true;
		});
	}

	async newUiInstance(node, id) {
		let newId;
		if (id) {
			newId = id;
		} else if (id === 'auto') {
			newId = this.uiInstances.reduce((max, ui) => ui.id > max ? ui.id : max, 0) + 1;
		} else if (node.id) {
			newId = node.id;
		} else {
			throw new Error('Invalid id for new UI instance');
		}
		const uiInstance = new UiInstance(this, newId, node);
		this.uiInstances.push(uiInstance);

		//Sync context to the new UI instance if there's a selected context
		if (this.selectedContext) {
			const {contextId, contextLabel} = this.selectedContext.dataset;
			const newInput = document.getElementById(`chatInputInput-${newId}`);
			if (newInput) {
				newInput.setContextItem(contextId, contextLabel);
			}
		}

		//Enable context button for new UI instance if session is active
		if (this.isConnected()) {
			const newContextButton = uiInstance.node.querySelector('.add-context-button');
			if (newContextButton) {
				newContextButton.disabled = false;
			}
		}

		return uiInstance;
	}

	getUiInstance(id) {
		return this.uiInstances.find(ui => ui.id === id);
	}

	async addMessage(type, text, context = null, id, originEventId = null, status = null) {
		const message = await this.conversation.addMessage(type, text, context, id, originEventId, status);
		await Promise.all(this.uiInstances.map(async ui => await message.render([ui.messageListNode])));
		await Promise.all(this.uiInstances.filter(ui => ui.options.scrollOnResponse).map(async ui => await ui.scrollToBottom()));
		return message;
	}

	async sendMessage(text, context = null) {
		if (this.session.sessionId) {
			this.addMessage('user', text, context);
			if (this.typingTimeoutId) {
				clearTimeout(this.typingTimeoutId);
			}

			if (!this.options.streaming) {
				this.typingTimeoutId = setTimeout(() => this.addMessage('typing', null, null), 1100);
			}
		}
	}

	async onAgentMessageReceived(message) {
		console.log('onAgentMessageReceived', message);
		if (typeof message !== 'string') {
			console.error('Message is not a string: ' + message);
			return;
		}



		if (message.includes('⚠️')) {
			const warningIndex = message.indexOf('⚠️');
			const beforeWarning = message.substring(0, warningIndex).trim();
			const afterWarning = message.substring(warningIndex).trim();

			if (beforeWarning) {
				await this.addMessage('agent', beforeWarning, null, undefined);
			}
			if (afterWarning) {
				await this.addMessage('agentImportant', afterWarning, null, undefined);
			}
			document.querySelector('body').classList.add('alerts-visible');
			//Scroll any lists with an element with class alert to make it visible
			const alertElements = document.querySelectorAll('.alert');
			if (alertElements.length) {
				const firstAlert = alertElements[0];
				const container = firstAlert.parentElement;
				const containerRect = container.getBoundingClientRect();
				const elementRect = firstAlert.getBoundingClientRect();

				if (!(elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom)) {
					firstAlert.scrollIntoView({block: 'nearest', behavior: 'smooth'});
				}
			}

		} else {
			await this.addMessage('agent', message);
		}

		if (this.typingTimeoutId) {
			clearTimeout(this.typingTimeoutId);
			this.typingTimeoutId = null;
		}
		const typingIndicators = this.conversation.getMessages().filter(msg => msg.type === 'typing');
		this.conversation.removeMessages(typingIndicators.map(msg => msg.id));

		//Update send button states for all inputs
		document.querySelectorAll('[id^="chatInputInput-"]').forEach(input => {
			const buttonId = input.id.replace('chatInputInput-', 'buttonSendMessage-');
			const button = document.getElementById(buttonId);
			if (button) {
				button.disabled = !input.value.trim();
			}
		});
	}

	async startContextSelection() {
		if (!this.addingContext) {
			this.addingContext = true;

			document.querySelectorAll('.dashboard-card').forEach(card => {
				if (card.querySelector('.afclient-context-area')) {
					card.style.zIndex = 101;
					card.style.color = 'white';
				} else {
					card.style.removeProperty('z-index');
					card.style.removeProperty('color');
				}
			});

			document.querySelector('body').classList.toggle('afclient-is-adding-context', true);
			//Find context areas in light DOM and inside known shadow roots (like custom-calendar)
			const addHandlers = root => {
				root.querySelectorAll('.afclient-context-area').forEach(area => {
					const handler = event => this.selectContext(area, event);
					this.contextAreaHandlers.set(area, handler);
					area.addEventListener('click', handler);
				});
			};

			//Light DOM
			addHandlers(document);

			//Shadow DOMs: traverse known components
			document.querySelectorAll('custom-calendar').forEach(cal => {
				if (cal.shadowRoot) {
					addHandlers(cal.shadowRoot);
				}
			});
		} else {
			this.endContextSelection();
		}
	}

	async endContextSelection() {
		this.addingContext = false;
		document.querySelector('body').classList.remove('afclient-is-adding-context');

		const removeHandlers = root => {
			root.querySelectorAll('.afclient-context-area').forEach(area => {
				const handler = this.contextAreaHandlers.get(area);
				if (handler) {
					area.removeEventListener('click', handler);
					this.contextAreaHandlers.delete(area);
				}
			});
		};

		removeHandlers(document);
		document.querySelectorAll('custom-calendar').forEach(cal => {
			if (cal.shadowRoot) {
				removeHandlers(cal.shadowRoot);
			}
		});
	}

	async selectContext(node, event) {
		event.preventDefault();
		event.stopPropagation();
		document.querySelectorAll('body .afclient-selected-context').forEach(context => {
			context.classList.remove('afclient-selected-context');
		});
		document.querySelector('body').classList.add('afclient-selected-context');

		this.selectedContext = node;
		node.classList.add('afclient-selected-context');

		if (node) {
			const {contextId, contextLabel} = node.dataset;
			//Apply context to all chat inputs across all UI instances
			document.querySelectorAll('[id^="chatInputInput-"]').forEach(input => {
				input.setContextItem(contextId, contextLabel);
			});
		}

		document.querySelector('body').classList.remove('afclient-is-adding-context');
		this.endContextSelection();
	}

	async removeContext() {
		this.selectedContext.classList.remove('afclient-selected-context');
		this.selectedContext = null;
		document.querySelector('body').classList.remove('afclient-selected-context');

		//Clear context from all chat inputs across all UI instances
		document.querySelectorAll('[id^="chatInputInput-"]').forEach(input => {
			input.clearContext();
		});

		this.endContextSelection();
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const chatContainer = document.createElement('div');
	chatContainer.id = 'chatContainer';
	document.body.appendChild(chatContainer);
});
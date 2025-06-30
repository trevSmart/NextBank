import SfAgentApi from './libs/sfAgentApi.js';
//eslint-disable-next-line no-unused-vars
import InputMultiline from './libs/InputMultiline.js';
// import 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';

class Session {
	constructor() {
		this.sessionId = null;
		this.sequenceId = 0;
	}

	async startSession() {
		const response = await SfAgentApi.startSession();
		//eslint-disable-next-line no-console
		console.log('Agentforce session started with id:', response.sessionId ) ;
		this.sessionId = response.sessionId;
		return response;
	}

	async endSession() {
		if (this.sessionId) {
			await SfAgentApi.endSession();
			this.sessionId = null;
			this.sequenceId = 0;
		}
	}
}

class UiInstance {
	constructor(afClient, id, node ) {
		this.afClient = afClient;
		this.id = id || node.id;
		this.node = node;
		this.options = {
			scrollOnResponse: true,
			speak: false,
		};

		const createElements = () => {
			const uiContainer = document.createElement('div' ) ;
			uiContainer.id = 'uiContainer';
			uiContainer.className = 'ui-container';

			const uiChatMessages = document.createElement('div');
			uiChatMessages.className = 'chat-messages';

			const uiMessagesList = document.createElement('ul');
			uiMessagesList.className = 'messages-list';

			const chatInput = document.createElement('div');
			chatInput.className = 'chat-input';

			const chatInputInput = document.createElement('input-multiline' );
			chatInputInput.id = 'chatInputInput';

			const chatInputButtons = document.createElement('div');
			chatInputButtons.className = 'chat-input-buttons';

			const buttonStartConextSelection = document.createElement('button');
			buttonStartConextSelection.className = 'add-context-button';
			// buttonStartConextSelection.innerHTML = '<i class="fas fa-plus"></i>';
			buttonStartConextSelection.innerHTML = '<i class="fas fa-paperclip"></i>';
			buttonStartConextSelection.title = 'Add context';
			buttonStartConextSelection.disabled = true;

			const buttonSendMessage = document.createElement('button');
			buttonSendMessage.id = 'buttonSendMessage';
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
				const disabled = !this.afClient.session.sessionId
					|| !chatInputInput.value.trim()
					|| this.afClient.conversation.awaitingAgentResponse;
				buttonStartConextSelection.disabled = disabled;
				buttonSendMessage.disabled = disabled;
			});

			buttonStartConextSelection.addEventListener('click', () => this.afClient.startContextSelection());
			buttonSendMessage.addEventListener('click', () => this.sendMessage(chatInputInput.value.toString()));
			contextSelectionBackdrop.addEventListener('click', () => this.afClient.endContextSelection());

			this.messageListNode = uiMessagesList;
		}

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
			text = `itemId: ${this.afClient.selectedContext.dataset.contextId}\n\n${text}`;
			this.afClient.removeContext();
		}
		this.afClient.sendMessage(text, null);

		document.getElementById('chatInputInput').value = '';
		document.getElementById('buttonSendMessage').disabled = true;
	}
}

class Message {
	constructor(id, type, text, context = null, conversation, status = null) {
		if (!id || !type || !text && type !== 'typing') {
			return;
		}
		this.id = id;
		this.type = type;
		this.text = text;
		this.context = context;
		this.conversation = conversation;
		this.timestamp = new Date();
		this.status = status; // 'streaming' o 'finished'
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
				const avatarImg = document.createElement('img');
				avatarImg.src = '/src/assets/images/agent_astro.svg';
				avatarImg.alt = 'Agent Avatar';
				avatarImg.className = 'agent-avatar';
				avatarImg.title = 'Agentforce';
				avatarImg.draggable = false;
				messageAvatar.appendChild(avatarImg);

				if (this.type === 'agent') {
					const messageName = document.createElement('div');
					messageName.className = 'message-name';
					messageName.textContent = 'Agentforce';
					messageContent.appendChild(messageName);
				}
			} else {
				// avatar d'usuari
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
			// Format the text with HTML tags
			let formattedText = this.text
				.replace(/\n/g, '<br>')
				.replace(/^(itemId:[^<]*?)(<br>|$)/, '<code>$1</code>$2') // First line with itemId: -> bold
				.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **text** -> <strong>text</strong>
				.replace(/\*(.*?)\*/g, '<em>$1</em>') // *text* -> <em>text</em>
				.replace(/`(.*?)`/g, '<code>$1</code>') // `text` -> <code>text</code>
				.replace(/~~(.*?)~~/g, '<del>$1</del>'); // ~~text~~ -> <del>text</del>

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

	async update() {
		this.conversation.afClient.uiInstances.forEach(async ui => {
			const messageListItem = ui.messageListNode.querySelector(`li[data-id="${this.id}"]`);
			if (messageListItem) {
				messageListItem.querySelector('.message-text').innerHTML = this.text;
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

	async addMessage(type, text, context = null, id, status = null) {
		const message = new Message(id || ++this.lastMessageId, type, text, context, undefined, this, status);
		type !== 'userHidden' && this.messages.push(message);

		this.afClient.options.devMode && console.log(this.messages);

		if (type === 'user' || type === 'userHidden') {
			const chatInputInput = document.getElementById('chatInputInput');
			const buttonSendMessage = document.getElementById('buttonSendMessage');
			this.awaitingAgentResponse = true;
			buttonSendMessage.disabled = true;

			if (this.afClient.options.streaming) {
				SfAgentApi.sendMessageStreaming(text, (chunk) => this.afClient.onAgentMessageReceived(chunk, true))
				.catch(error => {throw error})
				.finally(() => {
					this.afClient.awaitingAgentResponse = false;
					buttonSendMessage.disabled = chatInputInput.value.length === 0;
				});

			} else {
				SfAgentApi.sendMessageSynchronous(text)
				.then(response => this.afClient.onAgentMessageReceived(response))
				.catch(error => {throw error})
				.finally(() => {
					this.awaitingAgentResponse = false;
					buttonSendMessage.disabled = chatInputInput.value.length === 0;
				});
			}
		}
		return message;
	}

	removeMessages(ids) {
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

class AfClient {
	constructor(options = {}) {
		this.uiInstances = [];
		this.session = new Session();
		this.conversation = new Conversation(this);
		this.typingTimeoutId = null;
		this.contextAreaHandlers = new Map();
		this.options = {
			streaming: false,
			initialMessages: true,
			devMode: false,
			...options
		};
	}

	async startSession() {
		try {
			const {welcomeMessage} = await this.session.startSession();
			this.addMessage('system', 'Your AI assistant is ready');
			// this.addMessage('agent', welcomeMessage);
			if (this.options.initialMessages) {
				this.addMessage('userHidden', 'My name is Elizabeth, give me the initial important messages');
			}

			document.querySelector('.add-context-button').disabled = false;

		} catch (error) {
			console.error('Error starting session:', error);
			this.addMessage('error', 'Error starting session: ' + error.message);
		}
	}

	async endSession() {
		await this.session.endSession();
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
		return uiInstance;
	}

	getUiInstance(id) {
		return this.uiInstances.find(ui => ui.id === id);
	}

	async addMessage(type, text, context = null, id, status = null) {
		const message = await this.conversation.addMessage(type, text, context, id, status);
		this.uiInstances.forEach(async ui => await message.render([ui.messageListNode]));
		this.uiInstances.filter(ui => ui.options.scrollOnResponse).forEach(ui => ui.scrollToBottom());
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

	async onAgentMessageReceived(message, isChunk = false) {

		console.log('onAgentMessageReceived');
		console.log(this.conversation.getMessages());

		if (isChunk) {

			let chunkText = '';

			// Si el chunk és un string multi-línia, busquem la línia "data: ..."
			if (typeof message === 'string') {
				const eventLine = message.split('\n').find(line => line.startsWith('event: '));
				if (eventLine && /(INFORM|END_OF_TURN)/.test(eventLine)) {
					// Si és END_OF_TURN, marquem el missatge com a finished
					if (eventLine.includes('END_OF_TURN')) {
						const lastMessage = this.conversation.getMessages().slice(-1)[0];
						if (lastMessage && lastMessage.type === 'agent' && lastMessage.status === 'streaming') {
							lastMessage.status = 'finished';
						}
					}
					return;
				}

				const dataLine = message.split('\n').find(line => line.startsWith('data: '));
				if (dataLine) {
					try {
						const dataObj = JSON.parse(dataLine.replace('data: ', ''));

						// Només agafem el text si el tipus és TextChunk
						if (dataObj?.message?.type === 'TextChunk' && typeof dataObj?.message?.message === 'string') {
							chunkText = dataObj.message.message;
						}

					} catch (e) {
						console.warn('No s\'ha pogut parsejar el JSON del chunk:', e, dataLine);
					}
				}

			} else if (message?.message?.type === 'TextChunk' && typeof message?.message?.message === 'string') {
				// Cas alternatiu: ja és un objecte i és TextChunk
				chunkText = message.message.message;
			}

			if (!chunkText) {
				console.warn('Estructura de chunk inesperada o sense text:', message);
				return;
			}

			// Busquem si ja existeix un missatge d'agent amb status 'streaming'
			let streamingMessage = this.conversation.getMessages().find(m => m.type === 'agent' && m.status === 'streaming');
			if (!streamingMessage) {
				// Si no existeix, creem el missatge nou
				await this.addMessage('agent', chunkText, null, message.id, 'streaming');
			} else {
				// Si ja existeix, només actualitzem el seu text i el renderitzem
				streamingMessage.text += chunkText;
				console.log(streamingMessage.id);
				console.log(streamingMessage.text);

				await streamingMessage.update();
				// this.uiInstances.filter(ui => ui.options.scrollOnResponse).forEach(ui => ui.scrollToBottom());
			}

		} else {
			// Check if message contains warning emoji and split it
			if (message.includes('⚠️')) {
				const warningIndex = message.indexOf('⚠️');
				const beforeWarning = message.substring(0, warningIndex).trim();
				const afterWarning = message.substring(warningIndex).trim();

				if (beforeWarning) {
					await this.addMessage('agent', beforeWarning);
				}
				if (afterWarning) {
					await this.addMessage('agentImportant', afterWarning);
				}

				document.querySelector('body').classList.add('alerts-visible');
			} else {
				await this.addMessage('agent', message);
			}

			if (this.typingTimeoutId) {
				clearTimeout(this.typingTimeoutId);
				this.typingTimeoutId = null;
			}
			const typingIndicators = this.conversation.getMessages().filter(msg => msg.type === 'typing');
			this.conversation.removeMessages(typingIndicators.map(msg => msg.id));
			const chatInputInput = document.getElementById('chatInputInput');
			const buttonSendMessage = document.getElementById('buttonSendMessage');
			buttonSendMessage.disabled = !chatInputInput.value;
		}
	}

	async startContextSelection() {
		if (!this.addingContext) {
			this.addingContext = true;

			document.querySelectorAll('.dashboard-card').forEach(card => {
				if (card.querySelector('.afclient-context-area')) {
					card.style.zIndex = 101;
					card.style.color = 'white';
				} else {
					card.style.removeProperty('z-index'); // Netegem si no toca
					card.style.removeProperty('color');
				}
			});

			document.querySelector('body').classList.toggle('afclient-is-adding-context', true);
			const contextAreas = document.querySelectorAll('.afclient-context-area');
			contextAreas.forEach(area => {
				const handler = event => this.selectContext(area, event);
				this.contextAreaHandlers.set(area, handler);
				area.addEventListener('click', handler);
			});
		} else {
			this.endContextSelection();
		}
	}

	async endContextSelection() {
		this.addingContext = false;
		document.querySelector('body').classList.remove('afclient-is-adding-context');
		const contextAreas = document.querySelectorAll('.afclient-context-area');
		contextAreas.forEach(area => {
			const handler = this.contextAreaHandlers.get(area);
			if (handler) {
				area.removeEventListener('click', handler);
				this.contextAreaHandlers.delete(area);
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

		const chatInputInput = document.getElementById('chatInputInput');
		if (node) {
			const {contextId, contextLabel} = node.dataset;
			chatInputInput.setContextItem(contextId, contextLabel);

		}

		document.querySelector('body').classList.remove('afclient-is-adding-context');
		this.endContextSelection();

		/*
		const chatInputContextIcon = document.createElement('div');
		chatInputContextIcon.className = 'chat-input-context-icon';
		chatInputContextIcon.innerHTML = '<i class="fa-solid fa-paperclip"></i>';

		const chatInputContextLabel = document.createElement('div');
		chatInputContextLabel.className = 'chat-input-context-label';
		chatInputContextLabel.title = node.dataset.contextId;
		chatInputContextLabel.textContent = node.dataset.contextLabel;

		const chatInputContextCloseButton = document.createElement('button');
		chatInputContextCloseButton.className = 'chat-input-context-close-button';
		chatInputContextCloseButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
		chatInputContextCloseButton.title = 'Remove context';
		chatInputContextCloseButton.addEventListener('click', () => this.removeContext());

		const chatInputContext = document.createElement('div');
		chatInputContext.className = 'chat-input-context';
		chatInputContext.appendChild(chatInputContextIcon);
		chatInputContext.appendChild(chatInputContextLabel);
		chatInputContext.appendChild(chatInputContextCloseButton);

		const chatInput = document.querySelector('.chat-input');
		chatInput.appendChild(chatInputContext);
		*/
	}

	async removeContext() {
		this.selectedContext.classList.remove('afclient-selected-context');
		this.selectedContext = null;
		document.querySelector('body').classList.remove('afclient-selected-context');

		document.getElementById('chatInputInput').clearContext();

		this.endContextSelection();
	}
}

export default AfClient;

document.addEventListener('DOMContentLoaded', () => {
	const chatContainer = document.createElement('div');
	chatContainer.id = 'chatContainer';
	document.body.appendChild(chatContainer);
});
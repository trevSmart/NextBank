import SfAgentApi from './api/sfAgentApi.js';

class AgentforceSession {
	constructor() {
		this.messages = [];
		this.listeners = [];
		this.sessionId = null;
	}

	async startSession() {
		if (this.sessionId) {
			return;
		}

		try {
			const welcome = await SfAgentApi.startSession();
			this.sessionId = true;
			if (welcome) {
				this.messages.push({from: 'agent', text: welcome});
				this.notify();
			}
		} catch (e) {
			console.error('Error iniciant sessió:', e);
		}
	}

	async sendMessage(msg) {
		this.messages.push({from: 'user', text: msg});
		this.notify();
		try {
			const response = await SfAgentApi.sendMessageSynchronous(this.sessionId, msg);
			this.messages.push({from: 'agent', text: response});
			this.notify();
		} catch (e) {
			console.error('Error enviant missatge:', e);
		}
	}

	onUpdate(callback) {
		if (!this.listeners.includes(callback)) {
			this.listeners.push(callback);
		}
	}

	notify() {
		for (const cb of this.listeners) {
			cb(this.messages);
		}
	}

	async endSession() {
		await SfAgentApi.endSession(this.sessionId);
		this.sessionId = false;
	}
}

const agentforceSession = new AgentforceSession();

export function createChatView(container) {
	const list = document.createElement('ul');
	const input = document.createElement('input');
	const form = document.createElement('form');

	form.appendChild(input);
	container.appendChild(list);
	container.appendChild(form);

	function render(messages) {
		list.innerHTML = '';
		messages.forEach(msg => {
			const li = document.createElement('li');
			li.textContent = `${msg.from}: ${msg.text}`;
			list.appendChild(li);
		});
	}

	agentforceSession.onUpdate(render);

	form.addEventListener('submit', e => {
		e.preventDefault();
		agentforceSession.sendMessage(input.value);
		input.value = '';
	});

	render(agentforceSession.messages);
}

export {agentforceSession};
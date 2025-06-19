export default class InputMultiline extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		//Initialize context property
		this._contextItem = null;

		const placeholder = this.getAttribute('placeholder') || '';

		//Import Font Awesome CSS into shadow DOM
		const fontAwesomeLink = document.createElement('link');
		fontAwesomeLink.rel = 'stylesheet';
		fontAwesomeLink.href = '../src/assets/fonts/fontawesome/all.min.css';
		this.shadowRoot.appendChild(fontAwesomeLink);

		const style = document.createElement('style');
		style.textContent = `
			.editable {
				display: block;
				width: 100%;
				height: 100%;
				min-height: 81px;
				max-height: 120px;
				resize: none;
				overflow-y: auto;
				padding: 0.7rem 3.5rem 0.6rem 0.9rem;
				color: white;
				background: rgba(255, 255, 255, 0.07);
				border-radius: var(--border-radius-small);
				border: none;
				font-family: var(--font-family);
				font-size: 0.8rem;
				font-weight: 200;
				// outline: none;
				// outline-color: transparent;
				margin-right: 0.7rem;
				box-sizing: border-box;
				line-height: 1.4;
				transition: all 180ms ease;
				letter-spacing: 0.8px;
				box-sizing: border-box;
				scroll-behavior: smooth;
			}

			.editable.empty:not(:focus)::before {
				content: attr(data-placeholder);
				pointer-events: none;
				color: rgba(255, 255, 255, 0.38);
				font-size: 0.8rem;
				font-weight: 200;
				letter-spacing: 0.8px;
			}

			.editable:focus,
			.editable:focus-visible,
			.editable:focus:focus-visible {
				background: rgba(255, 255, 255, 0.09);
				outline: solid 1px #6d2ea4;
			}

			.editable::-webkit-scrollbar {
				width: 6px;
			}

			.editable::-webkit-scrollbar-track {
				background: transparent;
				border-radius: 12px;
				margin-block: 6px;
			}

			.editable::-webkit-scrollbar-thumb {
				background-color: rgba(255, 255, 255, 0.2);
				border-radius: 6px;
				border: 1px solid transparent;
				background-clip: content-box;
			}

			.editable::-webkit-scrollbar-thumb:hover {
				background-color: rgba(255, 255, 255, 0.35);
				border-width: 0px;
			}

			.context-item {
				background: rgba(109, 46, 164, 0.8);
				color: white;
				padding: 0.4rem 3.5rem 0.4rem 0.9rem;
				border-radius: 0.3rem 0.3rem 0 0;
				font-size: 0.7rem;
				font-weight: 300;
				cursor: pointer;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				transition: all 0.2s ease;
				outline: solid 1px #6d2ea4;
			}

			.context-item i {
				margin-right: 6px;
				font-weight: 600;
			}

			.context-item + .editable {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
				min-height: 81px;
				max-height: 60px;
				outline: solid 1px #6d2ea4;
			}

			.context-item:hover {
				background: rgba(109, 46, 164, 1);
			}

			.context-item.hidden {
				display: none;
			}
		`;
		this.shadowRoot.appendChild(style);

		//Defineix l'HTML intern

		//Context item
		if (this.contextItem) {
			const contextItemIcon = document.createElement('i');
			contextItemIcon.className = 'fa-solid fa-paperclip';

			const chatInputContextLabel = document.createElement('span');
			chatInputContextLabel.className = 'context-item-label';
			chatInputContextLabel.title = this.contextItem.id;

			const contextItemRemoveButton = document.createElement('i');
			contextItemRemoveButton.className = 'fa-solid fa-paperclip';

			const contextItem = document.createElement('div');
			contextItem.className = 'context-item';
			contextItem.appendChild(contextItemIcon);
			contextItem.appendChild(contextItemRemoveButton);

			this.shadowRoot.appendChild(contextItem);
			this.contextItemElement = contextItem;
		}

		//Editable div
		const container = document.createElement('div');
		container.setAttribute('contenteditable', 'true');
		container.setAttribute('class', 'editable empty');
		container.setAttribute('role', 'textbox');
		container.setAttribute('aria-multiline', 'true');
		container.setAttribute('tabindex', '0');
		container.setAttribute('data-placeholder', placeholder);

		this.shadowRoot.appendChild(container);
		this.editableDiv = container;

		this.editableDiv.addEventListener('input', () => {
			const isEmpty = this.editableDiv.innerText.trim() === '';
			//Limit to 400 characters
			if (this.editableDiv.innerText.length > 400) {
				this.editableDiv.innerText = this.editableDiv.innerText.substring(0, 400);
			}
			this.editableDiv.classList.toggle('empty', isEmpty);
			this.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
		});

		this.editableDiv.addEventListener('keypress', e => {
			this.dispatchEvent(new KeyboardEvent('keypress', {
				bubbles: true, composed: true, key: e.key, code: e.code
			}));
		});

		this.editableDiv.addEventListener('keydown', e => {
			this.dispatchEvent(new KeyboardEvent('keydown', {
				bubbles: true,
				composed: true,
				key: e.key,
				code: e.code,
				shiftKey: e.shiftKey
			}));
		});

		this.editableDiv.addEventListener('paste', e => {
			e.preventDefault();
			this.editableDiv.classList.remove('empty');
			const text = (e.clipboardData || window.clipboardData).getData('text/plain');

			const selection = this.shadowRoot.getSelection ? this.shadowRoot.getSelection() : window.getSelection();
			if (!selection.rangeCount) {return}

			const range = selection.getRangeAt(0);
			range.deleteContents();

			//Divideix el text per línies i insereix cada línia amb <br> entre elles, en ordre invers
			const lines = text.split(/\r?\n/);
			for (let i = lines.length - 1; i >= 0; i--) {
				if (i < lines.length - 1) {
					range.insertNode(document.createElement('br'));
				}
				if (lines[i].length > 0) {
					range.insertNode(document.createTextNode(lines[i]));
				}
			}

			//Mou el cursor al final del que s'ha enganxat
			range.collapse(false);
			selection.removeAllRanges();
			selection.addRange(range);

			//Crea un marcador temporal per fer scroll just després del text enganxat
			const marker = document.createElement('span');
			marker.style.display = 'inline-block';
			marker.style.width = '1px';
			marker.style.height = '1em';
			marker.style.verticalAlign = 'bottom';
			range.insertNode(marker);
			marker.scrollIntoView({block: 'nearest', behavior: 'smooth'});

			//Elimina el marcador després de fer scroll
			marker.parentNode.removeChild(marker);

			//Limita el contingut a 400 caràcters (només text, sense comptar els <br>)
			let currentText = this.editableDiv.innerText;
			if (currentText.length > 400) {
				this.editableDiv.innerText = currentText.substring(0, 400);
			}

			this.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
		});

		this.editableDiv.addEventListener('drop', e => {
			e.preventDefault();
			const text = e.dataTransfer.getData('text/plain');
			const current = this.editableDiv.innerText;
			const newText = (current + text).substring(0, 400);
			this.editableDiv.innerText = newText;
			this.editableDiv.scrollTop = this.editableDiv.scrollHeight;
			const isEmpty = newText.trim() === '';
			this.editableDiv.classList.toggle('empty', isEmpty);
			this.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
		});

		this.editableDiv.addEventListener('dragover', e => {
			e.preventDefault(); //permet el drop però bloqueja el comportament predeterminat
		});
	}

	//Opcional: pots exposar funcions públiques
	get value() {
		return (this.editableDiv.innerText || '').trim();
	}

	set value(text) {
		this.editableDiv.innerText = text;
		this.editableDiv.classList.toggle('empty', text.trim() === '');
	}

	//Context methods
	get contextItem() {
		return this._contextItem;
	}

	set contextItem(contextObj) {
		if (contextObj && typeof contextObj === 'object' && contextObj.label && contextObj.id) {
			if (!this.contextItemElement) {
				this.contextItemElement = document.createElement('div');
				this.contextItemElement.className = 'context-item';

				const contextItemIcon = document.createElement('i');
				contextItemIcon.className = 'fa-solid fa-paperclip';

				const chatInputContextLabel = document.createElement('span');
				chatInputContextLabel.className = 'context-item-label';
				chatInputContextLabel.title = contextObj.id;
				chatInputContextLabel.textContent = contextObj.label;

				/*
				const chatInputContextCloseButton = document.createElement('button');
				chatInputContextCloseButton.className = 'context-item-close-button';
				chatInputContextCloseButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
				chatInputContextCloseButton.title = 'Remove context';
				chatInputContextCloseButton.addEventListener('click', () => this.clearContext());
				*/

				this.contextItemElement.appendChild(contextItemIcon);
				this.contextItemElement.appendChild(chatInputContextLabel);
				//this.contextItemElement.appendChild(chatInputContextCloseButton);

				this.shadowRoot.insertBefore(this.contextItemElement, this.editableDiv);
			}

			this._contextItem = contextObj;
			this.contextItemElement.querySelector('.context-item-label').textContent = contextObj.label;
			this.contextItemElement.querySelector('.context-item-label').title = contextObj.id;
			this.contextItemElement.dataset.contextId = contextObj.id;
			this.contextItemElement.dataset.contextLabel = contextObj.label;
			this.contextItemElement.classList.remove('hidden');

			//Dispatch a custom event when context is set
			this.dispatchEvent(new CustomEvent('contextChanged', {
				bubbles: true,
				composed: true,
				detail: {contextItem: this._contextItem}
			}));
		} else {
			this._contextItem = null;
			if (this.contextItemElement) {
				this.contextItemElement.classList.add('hidden');
			}
		}
	}

	//Method to set context
	setContextItem(contextId, contextLabel) {
		this.contextItem = {id: contextId, label: contextLabel};
	}

	//Method to clear context
	clearContext() {
		this._contextItem = null;
		if (this.contextItemElement) {
			this.contextItemElement.classList.add('hidden');
		}
		this.dispatchEvent(new CustomEvent('contextChanged', {
			bubbles: true,
			composed: true,
			detail: {contextItem: null}
		}));
	}
}

customElements.define('input-multiline', class extends InputMultiline {
	connectedCallback() {
		this.classList.add('input-multiline');
	}
});
class InputMultiline extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		const placeholder = this.getAttribute('placeholder') || '';

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
				padding: 0.7rem 3.5rem 0.7rem 0.9rem;
				color: white;
				background: rgba(255, 255, 255, 0.07);
				border-radius: var(--border-radius);
				border: none;
				font-family: var(--font-family);
				font-size: 0.8rem;
				font-weight: 200;
				outline: none;
				outline-color: transparent;
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

			.editable:focus, .editable:focus-visible,
			.editable:focus:focus-visible {
				background: rgba(255, 255, 255, 0.09);
				outline: solid 1px orange;
				border-color: green;

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
		`;
		this.shadowRoot.appendChild(style);

		//Defineix l'HTML intern
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
		return this.editableDiv.innerText.trim();
	}

	set value(text) {
		this.editableDiv.innerText = text;
		this.editableDiv.classList.toggle('empty', text.trim() === '');
	}
}

customElements.define('input-multiline', class extends InputMultiline {
	connectedCallback() {
		this.classList.add('input-multiline');
	}
});
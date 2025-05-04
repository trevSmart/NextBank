class ProgressRing extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
	}

	connectedCallback() {
		const percent = +this.getAttribute('percent') || 0;
		const size = 100;
		const color = this.getAttribute('color') || '#76e5b1';
		const bgColor = this.getAttribute('bgcolor') || '#e0e0e0';
		const stroke = +this.getAttribute('line') || 16;
		const radius = (size - stroke) / 2;
		const circumference = 2 * Math.PI * radius;
		const offset = circumference * (1 - percent / 100);
		const text = this.getAttribute('text') || percent + '%';
		const fontSize = this.getAttribute('font-size') || '52px';
		this.shadowRoot.innerHTML = `
		<style>
			svg {
				display: block;
				shape-rendering: geometricPrecision;
			}
			text {
				text-anchor: middle;
				dominant-baseline: central;
			}
		</style>
		<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" version="1.1" xmlns="http://www.w3.org/2000/svg">
			<g transform="rotate(-90, 50, 50)">
				<circle r="${radius}" cx="50" cy="50" fill="transparent" stroke="${bgColor}" stroke-width="${stroke}px"></circle>
				<circle r="${radius}" cx="50" cy="50"
					stroke="${color}"
					stroke-width="${stroke}px"
					stroke-linecap="round"
					stroke-dashoffset="${offset}px"
					stroke-dasharray="${circumference}px"
					fill="transparent"
				></circle>
			</g>
			<text x="50" y="50" fill="${color}" font-size="${fontSize}" font-weight="bold" text-anchor="middle" dominant-baseline="central">${text}</text>
		</svg>
		`;
		this._initChart();
		this._resizeObserver = new ResizeObserver(() => {
			this.update();
		});
		this._resizeObserver.observe(this);
	}

	disconnectedCallback() {
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
		}
	}

	_initChart() {
		//Implementation of _initChart method
	}

	update() {
		//Implementation of update method
	}
}

customElements.define('progress-ring', ProgressRing);
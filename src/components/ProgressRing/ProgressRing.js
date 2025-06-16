class ProgressRing extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
	}

	connectedCallback() {
		const {width, height} = getComputedStyle(this);
		let widthNum = parseFloat(width);
		let heightNum = parseFloat(height);
		if (widthNum === 0 || heightNum === 0) {
			widthNum = heightNum = 100; //mida per defecte
		}
		const size = Math.min(widthNum, heightNum);
		this.shadowRoot.host.style.height = `${size}px`;

		const percent = +this.getAttribute('percent') || 0;
		const color = this.getAttribute('color') || '#76e5b1';
		const bgColor = this.getAttribute('bgcolor') || '#e0e0e0';
		const stroke = +this.getAttribute('line') || 6;
		const scale = size / 100;
		const scaledStroke = stroke / scale;
		const radius = Math.max((100 - scaledStroke) / 2, 1);
		const circumference = 2 * Math.PI * radius;
		const offset = circumference * (1 - percent / 100);
		const text = this.getAttribute('text') || percent + '%';
		this.shadowRoot.innerHTML = `
		<style>
			.progress-ring-container {
				display: flex;
				justify-content: center;
				width: 100%;
				height: 100%;
				cursor: default;
			}
			svg {
				display: block;
				shape-rendering: geometricPrecision;
				image-rendering: -webkit-optimize-contrast;
				width: 100%;
				height: 100%;
			}
			text {
				text-anchor: middle;
				dominant-baseline: central;
				font-weight: 300;
			}
		</style>
		<div class="progress-ring-container">
			<svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<g transform="rotate(-90, 50, 50)">
					<circle r="${radius}" cx="50" cy="50" fill="transparent" stroke="${bgColor}" stroke-width="${scaledStroke}"></circle>
					<circle r="${radius}" cx="50" cy="50"
						stroke="${color}"
						stroke-width="${scaledStroke}"
						stroke-linecap="round"
						stroke-dashoffset="${offset}"
						stroke-dasharray="${circumference}"
						fill="transparent"
					></circle>
				</g>
				<text x="50" y="50" fill="${color}" text-anchor="middle" dominant-baseline="central">${text}</text>
			</svg>
		</div>
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
import mockData from './mock.js';
import { smartFetch, isProduction } from '../../utils/fetchUtils.js';

const SYMBOLS = {
	'IBM': 'IBM',
	'CRM': 'Salesforce (CRM)'
};

const INTERVAL = '1day';
const OUTPUT_SIZE = '60';
const USE_MOCK_DATA = false; // Set to true to use mock data instead of API

class StockChart extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		const { width, height } = getComputedStyle(this);
		this.shadowRoot.innerHTML = `
		<style>
			:host {
				display: block;
				font-family: sans-serif;
			}
			select, button {
				margin: 0 4px 8px 0;
			}
			.container {
				width: 100%;
				height: 100%;
				min-height: 240px;
				display: flex;
				flex-direction: column;
				justify-content: stretch;
				margin: 1px;
				box-sizing: border-box;
			}
			canvas {
				height: 100% !important;
				width: 100% !important;
				display: block;
				box-sizing: border-box;
			}
		</style>
		<div class="container">
			<canvas id="chart"></canvas>
		</div>
		`;
		this._dependenciesLoaded = false;
	}

	connectedCallback() {
		this._initChart();
	}

	async _fetchStockData(symbols) {
		if (USE_MOCK_DATA) {
			return mockData;
		}

		try {
            const url = `https://api.twelvedata.com/time_series?symbol=${symbols.join(',')}&interval=${INTERVAL}&outputsize=${OUTPUT_SIZE}`;

			// smartFetch automatically uses proxy in development and direct calls in production
			const response = await smartFetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			// In production, CORS errors are expected if API doesn't allow it
			// Fallback to mock data gracefully
			if (isProduction()) {
				console.info('Using mock data in production (API may not allow CORS):', error.message);
			} else {
				console.warn('Failed to fetch stock data from API, using mock data:', error);
			}
			return mockData;
		}
	}

	async _initChart() {
		const symbols = Object.keys(SYMBOLS);
		const stockData = await this._fetchStockData(symbols);

		let datasets = [];
		symbols.forEach((sym) => {
			const symbolData = stockData[sym];
			if (!symbolData || !symbolData.values || !Array.isArray(symbolData.values)) {
				return;
			}

			const barData = [];
			const lineData = [];

			// Process data - reverse to show oldest to newest
			const values = [...symbolData.values].reverse();
			const daysToShow = 25;
			const dataSlice = values.slice(0, daysToShow);

			for (let i = 0; i < dataSlice.length; i++) {
				const d = dataSlice[i];
				const date = new Date(d.datetime);
				const o = parseFloat(d.open);
				const h = parseFloat(d.high);
				const l = parseFloat(d.low);
				const c = parseFloat(d.close);

				const scale = 1 / 3;
				barData.push({
					x: date.valueOf(),
					o: c + (o - c) * scale,
					h: c + (h - c) * scale,
					l: c + (l - c) * scale,
					c: c
				});
				lineData.push({ x: date.valueOf(), y: c });
			}

			datasets.push({
				label: sym,
				type: 'candlestick',
				data: barData,
				fill: true,
				barThickness: 5
			});
			datasets.push({
				label: sym + ' - Closing price',
				type: 'line',
				data: lineData,
				borderColor: sym === 'IBM' ? '#7155c4' : '#936b3c',
				backgroundColor: sym === 'IBM' ? '#7155c4' : '#936b3c',
				borderWidth: 1,
				fill: false,
				tension: 0.3,
				cubicInterpolationMode: 'monotone'
			});
		});

		const canvas = this.shadowRoot.getElementById('chart');
		canvas.height = canvas.parentElement.offsetHeight;
		canvas.width = canvas.parentElement.offsetWidth;
		this._chart = new Chart(canvas.getContext('2d'), {
			type: 'candlestick',
			data: { datasets },
			options: {
				responsive: false,
				animation: false,
				scales: {
					x: {
						type: 'timeseries',
						grid: { color: '#292929' }

					},
					y: { type: 'linear', grid: { color: '#393939' } }
				},
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							filter: function (item, _chart) {
								return !item.text.includes('Change');
							},
							usePointStyle: true,
							boxHeight: 5,
							boxWidth: 8,
							generateLabels: function (chart) {
								const items = Chart.defaults.plugins.legend.labels.generateLabels(chart);
								return items.map(item => {
									const dataset = chart.data.datasets[item.datasetIndex];
									const baseLabel = dataset.label;
									const symbolKey = baseLabel.includes(' - ') ? baseLabel.split(' - ')[0] : baseLabel;
									const isLine = dataset.type === 'line';

									return {
										...item,
										text: (SYMBOLS[symbolKey] || baseLabel) + (isLine ? '' : ' (Change)'),
										pointStyle: isLine ? 'line' : 'circle',
										strokeStyle: dataset.borderColor,
										fillStyle: dataset.borderColor,
										color: dataset.borderColor,
										fontColor: dataset.borderColor
									};
								});
							}
						}
					},
					tooltip: {
						enabled: true,
						callbacks: {
							label: ctx => {
								const ohlc = ctx.raw;
								const symbol = ctx.dataset.label;
								return ohlc && ohlc.o != null ? `${symbol}: ${ohlc.o.toFixed(2)} €` : '';
							}
						}
					}
				}
			}
		});
	}

	update() {
		if (this._chart) {
			this._chart.destroy();
			this._initChart();
		}
	}

	resize() {
		const { height } = getComputedStyle(this);
		this.shadowRoot.querySelector('.container').style.height = `${height}`;
	}
}

customElements.define('stock-chart', StockChart);
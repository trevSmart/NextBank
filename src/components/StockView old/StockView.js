import {Chart, registerables} from 'https://esm.sh/chart.js';
import {CandlestickController, CandlestickElement} from 'https://esm.sh/chartjs-chart-financial';
import 'https://esm.sh/chartjs-adapter-date-fns';
import MOCK_DATA from './mock2.js';

const TEST_MODE = true;
const INTERVAL = '1h';
const OUTPUT_SIZE = '168';
const SYMBOLS = {
	'IBM': 'International Bussiness Machines (IBM)',
	'CRM': 'Salesforce (CRM)',
	'NVDA': 'NVIDIA (NVDA)'
};

Chart.register(...registerables, CandlestickController, CandlestickElement);

class StockChartCard extends HTMLElement {
	constructor() {
		super();
		this.chart = null;
		this.resizeObserver = null;
		this.stockCard = null;
	}

	async connectedCallback() {
		const {width, height} = getComputedStyle(this);
		this.innerHTML = `<canvas style="width: ${width}; height: ${height};"></canvas>`;
		const canvas = this.querySelector('canvas');

		//Observem la card contenidora
		this.stockCard = this.closest('.dashboard-card.stock');

		async function fetchStockData(symbols = []) {
			const token = '7a30623f47ae4c7da49796d280a41ebf';
			const res = await fetch('http://localhost:3000/proxy', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					method: 'GET',
					headers: {},
					url: `https://api.twelvedata.com/time_series?symbol=${symbols.join(',')}&interval=${INTERVAL}&outputsize=${OUTPUT_SIZE}&apikey=${token}`
				})
			});

			const json = TEST_MODE ? MOCK_DATA : await res.json();

			//Processem les dades per cada símbol
			let datasets = symbols.map(symbol => {
				const symbolData = json[symbol];

				if (!symbolData || !symbolData.values || !Array.isArray(symbolData.values)) {
					return null;
				}
				return {

					label: SYMBOLS[symbol] || symbol,
					type: 'candlestick',
					data: symbolData.values.map(entry => ({
						x: new Date(entry.datetime),
						o: parseFloat(entry.open),
						h: parseFloat(entry.high),
						l: parseFloat(entry.low),
						c: parseFloat(entry.close)
					})).reverse(),
					color: {
						up: symbol === 'CRM' ? '#2a8ec1' : '#d09a66',
						down: symbol === 'CRM' ? '#2a8ec1' : '#d09a66',
						unchanged: symbol === 'CRM' ? '#2a8ec1' : '#d09a66'
					},
					borderWidth: 1,
					barThickness: 4,
					borderColor: symbol === 'CRM' ? '#2a8ec1' : '#d09a66',
					options: {
						responsive: true,
					}
				};
			}).filter(dataset => dataset !== null);

			const lineDatasets = datasets.map(dataset => ({
				label: `${dataset.label} trend`,
				type: 'line',
				options: {
					responsive: true,
				},
				data: dataset.data.map(entry => ({
					x: entry.x,
					y: entry.c
				})),
				borderColor: dataset.label === 'IBM' ? '#d09a66' : '#2a8ec1',
				borderWidth: 2,
				pointRadius: 0,
				pointHoverRadius: 5,
				tension: 0.3,
				fill: false
			}));
			datasets = [...datasets, ...lineDatasets];

			return datasets;
		}

		let datasets = await fetchStockData(Object.keys(SYMBOLS));

		const allValues = datasets.flatMap(ds =>
			ds.data.map(d => d.y ?? d.l) // y per línies, l per candlestick
		);
		const min = Math.min(...allValues);
		const max = Math.max(...allValues);
		const paddingMin = min * 0.1;
		const paddingMax = max * 0.1;

		this.chart = new Chart(canvas.getContext('2d'), {
			type: 'candlestick',
			data: {datasets},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							filter: function(item, _chart) {
								return !item.text.includes('trend');
							},
							usePointStyle: true,
							boxHeight: 5,
							boxWidth: 10,
							generateLabels: function(chart) {
								const items = Chart.defaults.plugins.legend.labels.generateLabels(chart);
								return items.map(item => {
									const dataset = chart.data.datasets[item.datasetIndex];
									return {
										...item,
										strokeStyle: dataset.borderColor,
										fillStyle: dataset.borderColor,
										fontColor: dataset.borderColor, // per compatibilitat antiga
										color: dataset.borderColor // per versions modernes
									};
								});
							}
						}
					},
					tooltip: {
						enabled: true,
						callbacks: {
							label: function(ctx) {
								const ohlc = ctx.raw;
								return ohlc && ohlc.o != null ? `${ohlc.o.toFixed(2)} €` : '';
							}
						}
					},
					colors: {
						enabled: false
					}
				},
				scales: {
					x: {
						type: 'time',
						title: {display: true},
						ticks: {source: 'auto'},
						time: {
							unit: 'day',
							displayFormats: {day: 'MMM d'}
						},
						grid: {
							color: '#292929'
						}
					},
					y: {
						title: {display: true, text: 'EUR'},
						suggestedMin: min - min * 0.2,
						suggestedMax: max + max * 0.1,
						grid: {
							color: '#393939'
						}
					}
				}
			}
		});
	}

	disconnectedCallback() {
		//Destruïm el gràfic
		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}
	}
}

customElements.define('stock-chart-card', StockChartCard);
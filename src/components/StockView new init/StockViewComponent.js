class StockViewComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }
        .container {
          width: 1000px;
        }
        canvas {
          width: 1000px;
          height: 250px;
        }
        select, button {
          margin: 0 4px 8px 0;
        }
      </style>
      <h1>Chart.js - Financial chart</h1>
      <div class="container">
        <canvas id="chart"></canvas>
      </div>
      <div>
        Tipus de barra:
        <select id="type">
          <option value="candlestick" selected>Candlestick</option>
          <option value="ohlc">OHLC</option>
        </select>
        Escala:
        <select id="scale-type">
          <option value="linear" selected>Lineal</option>
          <option value="logarithmic">Logarítmica</option>
        </select>
        Color:
        <select id="color-scheme">
          <option value="muted" selected>Suau</option>
          <option value="neon">Neó</option>
        </select>
        Vora:
        <select id="border">
          <option value="true" selected>Sí</option>
          <option value="false">No</option>
        </select>
        Mixt:
        <select id="mixed">
          <option value="true">Sí</option>
          <option value="false" selected>No</option>
        </select>
        <button id="update">Actualitza</button>
        <button id="randomizeData">Aleatoritza</button>
      </div>
    `;
    this._dependenciesLoaded = false;
  }

  connectedCallback() {
    this._loadDependencies().then(() => {
      this._initChart();
      this._addEventListeners();
    });
  }

  async _loadDependencies() {
    if (this._dependenciesLoaded) return;
    // Carrega Luxon
    if (!window.luxon) {
      await this._loadScript('https://cdn.jsdelivr.net/npm/luxon@3.4.4');
    }
    // Carrega Chart.js
    if (!window.Chart) {
      await this._loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js');
    }
    // Carrega l'adaptador Luxon
    if (!window.Chart._adapters || !window.Chart._adapters._date) {
      await this._loadScript('https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.3.1');
    }
    // Carrega el plugin financer
    if (!window.Chart.registry.getPlugin('financial')) {
      await this._loadScript(this._getLocalUrl('chartjs-chart-financial.js'));
    }
    this._dependenciesLoaded = true;
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  _getLocalUrl(filename) {
    // Assumeix que el component es troba a src/components/StockView
    return new URL(filename, import.meta.url).href;
  }

  _initChart() {
    const barCount = 60;
    const initialDateStr = new Date().toUTCString();
    const barData = new Array(barCount);
    const lineData = new Array(barCount);
    this._getRandomData(initialDateStr, barData, lineData);
    const canvas = this.shadowRoot.getElementById('chart');
    canvas.width = 1000;
    canvas.height = 250;
    this._chart = new window.Chart(canvas.getContext('2d'), {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'CHRT - Chart.js Corporation',
            data: barData,
          },
          {
            label: 'Preu de tancament',
            type: 'line',
            data: lineData,
            hidden: true,
          }
        ]
      },
      options: {
        responsive: false,
        scales: {
          x: { type: 'timeseries' },
          y: { type: 'linear' }
        }
      }
    });
    this._barData = barData;
    this._lineData = lineData;
    this._initialDateStr = initialDateStr;
  }

  _randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  _randomBar(target, index, date, lastClose) {
    const open = +this._randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
    const close = +this._randomNumber(open * 0.95, open * 1.05).toFixed(2);
    const high = +this._randomNumber(Math.max(open, close), Math.max(open, close) * 1.1).toFixed(2);
    const low = +this._randomNumber(Math.min(open, close) * 0.9, Math.min(open, close)).toFixed(2);
    if (!target[index]) target[index] = {};
    Object.assign(target[index], {
      x: date.valueOf(),
      o: open,
      h: high,
      l: low,
      c: close
    });
  }

  _getRandomData(dateStr, barData, lineData) {
    const DateTime = window.luxon.DateTime;
    let date = DateTime.fromRFC2822(dateStr);
    for (let i = 0; i < barData.length;) {
      date = date.plus({ days: 1 });
      if (date.weekday <= 5) {
        this._randomBar(barData, i, date, i === 0 ? 30 : barData[i - 1].c);
        lineData[i] = { x: barData[i].x, y: barData[i].c };
        i++;
      }
    }
  }

  _addEventListeners() {
    const shadow = this.shadowRoot;
    const update = () => {
      const chart = this._chart;
      const dataset = chart.config.data.datasets[0];
      // Tipus de gràfic
      const type = shadow.getElementById('type').value;
      chart.config.type = type;
      // Escala
      const scaleType = shadow.getElementById('scale-type').value;
      chart.config.options.scales.y.type = scaleType;
      // Color
      const colorScheme = shadow.getElementById('color-scheme').value;
      if (colorScheme === 'neon') {
        chart.config.data.datasets[0].backgroundColors = {
          up: '#01ff01',
          down: '#fe0000',
          unchanged: '#999',
        };
      } else {
        delete chart.config.data.datasets[0].backgroundColors;
      }
      // Vora
      const border = shadow.getElementById('border').value;
      if (border === 'false') {
        dataset.borderColors = 'rgba(0, 0, 0, 0)';
      } else {
        delete dataset.borderColors;
      }
      // Mixt
      const mixed = shadow.getElementById('mixed').value;
      chart.config.data.datasets[1].hidden = mixed !== 'true';
      chart.update();
    };
    shadow.getElementById('update').addEventListener('click', update);
    shadow.getElementById('randomizeData').addEventListener('click', () => {
      this._getRandomData(this._initialDateStr, this._barData, this._lineData);
      update();
    });
    shadow.querySelectorAll('select').forEach(el => el.addEventListener('change', update));
  }
}

customElements.define('stock-chart', StockViewComponent);
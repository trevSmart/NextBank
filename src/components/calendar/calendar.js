class Calendar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});

		//font-family: "Poppins", sans-serif;

		const style = document.createElement('style');
		style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            :host {
                display: block;
				font-family: "Poppins", sans-serif;
                font-size: 11px;
            }

            .container {
				width: 100%;
				height: auto;
                color: #eee;
                display: flex;
                justify-content: center;
                align-items: stretch;
				border-radius: 10px;
            }

            .calendar {
                width: 100%;
                height: 100%;
                max-height: 100%;
                border-radius: 10px;
				display: flex;
				flex-direction: column;
				cursor: default;
            }

            .month {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 1rem;
                text-align: center;
                text-shadow: 0 0.3rem 0.5rem rgba(0, 0, 0, 0.5);
                border-radius: 10px;
            }

            .month i {
                cursor: pointer;
            }

            .month h1 {
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.2rem;

            }

            .month p {
            }

            .weekdays {
                margin: 16px 0 1px;
                width: 100%;
                padding: 0 0.4rem;
                display: flex;
                align-items: center;
				font-weight: 300;
            }

            .weekdays div {
                letter-spacing: 0.1rem;
                width: calc(100% / 7);
                display: flex;
                justify-content: center;
                align-items: center;
                text-shadow: 0 0.3rem 0.5rem rgba(0, 0, 0, 0.5);
            }

            .days {
                width: 100%;
                display: flex;
                padding: 0.2rem;
				gap: 6px;
            }

            .days div {
                margin: 0;
                width: calc(100% / 7);
                /* aspect-ratio: 1 / 1;  removed for manual sizing */
                display: flex;
                justify-content: center;
                align-items: center;
                text-shadow: 0 0.3rem 0.5rem rgba(0, 0, 0, 0.5);
                transition: background-color 250ms ease-out;
                border-radius: 4px;
				font-weight: 200;
            }

            .days .month-view div:hover:not(.today) {
                background-color: #892ead60;
                border: 1px solid #832faca8;
                cursor: pointer;
            }

            .prev-date,
            .next-date {
                opacity: 0.5;
            }

            .days div.today {
                background-color: #562f68;
                border-radius: 50%;
            }

			.days-wrapper {
				position: relative;
				width: 100%;
				overflow: hidden;
			}

			.days {
				display: flex;
				width: 200%;
				transition: transform 400ms ease-in-out, opacity 400ms ease-in-out;
				will-change: transform;
				align-items: start;
			}

			.days .month-view {
				width: 50%;
				display: flex;
				flex-wrap: wrap;
				padding: 0 0.4rem;
				gap: 6px;
			}

            .days .month-view div {
				aspect-ratio: 1 / 1;
				width: calc((100% - 6px * 6) / 7);
				height: auto;
			}

			/* Highlight context areas and selected context from outside (body class) */
			:host-context(body.afclient-is-adding-context) .afclient-context-area {
				position: relative;
				overflow: visible;
				cursor: pointer;
			}

			:host-context(body.afclient-is-adding-context) .afclient-context-area::after {
				content: "";
				position: absolute;
				height: calc(100% + 4px);
				width: calc(100% + 4px);
				top: -2px;
				left: -2px;
				pointer-events: none;
				z-index: 1;
				border-radius: 6px;
				animation: context-area-adding-context-kf 420ms infinite alternate;
			}

			:host-context(body) .afclient-selected-context {
				background: rgba(145, 27, 255, 0.3);
				border-radius: 6px;
			}

			@keyframes context-area-adding-context-kf {
				from { background-color: rgba(145, 27, 255, 0.1); }
				to { background-color: rgba(145, 27, 255, 0.2); }
			}
        `;

		const fontAwesome = document.createElement('link');
		fontAwesome.rel = 'stylesheet';
		fontAwesome.href = '../src/assets/fonts/fontawesome/all.min.css';

		fontAwesome.crossOrigin = 'anonymous';

		const wrapper = document.createElement('div');
		wrapper.innerHTML = `
            <div class="container">
                <div class="calendar">
                    <div class="month">
                        <i class="fa-solid fa-angle-left prev"></i>
                        <div class="date">
                            <h1></h1>
                            <p style="display: none;"></p>
                        </div>
                        <i class="fa-solid fa-angle-right next"></i>
                    </div>
                    <div class="weekdays">
						<div>MO</div>
						<div>TU</div>
						<div>WE</div>
						<div>TH</div>
						<div>FR</div>
						<div>SA</div>
						<div>SU</div>
                    </div>
                    <div class="days-wrapper">
                        <div class="days"></div>
                    </div>
                </div>
            </div>
        `;

		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(fontAwesome);
		this.shadowRoot.appendChild(wrapper);

		this.date = new Date();

		// Map of ISO date (YYYY-MM-DD) -> { id, label }
		// Add here the days that should behave as selectable chat context
		this.contextDays = new Map([
			['2025-10-08', { id: 'cal-2025-10-08', label: 'Calendar day October 8, 2025' }],
		]);
	}

	connectedCallback() {
		this.renderCalendar();
		this.shadowRoot.querySelector('.prev').addEventListener('click', () => {
			this.renderCalendar(-1);
		});
		this.shadowRoot.querySelector('.next').addEventListener('click', () => {
			this.renderCalendar(1);
		});
	}

	renderCalendar(direction = 0) {
		const daysContainer = this.shadowRoot.querySelector('.days');
		//const wrapper = this.shadowRoot.querySelector('.days-wrapper');

		const currentDate = new Date(this.date);
		const displayDate = new Date(this.date);

		if (direction !== 0) {
			displayDate.setMonth(displayDate.getMonth() + direction);
		}

		const createMonthHTML = date => {
			const year = date.getFullYear();
			const month = date.getMonth();
			const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
			const lastDay = new Date(year, month + 1, 0).getDate();
			const prevLastDay = new Date(year, month, 0).getDate();
			const lastDayIndex = (new Date(year, month + 1, 0).getDay() + 6) % 7;
			const nextDays = (7 - lastDayIndex - 1) % 7;

			const today = new Date();
			const todayDate = today.getDate();
			const todayMonth = today.getMonth();
			const todayYear = today.getFullYear();

			let days = '';

			for (let x = firstDayIndex; x > 0; x--) {
				days += `<div class="prev-date">${prevLastDay - x + 1}</div>`;
			}

			for (let i = 1; i <= lastDay; i++) {
				const isToday = i === todayDate && month === todayMonth && year === todayYear;
				const classes = [];
				if (isToday) {
					classes.push('today');
				}
				const isoMonth = String(month + 1).padStart(2, '0');
				const isoDay = String(i).padStart(2, '0');
				const dateKey = `${year}-${isoMonth}-${isoDay}`;
				const context = this.contextDays.get(dateKey);
				if (context) {
					classes.push('afclient-context-area');
					days += `<div class="${classes.join(' ')}" data-context-id="${context.id}" data-context-label="${context.label}">${i}</div>`;
				} else {
					days += `<div class="${classes.join(' ')}">${i}</div>`;
				}
			}

			for (let j = 1; j <= nextDays; j++) {
				days += `<div class="next-date">${j}</div>`;
			}

			return `<div class="month-view">${days}</div>`;
		};

		//Si no és swipe, render normal
		if (direction === 0) {
			daysContainer.innerHTML = createMonthHTML(this.date);
			this.updateHeader();
			return;
		}

		//swipe animat
		const fromHTML = createMonthHTML(currentDate);
		const toHTML = createMonthHTML(displayDate);

		daysContainer.innerHTML = direction === 1 ? fromHTML + toHTML : toHTML + fromHTML;

		daysContainer.style.transition = 'none';
		daysContainer.style.transform = direction === 1 ? 'translateX(0%)' : 'translateX(-50%)';
		//daysContainer.style.opacity = direction === 1 0;
		//daysContainer.offsetWidth; //força reflow

		//trigger animació

		daysContainer.addEventListener('transitionend', () => {
			this.date = displayDate;
			this.updateHeader();
			daysContainer.style.transition = 'none';
			daysContainer.style.transform = 'translateX(0%)';
			//daysContainer.style.opacity = 1;
			daysContainer.innerHTML = createMonthHTML(this.date);
		}, {once: true});


		requestAnimationFrame(() => {
			daysContainer.style.transition = 'transform 300ms ease';
			daysContainer.style.transform = direction === 1 ? 'translateX(-50%)' : 'translateX(0%)';
			//daysContainer.style.opacity = direction === 1 ? 0 : 1;
		});

		//finalitzar animació i deixar només el mes nou

	}

	updateHeader() {
		const months = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];

		this.shadowRoot.querySelector('.date h1').innerText = `${months[this.date.getMonth()]} ${this.date.getFullYear()}`;
		this.shadowRoot.querySelector('.date p').innerText = new Date().toDateString();
	}
}

customElements.define('custom-calendar', Calendar);
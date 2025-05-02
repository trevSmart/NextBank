'use strict';

import ChatWidget from '../src/components/agentforceClient/script.js';
import './components/calendar/calendar.js';

//Variables globals
let resizeCleanupFunctions = [];
let cardsCleanupFunctions = [];
let navigationCleanupFunctions = [];
let dataUpdateInterval;

//Funcions de navegació del calendari
function loadDaySchedule() {
	const calDevice = document.querySelector('calendar-component').shadowRoot.querySelector('.cal-device');
	if (calDevice) {
		//Afegim la classe que mostra la vista d'agenda
		calDevice.querySelector('.cal-bar .-schedule').style.opacity = '1';
		calDevice.querySelector('.cal-bar .-calendar').style.opacity = '0';
		calDevice.querySelector('.cal-scene.-schedule').style.opacity = '1';
		calDevice.querySelector('.cal-scene.-schedule').style.zIndex = '2';
	}
}

function showMainView() {
	const calDevice = document.querySelector('calendar-component').shadowRoot.querySelector('.cal-device');
	if (calDevice) {
		//Tornem a la vista principal
		calDevice.querySelector('.cal-scene.-calendar').style.opacity = '1';
		calDevice.querySelector('.cal-scene.-calendar').style.zIndex = '1';
		calDevice.querySelector('.cal-bar .-schedule').style.opacity = '0';
		calDevice.querySelector('.cal-bar .-calendar').style.opacity = '1';
		calDevice.querySelector('.cal-scene.-schedule').style.opacity = '0';
		calDevice.querySelector('.cal-scene.-schedule').style.zIndex = '-1';

		//Resetegem la posició dels mesos
		const months = calDevice.querySelectorAll('.cal-month');
		months.forEach(month => {
			month.style.transform = '';
			month.querySelectorAll('.cal-header').forEach(header => {
				header.style.transform = '';
				header.style.opacity = '';
			});
		});
	}
}

function loadWeekSchedule(weekId) {
	const calDevice = document.querySelector('calendar-component').shadowRoot.querySelector('.cal-device');
	if (!calDevice) {return}

	const [month, week] = weekId.split('-');
	const monthElement = calDevice.querySelector(`.cal-month.-${month}`);
	if (!monthElement) {return}

	//Resetegem primer tot
	showMainView();

	//Preparem variables que podrem necessitar
	const octHeader = calDevice.querySelector('.cal-month.-october .cal-header');

	//Apliquem les transformacions segons la setmana
	switch (weekId) {
		case 'oct-week-3':
			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(1, true))';
			break;

		case 'oct-week-4':
			monthElement.style.transform = 'translateY(-' + monthElement.offsetHeight + 'px)';
			monthElement.querySelector('.cal-header').style.transform =
				'translateY(' + monthElement.offsetHeight + 'px) translateX(' + monthElement.offsetWidth * 4 / 7 + 'px)';
			calDevice.querySelector('.cal-scene.-calendar').style.boxShadow = 'shadows(2)';
			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(2, true))';
			break;

		case 'nov-week-1':
			monthElement.style.transform = 'translateY(-' + monthElement.offsetHeight * 2 + 'px)';
			if (octHeader) {
				octHeader.style.transform =
					'translateY(' + monthElement.offsetHeight + 'px) translateX(' + monthElement.offsetWidth * 4 / 7 + 'px)';
				octHeader.style.opacity = '0';
			}

			//Activem desembre i desactivem novembre
			calDevice.querySelector('.cal-month.-december').classList.add('active-month');
			calDevice.querySelector('.cal-month.-november').classList.remove('active-month');

			calDevice.querySelector('.cal-app').style.background = 'linear-gradient(shadows(3, true))';
			calDevice.querySelector('.cal-scene.-calendar').style.boxShadow = 'shadows(3)';
			break;
	}
}

function showDevelopmentMessage(section) {
	//Implementar la lògica per mostrar missatges de desenvolupament
}

function updateRandomBalance() {
	const balanceElement = document.querySelector('.saldo-amount');
	const changeElement = document.querySelector('.saldo-change');

	if (balanceElement && changeElement) {
		const percentageChange = (Math.random() - 0.5) * 1;
		const isPositive = percentageChange > 0;

		changeElement.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            ${percentageChange.toFixed(2)}% this month
        `;

		changeElement.className = `saldo-change ${isPositive ? 'positive' : 'negative'}`;
	}
}

function simulateDataUpdates() {
	updateRandomBalance();
	dataUpdateInterval = setInterval(updateRandomBalance, 30000);
}

function initializeCards() {
	const buttonPopoutChat = document.querySelector('button.popoutChat');
	if (buttonPopoutChat) {
		buttonPopoutChat.addEventListener('click', () => {
			//Implementar la lògica del botó popout
		});
	}
}

function initializeNavigation() {
	const links = document.querySelectorAll('nav a');

	function handleClick(e) {
		e.preventDefault();
		links.forEach(l => l.classList.remove('active'));
		this.classList.add('active');
		showDevelopmentMessage(this.textContent.trim());
	}

	links.forEach(link => {
		link.addEventListener('click', handleClick);
		navigationCleanupFunctions.push(() => {
			link.removeEventListener('click', handleClick);
		});
	});

	const supportButton = document.querySelector('.support-button');
	const supportPopover = document.querySelector('.support-popover');

	if (supportButton && supportPopover) {
		const handleMouseEnter = () => supportPopover.classList.add('visible');
		const handleMouseLeave = () => supportPopover.classList.remove('visible');

		supportButton.addEventListener('mouseenter', handleMouseEnter);
		supportButton.addEventListener('mouseleave', handleMouseLeave);

		navigationCleanupFunctions.push(() => {
			supportButton.removeEventListener('mouseenter', handleMouseEnter);
			supportButton.removeEventListener('mouseleave', handleMouseLeave);
		});
	}
}

function initializeResizeHandling() {
	const assistantCard = document.querySelector('.dashboard-card.assistant');
	const resizeHandle = document.querySelector('.resize-handle');
	let isResizing = false;
	let startX;
	let startWidth;

	function resize(e) {
		if (!isResizing) {return}
		const width = startWidth - (e.pageX - startX);
		if (width >= 300 && width <= 800) {
			assistantCard.style.width = `${width}px`;
		}
	}

	function stopResize() {
		if (!isResizing) {return}
		isResizing = false;
		resizeHandle.classList.remove('active');
		document.removeEventListener('mousemove', resize);
		document.removeEventListener('mouseup', stopResize);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}

	function startResize(e) {
		isResizing = true;
		startX = e.pageX;
		startWidth = assistantCard.offsetWidth;
		resizeHandle.classList.add('active');
		document.addEventListener('mousemove', resize);
		document.addEventListener('mouseup', stopResize);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	}

	if (resizeHandle) {
		resizeHandle.addEventListener('mousedown', startResize);
		resizeCleanupFunctions.push(() => {
			resizeHandle.removeEventListener('mousedown', startResize);
			document.removeEventListener('mousemove', resize);
			document.removeEventListener('mouseup', stopResize);
		});
	}
}

function initializeCalendar() {
	customElements.whenDefined('calendar-component').then(() => {
		const calendar = document.querySelector('calendar-component');
		if (calendar) {
			calendar.setNavigationCallback(action => {
				switch (action) {
					case 'schedule':
						loadDaySchedule();
						break;
					case 'index':
						showMainView();
						break;
					default:
						if (action && action.includes('week')) {
							loadWeekSchedule(action);
						}
				}
			});
		}
	});
}

function initializeDashboard() {
	initializeResizeHandling();
	initializeNavigation();
	initializeCards();
	simulateDataUpdates();
	initializeCalendar();

	//Inicialitzem el xat
	ChatWidget.init();
}

function cleanup() {
	//Netejar tots els event listeners
	resizeCleanupFunctions.forEach(fn => fn());
	cardsCleanupFunctions.forEach(fn => fn());
	navigationCleanupFunctions.forEach(fn => fn());

	//Netejar intervals
	if (dataUpdateInterval) {
		clearInterval(dataUpdateInterval);
	}

	//Buidar els arrays de cleanup
	resizeCleanupFunctions = [];
	cardsCleanupFunctions = [];
	navigationCleanupFunctions = [];
}

//Event listeners principals
document.addEventListener('DOMContentLoaded', () => {
	initializeDashboard();
	window.addEventListener('beforeunload', cleanup);
});